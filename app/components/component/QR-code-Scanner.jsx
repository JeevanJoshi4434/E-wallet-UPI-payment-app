import React, { useState } from "react";
import Scanner from '@/components/component/CustomScanner.jsx'
import Link from "next/link";
export default function QRCodeScanner() {
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (data) => {
    setScanResult(data);
    console.log("QR Code Data:", data);
  };

  const handleError = (err) => {
    console.log("QR Scanner Error:", err);
  };

  return (
    <div className="container mx-auto text-center p-4">
      <h1 className="text-2xl font-bold mb-4">Pay with QR Code</h1>
      <Scanner onScan={handleScan} onError={handleError} />
      {scanResult && (
        <div className="mt-4 p-2 border rounded">
          <p>Preparing to payment page</p>
        </div>
      )}
    </div>
  );
}
