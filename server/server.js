import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// 🔧 rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🌐 config
app.use(cors({ origin: "*" }));
app.use(express.json());

// 🎮 servir juego
app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// 🧠 IA LOCAL
app.post("/ia", async (req, res) => {

  console.log("📥 BODY:", req.body);

  // ✅ IMPORTANTE: coger datos bien
  const {
    evento = "carrera",
    posicionJugador = 0,
    posicionIA = 0,
    velocidad = 0,
    nitro = 0,
    enRampa = false
  } = req.body || {};

  const prompt = `
Eres un narrador de carreras estilo Fórmula 1 en directo.

Habla en español.
Máximo 5 palabras.
Frases CORTAS y COMPLETAS.

Ejemplos:
- "¡Arranca la carrera!"
- "El coche rojo lidera"
- "¡IA adelanta!"
- "Sube la rampa"
- "¡Victoria del rojo!"

Datos:
Evento: ${evento}
Jugador: ${posicionJugador}
IA: ${posicionIA}
Velocidad: ${velocidad}
Nitro: ${nitro}
Rampa: ${enRampa}

Describe SOLO lo que pasa ahora.
`;

  try {

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "phi3",
        prompt: prompt,
        stream: false,
        options: {
          num_predict: 12,
          temperature: 0.6
        }
      })
    });

    const data = await response.json();

    let comentario = (data.response || "")
      .replace(/\n/g, " ")
      .trim();

    // ✅ fallback SIEMPRE
    if (!comentario) {
      comentario = "🔥 ¡A fondo!";
    }

    console.log("🎤 IA:", comentario);

    res.json({ comentario });

  } catch (error) {

    console.error("❌ ERROR IA:", error.message);

    // 🔥 NUNCA romper JSON
    res.json({
      comentario: "🔥 ¡Carrera en marcha!"
    });
  }
});

// 🚀 iniciar
app.listen(3000, () => {
  console.log("🔥 Servidor IA en http://localhost:3000");
});