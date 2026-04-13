import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/postprocessing/UnrealBloomPass.js';

import { escena } from './modulos/escena.js';
import { camara, actualizarCamara } from './modulos/camara.js';
import { cargarCoche, moverCoche, actualizarParticulas, getCoche, getNitro, getVelocidad } from './modulos/coche.js';
import { cargarEntorno, actualizarAgua } from './modulos/entorno.js';
import { cargarCarretera, limitarCarretera, actualizarFarolas, rampas } from './modulos/carretera.js';
import { actualizarAtardecer, activarAtardecer, getAtardecerProgreso } from './modulos/atardecer.js';

// 🔥 IA (SOLO UNA VEZ)
import { cargarCocheIA, moverCocheIA, getCocheIA } from './modulos/cocheIA.js';
import { crearMeta } from './modulos/carretera.js';


const winnerText = document.createElement("div");
winnerText.style.position = "absolute";
winnerText.style.top = "40%";
winnerText.style.width = "100%";
winnerText.style.textAlign = "center";
winnerText.style.fontSize = "60px";
winnerText.style.color = "yellow";
winnerText.style.fontWeight = "bold";
winnerText.style.display = "none";
winnerText.innerText = "WINNER 🏆";

document.body.appendChild(winnerText);


// UI
document.body.style.margin = "0";
document.body.style.background = "#bfdfff";

const hudVelocidad = document.getElementById("velocidad");
const nitroFill = document.getElementById("nitroFill");

// 🏁 CARTEL RESULTADO
const resultado = document.createElement("div");
resultado.style.position = "absolute";
resultado.style.top = "40%";
resultado.style.width = "100%";
resultado.style.textAlign = "center";
resultado.style.fontSize = "50px";
resultado.style.color = "white";
resultado.style.fontWeight = "bold";
resultado.style.display = "none";
document.body.appendChild(resultado);

// RENDER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// POST
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(escena, camara));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3, 0.6, 0.85
);

composer.addPass(bloomPass);

// 🔥 INIT
cargarEntorno();
cargarCarretera();
cargarCoche();
cargarCocheIA();
crearMeta();

let tiempo = 0;
let carreraTerminada = false;
let juegoIniciado = false;
let cuentaAtras = 3;


const salida = document.createElement("div");
salida.style.position = "absolute";
salida.style.top = "30%";
salida.style.width = "100%";
salida.style.textAlign = "center";
salida.style.fontSize = "80px";
salida.style.color = "yellow";
salida.style.fontWeight = "bold";
document.body.appendChild(salida);


function iniciarCuentaAtras() {
    const intervalo = setInterval(() => {

        if (cuentaAtras > 0) {
            salida.innerText = cuentaAtras;
            cuentaAtras--;
        } else {
            salida.innerText = "GO!";
            juegoIniciado = true;

            setTimeout(() => {
                salida.style.display = "none";
            }, 1000);

            clearInterval(intervalo);
        }

    }, 1000);
}

iniciarCuentaAtras();





// ==========================
// 🔁 LOOP PRINCIPAL
// ==========================
function animar() {
    requestAnimationFrame(animar);

if (carreraTerminada) return;

    const coche = getCoche();
    const ia = getCocheIA();

   if (juegoIniciado) {
    moverCoche(rampas, activarAtardecer);
    moverCocheIA();
}

    // partículas
    actualizarParticulas();

    // cámara
    actualizarCamara(coche);

    // límites
    limitarCarretera();

    // luces
    actualizarAtardecer(bloomPass);
    actualizarFarolas(getAtardecerProgreso());

    // agua
    tiempo += 0.05;
    actualizarAgua(tiempo);

    // UI
    const kmh = Math.round(Math.abs(getVelocidad() * 400));
    hudVelocidad.textContent = kmh + " km/h";
    nitroFill.style.width = getNitro() + "%";

    // 🏁 META (AQUÍ ES DONDE TIENE QUE ESTAR)
    const meta = -500;

    if (!carreraTerminada && coche && ia) {

        if (coche.position.z < meta) {
            resultado.innerText = "🏆 HAS GANADO";
            resultado.style.display = "block";
            carreraTerminada = true;
        }

        if (ia.position.z < meta) {
            resultado.innerText = "💀 HAS PERDIDO";
            resultado.style.display = "block";
            carreraTerminada = true;
        }
    }

    // render
    composer.render();
}

const coche = getCoche();
const ia = getCocheIA();

const meta = -200; // 👈 usa tu valor real

if (!carreraTerminada && coche && ia) {

    // 🚗 jugador gana
    if (coche.position.z < meta) {
        winnerText.innerText = "🏆 WINNER";
        winnerText.style.display = "block";
        carreraTerminada = true;
    }

    // 🤖 IA gana
    if (ia.position.z < meta) {
        winnerText.innerText = "🤖 IA WINNER";
        winnerText.style.display = "block";
        carreraTerminada = true;
    }
}






animar();