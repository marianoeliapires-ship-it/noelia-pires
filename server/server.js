import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/ia', async (req, res) => {

    const { playerX, iaX } = req.body;

    const prompt = `
    Eres una IA que controla un coche en un juego.

    Datos:
    - Posición jugador X: ${playerX}
    - Posición IA X: ${iaX}

    Responde SOLO con:
    izquierda, derecha o recto
    `;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer TU_API_KEY_REAL"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();

        res.json({ decision: data.choices[0].message.content });

    } catch (error) {
        res.json({ decision: "recto" });
    }
});

app.listen(3000, () => {
    console.log("Servidor IA corriendo en http://localhost:3000");
});