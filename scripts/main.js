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

import { cargarCocheIA, moverCocheIA, getCocheIA } from './modulos/cocheIA.js';
import { crearMeta } from './modulos/carretera.js';

import { crearBotonRestart, mostrarBotonRestart } from './modulos/boton.js';
import { crearMenu } from './modulos/menu.js';
import { crearBotonMenu } from './modulos/botonmenu.js';
import { comentarCarreraIA } from "./modulos/ia.js";


// 🎙️ VOZ
function hablarPro(texto) {
    if (!texto) return;

    const speech = new SpeechSynthesisUtterance(texto);
    const voces = speechSynthesis.getVoices();

    const voz = voces.find(v =>
        v.lang.includes("es") &&
        (v.name.includes("Google") || v.name.includes("Microsoft"))
    );

    if (voz) speech.voice = voz;

    speech.lang = "es-ES";
    speech.pitch = 0.8;   // voz más grave = narrador
    speech.rate = 1.05;   // más dinámica
    speech.volume = 1;

    speechSynthesis.cancel();
    speechSynthesis.speak(speech);
}


// 🧾 UI RESULTADO
const resultado = document.createElement("div");
resultado.style.position = "absolute";
resultado.style.top = "40%";
resultado.style.width = "100%";
resultado.style.textAlign = "center";
resultado.style.fontSize = "60px";
resultado.style.fontWeight = "bold";
resultado.style.color = "#FFD700";
resultado.style.display = "none";
resultado.style.zIndex = "9999";
document.body.appendChild(resultado);

// ⏸️ PAUSA
const pausaTexto = document.createElement("div");
pausaTexto.innerText = "PAUSED";
pausaTexto.style.position = "absolute";
pausaTexto.style.top = "40%";
pausaTexto.style.width = "100%";
pausaTexto.style.textAlign = "center";
pausaTexto.style.fontSize = "80px";
pausaTexto.style.color = "#FFD700";
pausaTexto.style.display = "none";
pausaTexto.style.zIndex = "9999";
document.body.appendChild(pausaTexto);


// HUD
const hudVelocidad = document.getElementById("velocidad");
const nitroFill = document.getElementById("nitroFill");


// 🎮 RENDER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(escena, camara));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3, 0.6, 0.85
);
composer.addPass(bloomPass);


// INIT
cargarEntorno();
cargarCarretera();
cargarCoche();
cargarCocheIA();
crearMeta();

crearBotonRestart();
crearBotonMenu(volverAlMenu);


// VARIABLES
let tiempo = 0;
let carreraTerminada = false;
let juegoIniciado = false;
let cuentaAtras = 3;
let modoJuego = null;
let modoCinematica = false;
let juegoPausado = false;

let ultimoComentario = 0;
let ultimoComentarioIA = 0;
let ultimoEstado = null;
let ultimoGanador = null;
let finalNarrado = false;


// ⏸️ PAUSA
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        juegoPausado = !juegoPausado;
        pausaTexto.style.display = juegoPausado ? "block" : "none";
    }
});


// ⏱️ CUENTA ATRÁS
const salida = document.createElement("div");
salida.style.position = "absolute";
salida.style.top = "30%";
salida.style.width = "100%";
salida.style.textAlign = "center";
salida.style.fontSize = "80px";
salida.style.color = "#FFD700";
salida.style.zIndex = "9999";
document.body.appendChild(salida);

function iniciarCuentaAtras() {
    const intervalo = setInterval(() => {

        if (cuentaAtras > 0) {
            salida.innerText = cuentaAtras;
            hablarPro(cuentaAtras.toString());
            cuentaAtras--;
        } else {
            salida.innerText = "GO!";
            hablarPro("¡Arranca la carrera!");
            juegoIniciado = true;

            setTimeout(() => salida.style.display = "none", 1000);
            clearInterval(intervalo);
        }

    }, 1000);
}


// MENÚ
crearMenu((modo) => {
    modoJuego = modo;
    iniciarCuentaAtras();
});


