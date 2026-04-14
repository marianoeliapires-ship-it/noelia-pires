import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';
import { escena } from './escena.js';
import { getCoche } from './coche.js';
import { decidirMovimientoIA } from './iacoche.js';

let cocheIA = null;

let velocidadY = 0;
let enRampa = false;
let enElAire = false;

const loader = new GLTFLoader();

// 🚗 CREAR IA
export function cargarCocheIA() {

    loader.load('./modelos/cocheIA.glb', (gltf) => {

        cocheIA = gltf.scene;

        const box = new THREE.Box3().setFromObject(cocheIA);
        const altura = box.min.y;

        cocheIA.scale.set(0.4, 0.4, 0.4);
        cocheIA.position.set(2, 1 - altura, 2);

        cocheIA.rotation.y = Math.PI;

        cocheIA.traverse(obj => {
            if (obj.isMesh) obj.castShadow = true;
        });

        escena.add(cocheIA);
    });

    window.cocheIA = cocheIA;
}

// 🤖 IA CON RAMPAS + COLISIÓN + DECISIONES
export async function moverCocheIA(rampas) {
    if (!cocheIA) return;

    const jugador = getCoche();
    if (!jugador) return;

    const meta = -275;

    // ==========================
    // 🧠 ESTADO IA
    // ==========================
    const estado = {
        x: cocheIA.position.x,
        z: cocheIA.position.z,
        nitro: 100,
        obstaculoIzquierda: false,
        obstaculoDerecha: false
    };

    const decision = await decidirMovimientoIA(estado);

    // ==========================
    // 🚗 VELOCIDAD
    // ==========================
    const distanciaMeta = Math.abs(cocheIA.position.z - meta);
    let velocidad = 0.25;

    if (distanciaMeta < 20) velocidad = 0.15;
    if (distanciaMeta < 10) velocidad = 0.08;
    if (distanciaMeta < 5) velocidad = 0.03;

    if (cocheIA.position.z <= meta) {
        cocheIA.position.z = meta;
    } else {
        cocheIA.position.z -= velocidad;
    }

    // ==========================
    // 🎯 SEGUIR JUGADOR
    // ==========================
    const diferenciaX = jugador.position.x - cocheIA.position.x;
    cocheIA.position.x += diferenciaX * 0.05;

    // ==========================
    // 🧠 DECISIONES IA
    // ==========================
    if (decision === "izquierda") {
        cocheIA.position.x -= 0.12;
    }

    if (decision === "derecha") {
        cocheIA.position.x += 0.12;
    }

    // ==========================
    // 🚧 LÍMITES
    // ==========================
    cocheIA.position.x = Math.max(-3, Math.min(3, cocheIA.position.x));

    // ==========================
    // 🏔️ RAMPAS
    // ==========================
    let tocandoRampa = false;

    rampas.forEach(rampa => {

        const inicio = rampa.position.z + 2;
        const fin = rampa.position.z - 6;

        const dentroX = Math.abs(cocheIA.position.x - rampa.position.x) < 1.6;

        if (
            cocheIA.position.z < inicio &&
            cocheIA.position.z > fin &&
            dentroX
        ) {
            tocandoRampa = true;

            const progreso = (cocheIA.position.z - inicio) / (fin - inicio);
            const altura = Math.pow(Math.max(0, Math.min(1, progreso)), 1.5) * 2.2;

            const alturaObjetivo = 1 + altura;

            cocheIA.position.y += (alturaObjetivo - cocheIA.position.y) * 0.3;

            const inclinacionObjetivo = rampa.rotation.x;
            cocheIA.rotation.x += (inclinacionObjetivo - cocheIA.rotation.x) * 0.15;

            if (!enRampa) {
                velocidadY = 0.05 + Math.abs(velocidad) * 0.2;
            }

            enRampa = true;
            enElAire = false;
        }
    });

    // ==========================
    // 🌍 GRAVEDAD
    // ==========================
    if (!tocandoRampa) {

        enRampa = false;
        cocheIA.rotation.x *= 0.9;

        if (cocheIA.position.y > 1 || enElAire) {

            enElAire = true;

            velocidadY -= 0.012;
            cocheIA.position.y += velocidadY;

            if (cocheIA.position.y <= 1) {
                cocheIA.position.y = 1;
                velocidadY = 0;
                enElAire = false;
            }

        } else {
            cocheIA.position.y = 1;
        }
    }

    // ==========================
    // 🔥 ROTACIÓN REALISTA
    // ==========================
    cocheIA.rotation.y = Math.PI + diferenciaX * 0.15;
    cocheIA.rotation.z = -diferenciaX * 0.08;

    // ==========================
    // 💥 COLISIÓN
    // ==========================
    const dx = cocheIA.position.x - jugador.position.x;
    const dz = cocheIA.position.z - jugador.position.z;

    const distancia = Math.sqrt(dx * dx + dz * dz);
    const distanciaMinima = 1.8;

    if (distancia < distanciaMinima) {

        const angulo = Math.atan2(dz, dx);
        const overlap = distanciaMinima - distancia;

        const separacionX = Math.cos(angulo) * overlap * 0.5;
        const separacionZ = Math.sin(angulo) * overlap * 0.5;

        cocheIA.position.x += separacionX;
        cocheIA.position.z += separacionZ;

        jugador.position.x -= separacionX;
        jugador.position.z -= separacionZ;
    }
}

// 🔍 GETTER
export function getCocheIA() {
    return cocheIA;
}
