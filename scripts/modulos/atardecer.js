import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { escena, sol } from './escena.js';

const colorAtardecer = new THREE.Color(0xffb38a);
const colorFogAtardecer = new THREE.Color(0xffa070);
let atardecerActivo = false;
let atardecerProgreso = 0;

export function activarAtardecer() {
    atardecerActivo = true;
}

export function getAtardecerProgreso() {
    return atardecerProgreso;
}

export function actualizarAtardecer(bloomPass) {
    if (!atardecerActivo) return;

    if (atardecerProgreso < 1) {
        atardecerProgreso += 0.004;
    }

    escena.background.lerp(colorAtardecer, atardecerProgreso);
    escena.fog.color.lerp(colorFogAtardecer, atardecerProgreso);

    sol.color.lerp(new THREE.Color(0xffcc99), atardecerProgreso);
    sol.intensity = THREE.MathUtils.lerp(0.6, 0.4, atardecerProgreso);

    if (bloomPass) {
        bloomPass.strength = THREE.MathUtils.lerp(0.3, 0.5, atardecerProgreso);
    }
}
