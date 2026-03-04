"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import {
  Download,
  Copy,
  Check,
  QrCode,
  Link as LinkIcon,
  Wifi,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

type Preset = {
  icon: React.ElementType;
  label: string;
  value: string;
};

type MousePosition = {
  x: number;
  y: number;
};

const QUICK_PRESETS: Preset[] = [
  { icon: LinkIcon, label: "URL", value: "https://example.com" },
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

function getQrUrl(text: string, size = 400): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=111111&color=ffffff&format=png&margin=12`;
}

export default function QRGeneratorPage() {
  const [input, setInput] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

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
      const res = await fetch(getQrUrl(qrValue, 1024));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-code.png";
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
    <div
      className="relative min-h-screen w-full overflow-hidden bg-black selection:bg-white/20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <MeshGradient
        className="!fixed inset-0 w-full h-full scale-110"
        colors={["#000000", "#111111", "#1a1a1a", "#ffffff"]}
        speed={0.4}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          backgroundColor: "#000000",
          transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px) scale(1.1)`,
          transition: "transform 0.2s ease-out",
        }}
      />

      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 bg-white/[0.03] rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-1/2 right-0 w-80 h-80 bg-white/[0.02] rounded-full blur-[80px] animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 md:p-12">
        <div
          className={`text-center mb-16 transition-all duration-1000 ease-out transform ${
            isMounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="inline-flex items-center justify-center gap-3 px-4 py-2 mb-8 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md">
            <QrCode className="w-4 h-4 text-white/50" />
            <span className="text-xs uppercase tracking-[0.3em] font-medium text-white/60 font-mono">
              QR Studio
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light text-white tracking-tighter mb-4">
            Connect. <span className="text-white/30 italic">Create.</span>
          </h1>
          <br></br>
        </div>

        <div
          ref={containerRef}
          className={`w-[calc(100%-2rem)] md:w-full max-w-[1000px] rounded-[2.1rem] border border-white/[0.05] bg-black/40 backdrop-blur-2xl p-8 sm:p-12 lg:p-16 transition-all duration-1000 delay-150 ease-out ${
            isMounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * 0.5}deg) rotateY(${-mousePos.x * 0.5}deg) ${isMounted ? "translateY(0)" : "translateY(48px)"}`,
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), ${mousePos.x * 2}px ${mousePos.y * 2}px 30px rgba(255, 255, 255, 0.02)`,
            transition:
              "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 1s ease-out",
          }}
        >
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <div className="flex flex-col items-center gap-6 w-full lg:w-[320px] flex-shrink-0">
              <div
                className="relative w-full aspect-square max-w-[320px] rounded-2xl border border-white/[0.08] bg-[#0a0a0a] flex items-center justify-center overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
                style={{
                  transform: `translateZ(20px)`,
                  boxShadow: "inset 0 2px 20px rgba(255,255,255,0.02)",
                }}
              >
                {qrValue ? (
                  <>
                    <img
                      src={getQrUrl(qrValue)}
                      alt="Generated QR Code"
                      className={`w-full h-full object-contain p-6 transition-all duration-500 scale-100 ${loading ? "opacity-20 blur-sm scale-95" : "opacity-100 blur-0 scale-100"}`}
                      onLoad={() => setLoading(false)}
                      onError={() => setLoading(false)}
                    />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <div className="w-8 h-8 border-2 border-white/10 border-t-white/80 rounded-full animate-spin" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-white/20 select-none">
                    <div className="p-6 rounded-full bg-white/[0.02] border border-white/[0.05]">
                      <QrCode className="w-12 h-12" strokeWidth={1} />
                    </div>
                    <span className="text-xs font-mono tracking-[0.2em] uppercase">
                      Awaiting Data
                    </span>
                  </div>
                )}
              </div>

              <div
                className={`flex gap-3 w-full max-w-[320px] transition-all duration-500 ${qrValue ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
                style={{ transform: `translateZ(10px)` }}
              >
                <button
                  onClick={handleDownload}
                  className="group flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all active:scale-95 text-sm"
                >
                  <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                  Save Image
                </button>
                <button
                  onClick={handleCopy}
                  className="group flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1] hover:border-white/[0.2] transition-all active:scale-95 text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 transition-transform group-hover:scale-110" />
                      Copy Text
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              className="flex-1 w-full space-y-10"
              style={{ transform: `translateZ(15px)` }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40">
                    Content Payload
                  </label>
                  <span className="text-[10px] text-white/20 font-mono">
                    {input.length} chars
                  </span>
                </div>
                <div className="relative group p-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-[1.25rem] blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-500"></div>
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter URL, text, wifi credentials..."
                    rows={6}
                    className="relative z-10 w-full p-6 sm:px-8 sm:py-6 rounded-2xl bg-[#030303] border border-white/[0.1] text-white text-lg font-light placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-[#0a0a0a] transition-all resize-none shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs uppercase tracking-[0.2em] font-semibold text-white/40">
                  Quick Insert
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {QUICK_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => handlePreset(preset.value)}
                        className="group flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all hover:-translate-y-1 active:scale-95"
                      >
                        <Icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-medium text-white/40 group-hover:text-white uppercase tracking-wider hidden sm:block">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {history.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/[0.05]">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/30">
                    Recent
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {history.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handlePreset(item)}
                        className="max-w-[180px] truncate px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-white/50 text-xs hover:text-white hover:bg-white/[0.08] transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
                        title={item}
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

        {/* Footer Removed */}
      </div>
    </div>
  );
}
