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

// UI RESULTADO
const resultado = document.createElement("div");
resultado.style.position = "absolute";
resultado.style.top = "40%";
resultado.style.width = "100%";
resultado.style.textAlign = "center";
resultado.style.fontSize = "60px";
resultado.style.fontWeight = "bold";
resultado.style.fontFamily = "Consolas, monospace";
resultado.style.display = "none";
resultado.style.zIndex = "9999";
document.body.appendChild(resultado);

// TEXTO PAUSA
const pausaTexto = document.createElement("div");
pausaTexto.innerText = "PAUSED";
pausaTexto.style.position = "absolute";
pausaTexto.style.top = "40%";
pausaTexto.style.width = "100%";
pausaTexto.style.textAlign = "center";
pausaTexto.style.fontSize = "80px";
pausaTexto.style.fontFamily = "Consolas, monospace";
pausaTexto.style.color = "#FFD700";
pausaTexto.style.textShadow = "0 0 10px #FFD700";
pausaTexto.style.display = "none";
pausaTexto.style.zIndex = "9999";
document.body.appendChild(pausaTexto);

// HUD
document.body.style.margin = "0";
document.body.style.background = "#bfdfff";

const hudVelocidad = document.getElementById("velocidad");
const nitroFill = document.getElementById("nitroFill");

// RENDER
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

let tiempo = 0;
let carreraTerminada = false;
let juegoIniciado = false;
let cuentaAtras = 3;
let modoCinematica = false;
let modoJuego = null;
let juegoPausado = false; 

// DETECTAR ESC
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        juegoPausado = !juegoPausado;
        pausaTexto.style.display = juegoPausado ? "block" : "none";
    }
});

// CUENTA ATRÁS
const salida = document.createElement("div");
salida.style.position = "absolute";
salida.style.top = "30%";
salida.style.width = "100%";
salida.style.textAlign = "center";
salida.style.fontSize = "80px";
salida.style.fontWeight = "bold";
salida.style.fontFamily = "Consolas, monospace";
salida.style.color = "#FFD700";
salida.style.textShadow = "0 0 10px #FFD700, 0 0 20px #FFA500";
salida.style.zIndex = "9999";
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

// MENÚ INICIAL
crearMenu((modo) => {
    modoJuego = modo;
    iniciarCuentaAtras();
});

// VOLVER AL MENÚ
function volverAlMenu() {

    carreraTerminada = false;
    juegoIniciado = false;
    modoCinematica = false;

    resultado.style.display = "none";
    salida.style.display = "block";

    cuentaAtras = 3;

    const coche = getCoche();
    const ia = getCocheIA();

    if (coche) coche.position.set(0, 1, 5);
    if (ia) ia.position.set(2, 1, 2);

    crearMenu((modo) => {
        modoJuego = modo;
        iniciarCuentaAtras();
    });
}

// LOOP
function animar() {
    requestAnimationFrame(animar);

    // BLOQUEO POR PAUSA
    if (juegoPausado) {
        composer.render();
        return;
    }

    const coche = getCoche();
    const ia = getCocheIA();

    if (juegoIniciado) {

        if (!carreraTerminada) {
            moverCoche(rampas, activarAtardecer);
        }

        if (modoJuego === "ia") {
            moverCocheIA(rampas);
        }
    }

    actualizarParticulas();
    actualizarCamara(coche);
    limitarCarretera();

    actualizarAtardecer(bloomPass);
    actualizarFarolas(getAtardecerProgreso());

    tiempo += 0.05;
    actualizarAgua(tiempo);

    const kmh = Math.round(Math.abs(getVelocidad() * 400));
    hudVelocidad.textContent = kmh + " km/h";
    nitroFill.style.width = getNitro() + "%";

    const meta = -275;

    if (!carreraTerminada && coche && coche.position.z <= meta) {
        resultado.innerText = "🏆 WINNER";
        resultado.style.color = "#FFD700";
        resultado.style.display = "block";

        mostrarBotonRestart();

        coche.position.z = meta;

        carreraTerminada = true;
        modoCinematica = true;
    }

    if (!carreraTerminada && ia && ia.position.z <= meta) {
        resultado.innerText = "💀 LOSER";
        resultado.style.color = "red";
        resultado.style.display = "block";

        mostrarBotonRestart();

        ia.position.z = meta;

        carreraTerminada = true;
        modoCinematica = true;
    }

    if (carreraTerminada) {
        if (coche) coche.position.x += (-1.5 - coche.position.x) * 0.05;
        if (ia) ia.position.x += (1.5 - ia.position.x) * 0.05;
    }

    if (modoCinematica) {

        const objetivo = coche && coche.position.z <= meta ? coche : ia;

        if (objetivo) {
            const t = Date.now() * 0.001;

            camara.position.x = objetivo.position.x + Math.sin(t) * 5;
            camara.position.z = objetivo.position.z + Math.cos(t) * 5;
            camara.position.y = 3;

            camara.lookAt(objetivo.position);

            camara.position.y += (2 - camara.position.y) * 0.05;
        }
    }

    composer.render();
}

animar();