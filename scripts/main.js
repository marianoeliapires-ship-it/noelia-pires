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

// UI
document.body.style.margin = "0";
document.body.style.background = "#bfdfff";
const hudVelocidad = document.getElementById("velocidad");
const nitroFill = document.getElementById("nitroFill");

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

// INICIALIZACIÓN DE MÓDULOS
cargarEntorno();
cargarCarretera();
cargarCoche();

let tiempo = 0;

// ==========================
// 🔁 LOOP PRINCIPAL
// ==========================
function animar() {
    requestAnimationFrame(animar);

    // Actualizar coche, físicas y partículas
    moverCoche(rampas, activarAtardecer);
    actualizarParticulas();

    // Actualizar cámara
    actualizarCamara(getCoche());

    // Actualizar entorno y límites
    limitarCarretera();
    
    // Atardecer y farolas
    actualizarAtardecer(bloomPass);
    actualizarFarolas(getAtardecerProgreso());

    // Animaciones del entorno (Agua)
    tiempo += 0.05;
    actualizarAgua(tiempo);

    // Actualizar UI
    const kmh = Math.round(Math.abs(getVelocidad() * 400));
    hudVelocidad.textContent = kmh + " km/h";
    nitroFill.style.width = getNitro() + "%";

    // Renderizado final
    composer.render();
};

animar();