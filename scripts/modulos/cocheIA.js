import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';
import { escena } from './escena.js';
import { getCoche } from './coche.js';

let cocheIA = null;

const loader = new GLTFLoader();

// 🚗 CREAR IA (CON MODELO REAL)
export function cargarCocheIA() {

    console.log("Cargando modelo IA...");

    loader.load(
        './modelos/cocheIA.glb', // 👈 RUTA CORRECTA

        (gltf) => {
            console.log("✅ MODELO IA CARGADO");

            cocheIA = gltf.scene;

            cocheIA.scale.set(0.4, 0.4, 0.4);
            cocheIA.position.set(2, 1, 2);

            // 🔥 girar coche correctamente
            cocheIA.rotation.y = Math.PI;

            cocheIA.traverse(obj => {
                if (obj.isMesh) obj.castShadow = true;
            });

            escena.add(cocheIA);

            console.log("🤖 COCHE IA LISTO");
        },

        undefined,

        (error) => {
            console.error("❌ ERROR CARGANDO GLB:", error);
        }
    );
    window.cocheIA = cocheIA;

}

// 🤖 MOVER IA
export function moverCocheIA() {
    if (!cocheIA) return;

    const jugador = getCoche();
    if (!jugador) return;

    // 🔥 MÁS RÁPIDA QUE EL JUGADOR
    cocheIA.position.z -= 0.25;

    // seguir jugador
    cocheIA.position.x += (jugador.position.x - cocheIA.position.x) * 0.04;

    // límites carretera
    cocheIA.position.x = Math.max(-3, Math.min(3, cocheIA.position.x));

    cocheIA.position.y = 1;
}

export function getCocheIA() {
    return cocheIA;
}