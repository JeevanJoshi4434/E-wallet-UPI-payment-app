import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import { HiDownload } from "react-icons/hi";

function PaymentCard({ user }) {
    const cardRef = useRef(null);

    const handleCapture = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            const dataUrl = canvas.toDataURL('image/png');

            // To display as an image
            const img = document.createElement('img');
            img.src = dataUrl;
            document.body.appendChild(img);

            // Alternatively, for download
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'payment-card.png';
            link.click();
        }
    };
    const [QRData, setQRData] = useState(
        {
            type: 1,
            name: user.name,
            contact: user.number,
            payID: user.payid,
            amount: null,
            date: user.created_at,
            TTL: null,
            payURL: `${process.env.NEXT_PUBLIC_URL}/payment/pay?to=${user.payid}&name=${user.name}&tel=${user.number}`
        }
    )

    


    return (
        <div>
            <div ref={cardRef} className="grid grid-cols-1 gap-2 items-center text-center justify-center">
                <h2 className="text-sm font-semibold">Pay with Payment-Karo</h2>
                <p className="text-sm font-semibold my-2 flex flex-col items-center justify-center">
                    {user.name} <span className="text-xs font-normal">{user.number}</span>
                </p>
                <div className="flex flex-col items-center justify-center border border-input rounded-md p-2">
                    <QRCode
                        style={{ height: "auto", width: "225px" }}
                        value={JSON.stringify(QRData)}
                        viewBox="0 0 256 256"
                    />
                </div>
                <p className="text-sm font-semibold my-2">
                    <span className="text-sm font-normal">PayID:</span> {user.payid}
                </p>
            </div>

            <button onClick={handleCapture} title='Save QR Code as Image' className="mt-4 p-2 text-black bg-white rounded"><HiDownload /></button>
        </div>
    );
}

export default PaymentCard;
