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

// 🌍 SUELO INFINITO
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
faroIzq.castShadow = true;
faroDer.castShadow = true;

escena.add(faroIzq, faroDer, faroIzq.target, faroDer.target);

// LUZ TRASERA
const luzTrasera = new THREE.PointLight(0xff0000, 0, 5);
escena.add(luzTrasera);

// ==========================
// 🌳 DECORACIÓN
// ==========================

function crearDecoracion(zPos, anchoCarretera) {
    for (let i = 0; i < 6; i++) {
        const lado = Math.random() > 0.5 ? 1 : -1;

        const arbol = new THREE.Mesh(
            new THREE.ConeGeometry(0.5, 2, 6),
            new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.3, 0.7, 0.4 + Math.random() * 0.2)
            })
        );

        arbol.position.set(
            lado * (anchoCarretera + 3 + Math.random() * 4),
            1,
            zPos + (Math.random() * 10 - 5)
        );

        escena.add(arbol);
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

        crearDecoracion(z, anchoCarretera);
    }
});

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
    coche.scale.set(1.5, 1.5, 1.5);
    coche.position.set(0, 1, 0);
    coche.rotation.y = Math.PI;

    coche.traverse(obj => {
        if (obj.isMesh) obj.castShadow = true;
    });

    escena.add(coche);
});

// ==========================
// 🚗 MOVIMIENTO + COLISIONES
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

    const limite = anchoCarretera * 0.8;

    if (coche.position.x > limite) {
        coche.position.x = limite;
        velocidad *= 0.5;
    }

    if (coche.position.x < -limite) {
        coche.position.x = -limite;
        velocidad *= 0.5;
    }

    if (Math.abs(coche.position.x) > limite * 0.9) {
        velocidad *= 0.95;
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
            opacity: 0.5
        })
    );

    humo.position.copy(coche.position);
    escena.add(humo);
    particulas.push({ mesh: humo, vida: 1 });
}

function actualizarParticulas() {
    particulas.forEach((p, i) => {
        p.vida -= 0.03;
        p.mesh.material.opacity = p.vida;
        p.mesh.scale.multiplyScalar(1.05);

        if (p.vida <= 0) {
            escena.remove(p.mesh);
            particulas.splice(i, 1);
        }
    });
}

// ==========================
// EFECTOS
// ==========================

function actualizarFaros() {
    if (!coche) return;

    const dirX = Math.sin(coche.rotation.y);
    const dirZ = Math.cos(coche.rotation.y);

    faroIzq.position.set(coche.position.x - dirX * -1.2, coche.position.y + 0.5, coche.position.z - dirZ * -1.2);
    faroDer.position.copy(faroIzq.position);

    faroIzq.target.position.set(coche.position.x - dirX * 10, coche.position.y, coche.position.z - dirZ * 10);
    faroDer.target.position.copy(faroIzq.target.position);
}

function actualizarLuzTrasera() {
    if (!coche) return;

    luzTrasera.position.copy(coche.position);
    luzTrasera.intensity = teclas['ArrowUp'] ? 2 : 0.5;
}

function actualizarFOV() {
    const objetivo = 75 + Math.min(Math.abs(velocidad) * 100, 25);
    camara.fov += (objetivo - camara.fov) * 0.1;
    camara.updateProjectionMatrix();
}

function actualizarHUD() {
    hudVelocidad.textContent = Math.round(Math.abs(velocidad * 200)) + " km/h";
    nitroFill.style.width = nitro + "%";
}

function actualizarCamara() {
    if (!coche) return;

    const offset = new THREE.Vector3(
        Math.sin(coche.rotation.y) * 7,
        3,
        Math.cos(coche.rotation.y) * 7
    );

    camara.position.lerp(coche.position.clone().add(offset), 0.1);
    camara.lookAt(coche.position);
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
    actualizarFOV();
    actualizarHUD();
    actualizarLuzTrasera();
    actualizarFaros();

    composer.render();
}

animar();