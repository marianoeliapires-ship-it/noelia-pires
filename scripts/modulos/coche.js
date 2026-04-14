import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';
import { escena } from './escena.js';
import { teclas, getTurbo } from './controles.js';
import { LIMITE_CARRETERA, Z_TERCERA_RAMPA } from './constantes.js';
import { camara } from './camara.js';
import { decidirMovimientoIA } from './iaGemma.js';

let coche = null;
let cocheIA = null;

let velocidad = 0;
let nitro = 100;
let velocidadY = 0;
let enRampa = false;
let enElAire = false;

let luzDel1, luzDel2, luzTras1, luzTras2;
let particulas = [];

let decisionIA = "recto";
let tiempoDecision = 0;

// 🔥 CONTROL HUMO
let ultimoHumo = 0;
const INTERVALO_HUMO = 80;
const MAX_PARTICULAS = 80;

const loader = new GLTFLoader();

// 💨 TEXTURA HUMO
const texturaHumo = new THREE.TextureLoader().load('./texturas/humo.png');

// 🔥 FUNCIÓN HUMO REALISTA
function crearHumo(offsetSide = 0) {

    if (!coche) return;

    // 🔥 LIMITE DE PARTÍCULAS
    if (particulas.length > MAX_PARTICULAS) {
        const vieja = particulas.shift();
        escena.remove(vieja.mesh);
    }

    const geo = new THREE.PlaneGeometry(1, 1);

    const mat = new THREE.MeshBasicMaterial({
        map: texturaHumo,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
    });

    const humo = new THREE.Mesh(geo, mat);

    humo.position.copy(coche.position);

    const offsetAtras = 1.7;

    // 🔥 ALTURA ESCAPE
    humo.position.y -= 0.35;

    // 🔥 DETRÁS DEL COCHE
    humo.position.x += Math.sin(coche.rotation.y) * offsetAtras;
    humo.position.z += Math.cos(coche.rotation.y) * offsetAtras;

    // 🔥 DOBLE ESCAPE
    humo.position.x += Math.cos(coche.rotation.y) * offsetSide;

    // 🔥 DIRECCIÓN REAL
    const dirX = -Math.sin(coche.rotation.y);
    const dirZ = -Math.cos(coche.rotation.y);

    escena.add(humo);

    particulas.push({
        mesh: humo,
        vida: 1,
        velocidadX: dirX * 0.12 + (Math.random() - 0.5) * 0.06,
        velocidadY: Math.random() * 0.02,
        velocidadZ: dirZ * 0.12 + (Math.random() - 0.5) * 0.06,
        crecimiento: 0.035
    });
}

export function getCoche() { return coche; }
export function getVelocidad() { return velocidad; }
export function getNitro() { return nitro; }
export function getCocheIA() { return cocheIA; }

// 🚗 CARGAR COCHE
export function cargarCoche() {
    loader.load('./modelos/coche.glb', (gltf) => {

        coche = gltf.scene;

        coche.scale.set(1.8, 1.8, 1.8);
        coche.position.set(0, 1, 0);

        coche.traverse(obj => {
            if (obj.isMesh) obj.castShadow = true;
        });

        // 🔦 LUCES DELANTERAS
        luzDel1 = new THREE.SpotLight(0xffffff, 10, 60, Math.PI / 4);
        luzDel2 = new THREE.SpotLight(0xffffff, 10, 60, Math.PI / 4);

        luzDel1.position.set(-0.5, 0.4, 1.5);
        luzDel2.position.set(0.5, 0.4, 1.5);

        luzDel1.target.position.set(-0.5, 0, 20);
        luzDel2.target.position.set(0.5, 0, 20);

        coche.add(luzDel1.target);
        coche.add(luzDel2.target);

        luzDel1.castShadow = true;
        luzDel2.castShadow = true;

        coche.add(luzDel1, luzDel2);

        // 🔴 LUCES TRASERAS
        luzTras1 = new THREE.PointLight(0xff0000, 0.8, 4);
        luzTras2 = new THREE.PointLight(0xff0000, 0.8, 4);

        luzTras1.position.set(-0.5, 0.3, -1.5);
        luzTras2.position.set(0.5, 0.3, -1.5);

        coche.add(luzTras1, luzTras2);

        escena.add(coche);

        console.log("🚗 Coche jugador creado");
    });
}

