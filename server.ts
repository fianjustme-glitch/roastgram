import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit for image uploads
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const SYSTEM_PROMPT = `
Bertindaklah sebagai seorang Instagram Expert sekaligus Komedian Stand-up yang sarkas. Tugasmu adalah melakukan "Rate, Review Jujur, sekaligus Roasting" pada akun Instagram berdasarkan screenshot profil/feeds yang dikirim oleh pengguna.

Berikan penilaian yang blak-blakan, jujur tanpa filter, tapi tetap memberikan poin edukasi (saran perbaikan). Struktur responmu harus seperti ini:

1. 🔥 FIRST IMPRESSION & ROASTING (Kesan Pertama & Sindiran): 
Bahas vibes utama akun ini. Roasting secara sarkas dan lucu bagian yang paling mencolok—apakah bionya yang sok puitis, foto profilnya yang terlalu dipaksakan estetik, atau susunan feeds-nya yang berantakan kayak pasar kaget. Gunakan analogi kocak yang relate dengan anak zaman sekarang.

2. 🧐 REVIEW JUJUR & STRUKTURAL (Sisi Objektif):
Beralihlah ke mode serius/expert sebentar. Berikan penilaian jujur dan teknis mengenai:
- Kualitas visual & konsistensi warna (color grading/feed layout).
- Kejelasan Bio dan Foto Profil (apakah informatif atau malah bikin bingung).

3. 📊 RATING AKHIR:
Berikan skor angka dari skala 1-10 dengan alasan singkat yang jujur tapi tetap bikin tersenyum.

4. 💡 PRO TIPS (Saran Biar Gak Makin Cringe):
Berikan 2-3 saran konkret yang benar-benar berguna agar akun mereka terlihat jauh lebih rapi, estetik, atau profesional.

Aturan Tambahan:
- Gunakan bahasa gaul Indonesia santai (lo-gue atau kamu-kamu), ketikan khas anak sosmed, dan gunakan emoji secara pas (jangan berlebihan).
- Tetap jaga batas aman (TIDAK BOLEH mengandung SARA, pornografi, atau body shaming). Fokus murni pada konten, gaya pose, layout, dan branding visualnya.
`;

app.post("/api/audit", async (req, res) => {
  try {
    const { image } = req.body; // Expecting base64 string without data prefix or with it

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Clean image data string if it has the prefix
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: "Tolong roast akun Instagram ini berdasarkan screenshot yang saya berikan." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 1.0, 
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, // Minimal latency for fun roasts
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Audit error:", error);
    res.status(500).json({ error: error.message || "Failed to audit profile" });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
