"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import { verifyTime } from "../utils/time";
import Link from "next/link";

export default function Scanner({ onScan, onError, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [scanning, setScanning] = useState(true);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(true); // New state to control scanner open status
    const [url, setUrl] = useState("");
    const initializeCamera = useCallback(async () => {
        if (!isScannerOpen) return; // Only initialize camera if scanner is open

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error("Camera access is not supported by this browser.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsinline", true);
                await videoRef.current.play();
                setLoading(false);
                requestAnimationFrame(tick);
            }
        } catch (err) {
            console.log("Camera initialization error:", err);
            setLoading(false);
            onError && onError(err);
        }
    }, [onError, isScannerOpen]);

    // Stop the camera
    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        if (isScannerOpen) {
            initializeCamera();
        }

        return () => {
            stopCamera();
        };
    }, [initializeCamera, isScannerOpen]);

    const tick = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                setData(code.data);
                setScanning(false);
                onScan && onScan(code.data);
                stopCamera(); // Stop the camera once code is found
                // console.log(code.data);
                const red = redirectURL(code.data === typeof String ? JSON.parse(code.data) : code.data.toString());

            } else if (scanning) {
                requestAnimationFrame(tick);
            }
        }
    };

    function redirectURL(QRData = null) {
        if (QRData.TTL && !verifyTime(QRData.date, TTL)) {
            window.alert("QR isn't working anymore. Request a new one.");
        }
        if (QRData && QRData.type && QRData.type === 1) {
            setUrl(QRData.payURL);
            window.location.href = QRData.payURL;
        } else if (QRData) {
            const upiRegex = /^upi:\/\/pay\?.+/;
            if (!upiRegex.test(QRData)) {
                return false;
            }
            const payURL = `${process.env.NEXT_PUBLIC_URL}/payment/pay?${QRData.slice(10, QRData.length)}&&type=upi`;
            setUrl(payURL);
            window.location.href = payURL;
        }
        else {
            return false;
        }
    }

    const handleClose = () => {
        stopCamera();
        setScanning(false);
        setIsScannerOpen(false); // Set scanner status to closed
        onClose && onClose();
    };

    return (
        <div className="qr-scanner flex items-center justify-center flex-col">
            <video
                ref={videoRef}
                className="hidden max-w-96 max-h-96 rounded-md"
                onCanPlay={() => setLoading(false)}
                onError={(err) => {
                    console.error("Video error:", err);
                    onError && onError(err);
                }}
            />
            {!data && <canvas ref={canvasRef} className="w-full rounded-md h-auto max-w-96 max-h-96" />}
            {loading && <p>Loading camera...</p>}
            {data && (
                <div className="scanned-data">
                    <Link href={url}>Redirecting (if not redirected click here)</Link>
                </div>
            )}
            {!data && !loading && <p>Scanning for QR Code...</p>}
            <button onClick={handleClose} className="close-button">Close Scanner</button>
        </div>
    );
}
