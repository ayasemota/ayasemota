"use client";

import { useState, useEffect } from "react";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import Logo from "@/components/Logo";

export default function SetupTotpPage() {
  const [secret] = useState(() => {
    const newSecret = new OTPAuth.Secret({ size: 20 });
    return newSecret.base32;
  });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [testCode, setTestCode] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!secret) return;

    const totp = new OTPAuth.TOTP({
      issuer: "Admin",
      label: "ayasemota",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    QRCode.toDataURL(totp.toString(), { width: 256 }).then(setQrCodeUrl);
  }, [secret]);

  const handleVerify = () => {
    if (!secret) return;

    const totp = new OTPAuth.TOTP({
      issuer: "Admin",
      label: "ayasemota",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    const delta = totp.validate({ token: testCode, window: 2 });
    console.log(
      "Validation result:",
      delta,
      "Code:",
      testCode,
      "Secret:",
      secret,
    );
    setVerificationStatus(delta !== null ? "success" : "error");
  };

  const copySecret = () => {
    navigator.clipboard.writeText(`NEXT_PUBLIC_TOTP_SECRET=${secret}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-dvh bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <div className="flex flex-col justify-center items-center text-center mb-6">
          <Logo />
          <h1 className="text-3xl font-bold text-gray-900 my-2">
            Setup Google Authenticator
          </h1>
          <p className="text-gray-600">
            Scan this QR code with your authenticator app
          </p>
        </div>

        {qrCodeUrl && (
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="TOTP QR Code"
              className="rounded-lg border-2 border-gray-200"
              width={256}
              height={256}
            />
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Manual entry key:</p>
          <code className="text-lg font-mono bg-white px-3 py-1 rounded border block text-center break-all">
            {secret || "Generating..."}
          </code>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test your code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={testCode}
              onChange={(e) => {
                setTestCode(e.target.value.replace(/\D/g, ""));
                setVerificationStatus("idle");
              }}
              placeholder="Enter 6-digit code"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-xl font-mono"
            />
            <button
              onClick={handleVerify}
              disabled={testCode.length !== 6 || !secret}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Verify
            </button>
          </div>
          {verificationStatus === "success" && (
            <p className="text-green-600 text-sm mt-2 font-medium">
              ✓ Code verified successfully!
            </p>
          )}
          {verificationStatus === "error" && (
            <p className="text-red-600 text-sm mt-2 font-medium">
              ✗ Invalid code. Try again.
            </p>
          )}
        </div>

        {verificationStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 mb-3">
              <strong>Setup complete!</strong> Copy this to your{" "}
              <code className="bg-green-100 px-1 rounded">.env.local</code>{" "}
              file:
            </p>
            <div className="flex gap-2">
              <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border block break-all">
                NEXT_PUBLIC_TOTP_SECRET={secret}
              </code>
              <button
                onClick={copySecret}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-green-700 mt-3">
              After adding to .env.local, restart the dev server and delete this
              setup page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
