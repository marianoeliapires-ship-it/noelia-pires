# 🚗 Juego 3D con IA comentarista

Proyecto desarrollado por Noelia Pires.

## 🎮 Descripción
Juego de carreras 3D con Three.js donde una IA comenta la carrera en tiempo real.

## 🧠 IA
La IA funciona con Ollama (modelo local).

## ⚠️ IMPORTANTE
Este proyecto NO funciona directamente en GitHub Pages porque necesita un servidor Node.js.

## ▶️ Cómo ejecutarlo

1. Instalar dependencias:
npm install
2. Ejecutar servidor:

node server/server.js


3. Ejecutar IA (Ollama):

ollama run phi3


4. Abrir en navegador:

http://localhost:3000


## ✨ Características
- IA comentarista en tiempo real
- Detección de eventos (nitro, adelantamientos…)
- Voz narrador
- Modo vs IA