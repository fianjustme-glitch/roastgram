/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  Flame, 
  Star, 
  Lightbulb, 
  AlertCircle, 
  Camera, 
  Trash2,
  RefreshCw,
  Instagram,
  CheckCircle2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ROASTING_MESSAGES = [
  "Lagi ngintip feeds lo yang 'estetik' itu...",
  "Nyiapin mental buat liat bio lo yang puitis...",
  "Wah, color grading-nya unik ya, alias berantakan...",
  "Sabar, lagi nyari kata-kata yang cukup pedas...",
  "Analisanya tajam, kayak omongan tetangga...",
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(ROASTING_MESSAGES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File kegedean, maksimal 5MB ya!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAudit = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Rotate messages
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % ROASTING_MESSAGES.length;
      setLoadingMsg(ROASTING_MESSAGES[msgIndex]);
    }, 2000);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Server lagi ngambek (Error 500/404). Pastikan GEMINI_API_KEY sudah dipasang di Environment Variables Vercel.");
      }

      if (!response.ok) throw new Error(data.error || "Gagal nge-roast");

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-pink-500 selection:text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 mb-6 shadow-lg shadow-pink-500/20"
          >
            <Instagram className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-3 font-display"
          >
            Roast<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Gram</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            Pakar IG & Komedian Stand-up siap nge-roast akun lo. Jujur, Pedas, Berfaedah.
          </motion.p>
        </header>

        {/* Content */}
        {!image ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-[4/3] rounded-3xl border-2 border-dashed border-gray-800 bg-[#0A0A0A] flex flex-col items-center justify-center cursor-pointer hover:border-pink-500/50 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-600 mb-4 group-hover:text-pink-500 transition-colors" />
              <p className="text-xl font-medium text-gray-300">Upload screenshot profil/feeds</p>
              <p className="text-gray-500 mt-2 text-sm">Klik atau seret gambar ke sini</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Image Preview */}
            <motion.div 
              layoutId="image-preview"
              className="relative group rounded-3xl overflow-hidden border border-gray-800 bg-[#0A0A0A]"
            >
              <img src={image} alt="Preview" className="w-full object-contain max-h-[400px]" />
              {!loading && !result && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={reset}
                    className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Actions */}
            {!result && !loading && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={startAudit}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-xl hover:from-pink-500 hover:to-purple-500 shadow-xl shadow-pink-500/20 active:scale-[0.98] transition-all"
              >
                Gas Roast Sekarang! 🔥
              </motion.button>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                <AlertCircle className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Loading */}
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 space-y-6"
                >
                  <RefreshCw className="w-12 h-12 text-pink-500 animate-spin" />
                  <motion.p 
                    key={loadingMsg}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-gray-400 font-medium text-center"
                  >
                    {loadingMsg}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="space-y-6 pb-12"
                >
                  <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-gray-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                      <Flame className="w-24 h-24 text-pink-500" />
                    </div>
                    
                    <div className="markdown-body prose prose-invert prose-pink max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h2 className="text-2xl font-black text-white mt-8 first:mt-0 flex items-center gap-3 border-b border-gray-800 pb-4 font-display">{children}</h2>,
                          h2: ({ children }) => <h2 className="text-2xl font-black text-white mt-8 first:mt-0 flex items-center gap-3 border-b border-gray-800 pb-4 font-display">{children}</h2>,
                          li: ({ children }) => <li className="text-gray-300 leading-relaxed list-none mb-4 before:content-['👉'] before:mr-2">{children}</li>,
                          p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-4 text-lg">{children}</p>,
                          strong: ({ children }) => <strong className="text-pink-400 font-bold">{children}</strong>,
                        }}
                      >
                        {result}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <button
                    onClick={reset}
                    className="w-full py-4 rounded-2xl bg-gray-900 border border-gray-800 font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Coba Akun Lain
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="relative z-10 text-center py-12 text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} RoastGram AI. Be careful what you post, or we'll burn it.</p>
      </footer>
    </div>
  );
}