// 🚗 MOVIMIENTO + TURBO + HUMO PRO
export function moverCoche(rampas, onAtardecer) {
    if (!coche) return;

    let velocidadBase = 0.12;
    const turboActivo = getTurbo();

    if (turboActivo && nitro > 0) {
        velocidadBase = 0.35;
        nitro -= 1.2;

        // 💨 HUMO CONTROLADO (SIN TIRONES)
        const ahora = Date.now();

        if (ahora - ultimoHumo > INTERVALO_HUMO) {
            crearHumo(0.35);
            crearHumo(-0.35);
            ultimoHumo = ahora;
        }

    } else {
        nitro += 1.5;
    }

    nitro = Math.max(0, Math.min(100, nitro));

    if (teclas['ArrowUp']) velocidad = velocidadBase;
    else if (teclas['ArrowDown']) velocidad = -velocidadBase;
    else velocidad *= 0.92;

    if (teclas['ArrowLeft']) coche.rotation.y += 0.025;
    if (teclas['ArrowRight']) coche.rotation.y -= 0.025;

    coche.position.x -= Math.sin(coche.rotation.y) * velocidad;
    coche.position.z -= Math.cos(coche.rotation.y) * velocidad;

    const limiteFinal = LIMITE_CARRETERA - 50;

    if (coche.position.z < limiteFinal) {
        coche.position.z = limiteFinal;
        coche.rotation.y += 0.05;
        velocidad *= 0.9;
    }

    if (coche.position.z < Z_TERCERA_RAMPA + 10) {
        onAtardecer();
    }

    // 🔥 LUCES TURBO
    if (turboActivo) {
        luzDel1.intensity = 5;
        luzDel2.intensity = 5;
        luzTras1.intensity = 3;
        luzTras2.intensity = 3;
    } else {
        luzDel1.intensity *= 0.9;
        luzDel2.intensity *= 0.9;
        luzTras1.intensity *= 0.9;
        luzTras2.intensity *= 0.9;
    }

    let tocandoRampa = false;

    rampas.forEach(rampa => {
        const inicio = rampa.position.z + 2;
        const fin = rampa.position.z - 6;
        const dentroX = Math.abs(coche.position.x - rampa.position.x) < 1.6;

        if (coche.position.z < inicio && coche.position.z > fin && dentroX) {
            tocandoRampa = true;

            const progreso = (coche.position.z - inicio) / (fin - inicio);
            const altura = Math.pow(Math.max(0, Math.min(1, progreso)), 1.5) * 2.2;

            const alturaObjetivo = 1 + altura;
            coche.position.y += (alturaObjetivo - coche.position.y) * 0.3;

            const inclinacionObjetivo = rampa.rotation.x;
            coche.rotation.x += (inclinacionObjetivo - coche.rotation.x) * 0.15;

            if (!enRampa) {
                velocidadY = 0.05 + Math.abs(velocidad) * 0.2;
            }

            enRampa = true;
            enElAire = false;
        }
    });

    if (!tocandoRampa) {
        enRampa = false;
        coche.rotation.x *= 0.9;

        if (coche.position.y > 1 || enElAire) {
            enElAire = true;
            velocidadY -= 0.012;
            coche.position.y += velocidadY;

            if (coche.position.y <= 1) {
                coche.position.y = 0.5;
                velocidadY = 0;
                enElAire = false;
            }
        } else {
            coche.position.y = 1;
        }
    }
}

// 💨 ACTUALIZAR PARTÍCULAS
export function actualizarParticulas() {
    particulas.forEach((p, i) => {

        p.vida -= 0.02;

        p.mesh.position.y += p.velocidadY;
        p.mesh.position.x += p.velocidadX;
        p.mesh.position.z += p.velocidadZ;

        // 🔥 física realista
        p.velocidadX *= 0.96;
        p.velocidadZ *= 0.96;
        p.velocidadY *= 0.97;

        p.mesh.scale.x += p.crecimiento;
        p.mesh.scale.y += p.crecimiento;
        p.mesh.scale.z = p.mesh.scale.x;

        p.mesh.lookAt(camara.position);

        // 🔥 fade pro
        p.mesh.material.opacity = p.vida * p.vida;

        if (p.vida <= 0) {
            escena.remove(p.mesh);
            particulas.splice(i, 1);
        }
    });
}