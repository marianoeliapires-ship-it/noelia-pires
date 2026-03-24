import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';

import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/postprocessing/UnrealBloomPass.js';

// UI
document.body.style.margin = "0";
document.body.style.background = "#bfdfff";

// HUD
const hudVelocidad = document.getElementById("velocidad");
const nitroFill = document.getElementById("nitroFill");

// ESCENA
const escena = new THREE.Scene();
escena.background = new THREE.Color(0xbfdfff);
escena.fog = new THREE.Fog(0xbfdfff, 30, 120);

// CÁMARA
const camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

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
    0.3,
    0.6,
    0.85
);
composer.addPass(bloomPass);

// SUELO
const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: 0x3a7d44 })
);
suelo.rotation.x = -Math.PI / 2;
suelo.position.y = -0.1;
escena.add(suelo);

// LUCES
escena.add(new THREE.AmbientLight(0xffffff, 0.5));

const sol = new THREE.DirectionalLight(0xffffff, 0.6);
sol.position.set(10, 20, 10);
sol.castShadow = true;
escena.add(sol);

// FAROS
const faroIzq = new THREE.SpotLight(0xffffff, 2, 30, Math.PI / 8, 0.5, 1);
const faroDer = new THREE.SpotLight(0xffffff, 2, 30, Math.PI / 8, 0.5, 1);

escena.add(faroIzq, faroDer, faroIzq.target, faroDer.target);

// LUZ TRASERA
const luzTrasera = new THREE.PointLight(0xff0000, 0, 5);
escena.add(luzTrasera);

// ==========================
// 🌲 BOSQUE
// ==========================

const loaderBosque = new GLTFLoader();
let bosqueBase;

loaderBosque.load('./modelos/bosque.glb', (gltf) => {
    bosqueBase = gltf.scene;

    const box = new THREE.Box3().setFromObject(bosqueBase);
    const centro = box.getCenter(new THREE.Vector3());
    bosqueBase.position.sub(centro);

    bosqueBase.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });
});

function crearBosqueLateral(z, anchoCarretera) {
    if (!bosqueBase) return;

    const margen = 6;
    const separacion = anchoCarretera + margen;

    for (let i = 0; i < 2; i++) {
        const lado = i === 0 ? 1 : -1;

        const bosque = bosqueBase.clone();
        bosque.scale.set(4, 4, 4);

        bosque.position.set(
            lado * separacion,
            0,
            z
        );

        escena.add(bosque);
    }
}

// ==========================
// 🛣️ CARRETERA
// ==========================

let anchoCarretera = 5;

const loaderCarretera = new GLTFLoader();
loaderCarretera.load('./modelos/carretera.glb', (gltf) => {

    const modelo = gltf.scene;

    const box = new THREE.Box3().setFromObject(modelo);
    const centro = box.getCenter(new THREE.Vector3());
    modelo.position.sub(centro);

    const size = box.getSize(new THREE.Vector3()).length();
    modelo.scale.setScalar(20 / size);

    const box2 = new THREE.Box3().setFromObject(modelo);
    modelo.position.y -= box2.min.y;

    modelo.traverse(obj => {
        if (obj.isMesh) obj.receiveShadow = true;
    });

    const boxFinal = new THREE.Box3().setFromObject(modelo);
    const tamaño = boxFinal.getSize(new THREE.Vector3());

    const longitud = tamaño.z;
    anchoCarretera = tamaño.x / 2;

    const overlap = 0.5;

    for (let i = 0; i < 60; i++) {
        const tramo = modelo.clone();
        const z = -i * (longitud - overlap);

        tramo.position.set(0, 0, z);
        escena.add(tramo);

        crearBosqueLateral(z, anchoCarretera);
    }
});

// ==========================
// 🧱 RAMPA
// ==========================

const rampaGeometry = new THREE.BoxGeometry(6, 0.8, 12);

const rampaMaterial = new THREE.MeshStandardMaterial({
    color: 0x2b2b2b,
    roughness: 0.9,
    metalness: 0.1
});

const rampa = new THREE.Mesh(rampaGeometry, rampaMaterial);

rampa.position.set(0, 0.4, -18);
rampa.rotation.x = Math.PI / 10;
rampa.rotation.y = Math.PI;

rampa.castShadow = true;
rampa.receiveShadow = true;