// RESET
function volverAlMenu() {

    carreraTerminada = false;
    juegoIniciado = false;
    modoCinematica = false;

    resultado.style.display = "none";
    salida.style.display = "block";

    cuentaAtras = 3;

    const coche = getCoche();
    const ia = getCocheIA();

    // 🔥 RESETEAR POSICIONES
    if (coche) coche.position.set(0, 1, 5);
    if (ia) ia.position.set(2, 1, 2);

    // 🔥 RECREAR MENÚ (CLAVE)
    crearMenu((modo) => {
        modoJuego = modo;
        iniciarCuentaAtras();
    });
}


// 🔁 LOOP
function animar() {
    requestAnimationFrame(animar);

    if (juegoPausado) {
        composer.render();
        return;
    }

    const coche = getCoche();
    const ia = getCocheIA();
    const meta = -275;

    if (juegoIniciado) {

        const ahora = Date.now();
      let evento = "carrera";

if (coche && ia) {

    if (coche.position.y > 1.5) {
        evento = "rampa";
    }

    if (coche.position.z < ia.position.z) {
        evento = "jugador lidera";
    } else {
        evento = "ia lidera";
    }

    if (Math.abs(coche.position.z - ia.position.z) < 5) {
        evento = "lucha";
    }

    if (getNitro() > 80) {
        evento = "nitro";

        if (evento === "rampa") {
    mostrarComentarioIA("🚀 ¡SUBE LA RAMPA A TODA VELOCIDAD!");
}
    }
}


        // 🧠 IA REAL (cada 4s → MUCHO MÁS FLUIDO)
        if (ahora - ultimoComentarioIA > 2500) {

            ultimoComentarioIA = ahora;

           comentarCarreraIA({
    evento,
    posicionJugador: coche?.position.z,
    posicionIA: ia?.position.z,
    velocidad: getVelocidad(),
    nitro: getNitro(),
    enRampa: coche?.position.y > 1.5
})
            .then(c => {
                mostrarComentarioIA(c);
                hablarPro(c);
            });
        }

        if (!carreraTerminada) moverCoche(rampas, activarAtardecer);
        if (modoJuego === "ia") moverCocheIA(rampas);
    }

    actualizarParticulas();
    actualizarCamara(coche);
    limitarCarretera();

    actualizarAtardecer(bloomPass);
    actualizarFarolas(getAtardecerProgreso());

    tiempo += 0.05;
    actualizarAgua(tiempo);

    hudVelocidad.textContent = Math.round(getVelocidad() * 400) + " km/h";
    nitroFill.style.width = getNitro() + "%";

    // 🏁 META
   if (!carreraTerminada && coche && coche.position.z <= meta) {
    resultado.innerText = "🏆 WINNER";
    resultado.style.display = "block";

    mostrarBotonRestart();

    carreraTerminada = true;
    modoCinematica = true;

    if (!finalNarrado) {
        finalNarrado = true;

        const finalTexto = "¡VICTORIA ESPECTACULAR! ¡Una carrera absolutamente increíble!";
        mostrarComentarioIA(finalTexto);
        hablarPro(finalTexto);
    }
}

if (!carreraTerminada && ia && ia.position.z <= meta) {
    resultado.innerText = "💀 LOSER";
    resultado.style.color = "red";
    resultado.style.display = "block";

    mostrarBotonRestart();

    carreraTerminada = true;
    modoCinematica = true;

    if (!finalNarrado) {
        finalNarrado = true;

        const finalTexto = "¡La IA se lleva la victoria! ¡Qué carrera tan brutal!";
        mostrarComentarioIA(finalTexto);
        hablarPro(finalTexto);
    }
}

    composer.render();
}


// 🧾 UI TEXTO
function mostrarComentarioIA(texto) {
    let div = document.getElementById("comentarioIA");

    if (!div) {
        div = document.createElement("div");
        div.id = "comentarioIA";
        div.style.position = "absolute";
        div.style.top = "20px";
        div.style.right = "20px";
        div.style.color = "white";
        div.style.background = "rgba(0,0,0,0.6)";
        div.style.padding = "10px";
        document.body.appendChild(div);
    }

    div.innerText = texto;
}

animar();