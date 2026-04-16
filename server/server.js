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

// 🧠 IA LOCAL RÁPIDA
app.post("/ia", async (req, res) => {

 const prompt = `
Eres un narrador de carreras estilo Fórmula 1 en directo.

Habla en español.
3 o 4 palabras.

Describe la acción paso a paso como si lo estuvieras viendo.

Ejemplos:
- "¡Arranca la carrera! El coche rojo acelera fuerte."
- "Sube la rampa a toda velocidad, la IA le sigue de cerca."
- "¡La IA adelanta! No le deja espacio."
- "¡Qué lucha! Van pegados."
- "¡VICTORIA del coche rojo!"

Datos en tiempo real:
Evento: ${evento}
Posición jugador: ${posicionJugador}
Posición IA: ${posicionIA}
Velocidad: ${velocidad}
Nitro: ${nitro}
Está en rampa: ${enRampa}

Describe lo que está pasando AHORA MISMO como narrador de TV.
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
          num_predict: 60,      // 🔥 más rápido
          temperature: 0.9
        }
      })
    });

    const data = await response.json();

    const comentario = (data.response || "")
      .replace(/\n/g, " ")
      .trim() || "🔥 ¡A fondo!";

    res.json({ comentario });

  } catch (error) {
    console.error("❌ ERROR OLLAMA:", error);

    res.json({
      comentario: "🔥 ¡A fondo!"
    });
  }
});

// 🚀 iniciar
app.listen(3000, () => {
  console.log("🔥 Servidor IA + Juego en http://localhost:3000");
});