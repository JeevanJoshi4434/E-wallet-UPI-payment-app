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
    
    let animationFrameId;

   const initializeCamera = useCallback(async () => {
    try {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Camera access is not supported by this browser.");
        }

        // Get all video input devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(devices);
        const videoDevices = devices.filter(device => device.kind === "videoinput");

        // Find the "main" back camera
        let mainBackCamera = videoDevices.find(device =>
            device.label.toLowerCase().includes("back") &&
            device.label.toLowerCase().includes("main")
        );

        // Fallback to the first back camera if "main" isn't found
        if (!mainBackCamera) {
            mainBackCamera = videoDevices.find(device =>
                device.label.toLowerCase().includes("back")
            );
        }

        // Use the selected device ID to access the correct camera
        const constraints = mainBackCamera
            ? { video: { deviceId: mainBackCamera.deviceId } }
            : { video: { facingMode: "environment" } }; // Fallback to default behavior

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

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
}, [onError]);



    const tick = () => {
        if (canvasRef.current && videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;
    
            if (videoWidth === 0 || videoHeight === 0) {
                requestAnimationFrame(tick); // Wait for video to initialize
                return;
            }
    
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            canvas.width = videoWidth;
            canvas.height = videoHeight;
    
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
    
            if (code) {
                setData(code.data);
                setScanning(false);
                onScan && onScan(code.data);
                stopCamera(); // Stop the camera once code is found
                redirectURL(code.data); // Redirect to the correct URL
            } else if (scanning) {
                requestAnimationFrame(tick);
            }
        }
    };
    

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); // Stop animation loop
            animationFrameId = null;
        }
    };


    function redirectURL(QRData = "") {
        try {
            let parsedData = QRData.startsWith("upi://") ? QRData : JSON.parse(QRData);
    
            if (parsedData.TTL && !verifyTime(parsedData.date, TTL)) {
                alert("QR isn't working anymore. Request a new one.");
                return;
            }
    
            if (parsedData?.type === 1) {
                setUrl(parsedData.payURL);
                window.location.href = parsedData.payURL;
            } else {
                const upiRegex = /^upi:\/\/pay\?.+/;
                if (upiRegex.test(parsedData)) {
                    const payURL = `${process.env.NEXT_PUBLIC_URL}/payment/pay?${parsedData.slice(10)}&&type=upi`;
                    setUrl(payURL);
                    window.location.href = payURL;
                } else {
                    console.warn("Invalid QR data format");
                }
            }
        } catch (err) {
            console.error("Error parsing QR data:", err);
            alert("Failed to process QR Code.");
        }
    }
    

    const handleClose = () => {
        stopCamera();
        setScanning(false);
        setIsScannerOpen(false); // Set scanner status to closed
        onClose && onClose();
    };

   
    useEffect(() => {
        if (isScannerOpen) {
            initializeCamera();
        }
    
        return () => {
            stopCamera(); // Cleanup on unmount or when scanner closes
        };
    }, [initializeCamera, isScannerOpen]);

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
            {!data && <canvas ref={canvasRef} className="w-full border-black border-2 rounded-md h-auto max-w-96 max-h-96" />}
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