escena.add(rampa);

// ==========================
// VARIABLES
// ==========================

let coche;
let velocidad = 0;
let turboActivo = false;
let nitro = 100;

const teclas = {};
let particulas = [];

// CONTROLES
window.addEventListener('keydown', (e) => {
    teclas[e.key] = true;
    if (e.key === 'Shift') turboActivo = true;
});

window.addEventListener('keyup', (e) => {
    teclas[e.key] = false;
    if (e.key === 'Shift') turboActivo = false;
});

// ==========================
// 🚗 COCHE
// ==========================

const loader = new GLTFLoader();
loader.load('./modelos/coche.glb', (gltf) => {
    coche = gltf.scene;

    coche.scale.set(1.8, 1.8, 1.8);
    coche.position.set(0, 1, 0);
    coche.rotation.y = 0;

    coche.traverse(obj => {
        if (obj.isMesh) obj.castShadow = true;
    });

    escena.add(coche);
});

// ==========================
// 🚗 MOVIMIENTO
// ==========================

function moverCoche() {
    if (!coche) return;

    let velocidadBase = 0.1;

    if (turboActivo && nitro > 0) {
        velocidadBase = 0.35;
        nitro -= 0.7;
    } else {
        nitro += 0.3;
    }

    if (teclas['ArrowUp']) velocidad = velocidadBase;
    else if (teclas['ArrowDown']) velocidad = -velocidadBase;
    else velocidad *= 0.92;

    if (teclas['ArrowLeft']) coche.rotation.y += 0.025;
    if (teclas['ArrowRight']) coche.rotation.y -= 0.025;

    coche.position.x -= Math.sin(coche.rotation.y) * velocidad;
    coche.position.z -= Math.cos(coche.rotation.y) * velocidad;

    // ==========================
    // 🧱 RAMPA SIN VIBRACIÓN
    // ==========================

    const inicio = rampa.position.z + 6;
    const fin = rampa.position.z - 6;

    if (coche.position.z < inicio && coche.position.z > fin) {

        const progreso = (coche.position.z - inicio) / (fin - inicio);
        const altura = Math.max(0, Math.min(1, progreso)) * 2.5;

        coche.position.y = 1 + altura;

    } else {
        coche.position.y += (1 - coche.position.y) * 0.15;
    }
}

// ==========================
// 💨 HUMO
// ==========================

function crearNitro() {
    if (!coche) return;

    const humo = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 16),
        new THREE.MeshBasicMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.6
        })
    );

    humo.position.copy(coche.position);
    escena.add(humo);

    particulas.push({
        mesh: humo,
        vida: 1,
        velocidadX: (Math.random() - 0.5) * 0.05,
        velocidadZ: (Math.random() - 0.5) * 0.05,
        crecimiento: 0.02 + Math.random() * 0.02
    });
}

function actualizarParticulas() {
    particulas.forEach((p, i) => {

        p.vida -= 0.025;

        p.mesh.position.y += 0.02;
        p.mesh.position.x += p.velocidadX;
        p.mesh.position.z += p.velocidadZ;

        p.mesh.scale.x += p.crecimiento;
        p.mesh.scale.y += p.crecimiento;

        p.mesh.rotation.z += 0.02;

        p.mesh.material.opacity = p.vida;

        if (p.vida <= 0) {
            escena.remove(p.mesh);
            particulas.splice(i, 1);
        }
    });
}

// ==========================
// 🎥 CÁMARA
// ==========================

function actualizarCamara() {
    if (!coche) return;

    const offset = new THREE.Vector3(
        Math.sin(coche.rotation.y) * 9,
        5.5,
        Math.cos(coche.rotation.y) * 9
    );

    camara.position.lerp(coche.position.clone().add(offset), 0.15);

    const target = coche.position.clone();
    target.y += 1.5;

    camara.lookAt(target);
}

// ==========================
// LOOP
// ==========================

function animar() {
    requestAnimationFrame(animar);

    moverCoche();

    if (turboActivo && nitro > 0) {
        for (let i = 0; i < 5; i++) crearNitro();
    }

    actualizarParticulas();
    actualizarCamara();

    hudVelocidad.textContent = Math.round(Math.abs(velocidad * 200)) + " km/h";
    nitroFill.style.width = nitro + "%";

    composer.render();
}

animar();