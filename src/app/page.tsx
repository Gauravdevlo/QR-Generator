"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import {
  Download,
  Copy,
  Check,
  QrCode,
  Link,
  Wifi,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

const QUICK_PRESETS = [
  { icon: Link, label: "URL", value: "https://example.com" },
  {
    icon: Wifi,
    label: "WiFi",
    value: "WIFI:T:WPA;S:NetworkName;P:password123;;",
  },
  { icon: Mail, label: "Email", value: "mailto:hello@example.com" },
  { icon: Phone, label: "Phone", value: "tel:+11234567890" },
  {
    icon: UserRound,
    label: "vCard",
    value: "BEGIN:VCARD\nVERSION:3.0\nFN:Jane Doe\nTEL:+11234567890\nEND:VCARD",
  },
];

function getQrUrl(text: string, size = 300): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=000000&color=ffffff&format=png&margin=16`;
}

export default function QRGeneratorPage() {
  const [input, setInput] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setQrValue("");
      return;
    }
    setLoading(true);
    setQrValue(trimmed);
    setHistory((h) => [trimmed, ...h.filter((x) => x !== trimmed)].slice(0, 5));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commit(e.target.value), 500);
  };

  const handlePreset = (value: string) => {
    setInput(value);
    commit(value);
  };

  const handleDownload = async () => {
    if (!qrValue) return;
    try {
      const res = await fetch(getQrUrl(qrValue, 512));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleCopy = async () => {
    if (!qrValue) return;
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Mesh Gradient Background */}
      <MeshGradient
        className="!fixed inset-0 w-full h-full"
        colors={["#000000", "#111111", "#222222", "#ffffff"]}
        speed={0.6}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          backgroundColor: "#000000",
        }}
      />

      {/* Subtle overlay dots */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div
          className="absolute top-1/4 left-1/3 w-40 h-40 bg-white/[0.015] rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: "3.5s", animationDelay: "1s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <QrCode className="w-4 h-4 text-white/30" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-mono">
              qr generator
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Generate. <span className="text-white/40">Share.</span>
          </h1>
          <p className="mt-2 text-xs text-white/20 font-mono tracking-wide">
            valid · instant · minimal
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-[560px] rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* QR Display */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <div className="relative w-[200px] h-[200px] rounded-xl border border-white/[0.06] bg-black/60 flex items-center justify-center overflow-hidden">
                {qrValue ? (
                  <>
                    <img
                      src={getQrUrl(qrValue)}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="w-full h-full object-contain transition-opacity duration-300"
                      style={{ opacity: loading ? 0.3 : 1 }}
                      onLoad={() => setLoading(false)}
                      onError={() => setLoading(false)}
                    />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white/15">
                    <QrCode className="w-10 h-10" strokeWidth={1} />
                    <span className="text-[10px] font-mono tracking-wide">
                      type to generate
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {qrValue && (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all text-[11px] font-mono cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    Save
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all text-[11px] font-mono cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Input & Controls */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              {/* Text Input */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-white/25 font-mono mb-2">
                  Content
                </label>
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/80 text-sm font-mono placeholder:text-white/15 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all resize-none"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-white/25 font-mono mb-2">
                  Quick Insert
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => handlePreset(preset.value)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/35 text-[10px] font-mono hover:text-white/70 hover:bg-white/[0.07] hover:border-white/[0.12] transition-all cursor-pointer"
                      >
                        <Icon className="w-3 h-3" />
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* History */}
              {history.length > 0 && (
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-white/25 font-mono mb-2">
                    Recent
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {history.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handlePreset(item)}
                        className="max-w-[140px] truncate px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/30 text-[10px] font-mono hover:text-white/60 hover:bg-white/[0.06] transition-all cursor-pointer"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-[10px] text-white/10 font-mono tracking-wider">
          powered by qrserver api
        </p>
      </div>
    </div>
  );
}
