import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/postprocessing/UnrealBloomPass.js';

// UI
document.body.style.margin = "0";
document.body.style.background = "#bfdfff";
const hudVelocidad = document.getElementById("velocidad");
const nitroFill = document.getElementById("nitroFill");

// ESCENA
const escena = new THREE.Scene();
escena.background = new THREE.Color(0xbfdfff);
escena.fog = new THREE.Fog(0xbfdfff, 30, 120);

// 🔥 ATARDECER (AÑADIDO)
const colorAtardecer = new THREE.Color(0xffb38a);
const colorFogAtardecer = new THREE.Color(0xffa070);
let atardecerActivo = false;
let atardecerProgreso = 0;

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
    0.3, 0.6, 0.85
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

// LUCES GENERALES
escena.add(new THREE.AmbientLight(0xffffff, 0.5));
const sol = new THREE.DirectionalLight(0xffffff, 0.6);
sol.position.set(10, 20, 10);
sol.castShadow = true;
escena.add(sol);

// ==========================
// 🌅 FUNCIÓN ATARDECER (AÑADIDO)
// ==========================
function actualizarAtardecer() {
    if (!atardecerActivo) return;

    if (atardecerProgreso < 1) {
        atardecerProgreso += 0.004;
    }

    escena.background.lerp(colorAtardecer, atardecerProgreso);
    escena.fog.color.lerp(colorFogAtardecer, atardecerProgreso);

    sol.color.lerp(new THREE.Color(0xffcc99), atardecerProgreso);
    sol.intensity = THREE.MathUtils.lerp(0.6, 0.4, atardecerProgreso);

    bloomPass.strength = THREE.MathUtils.lerp(0.3, 0.5, atardecerProgreso);
}

// ==========================
// 🌲 BOSQUE
// ==========================
const loaderBosque = new GLTFLoader();
let bosqueBase;

// 🔥 AÑADIDO: ANIMALES (NO TOCA NADA EXISTENTE)
const loaderAnimales = new GLTFLoader();
let animalesBase = [];

loaderAnimales.load('./modelos/wolf.glb', (gltf) => {
    animalesBase.push(gltf.scene);
});
loaderAnimales.load('./modelos/bear.glb', (gltf) => {
    animalesBase.push(gltf.scene);
});
loaderAnimales.load('./modelos/deer.glb', (gltf) => {
    animalesBase.push(gltf.scene);
});

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
        bosque.position.set(lado * separacion, 0, z);

        escena.add(bosque);

        if (animalesBase.length > 0 && Math.random() < 0.3) {

            const base = animalesBase[Math.floor(Math.random() * animalesBase.length)];
            const animal = base.clone();

            animal.scale.set(1.5, 1.5, 1.5);

            animal.position.set(
                lado * (separacion + 2 + Math.random() * 3),
                0,
                z + (Math.random() * 8 - 4)
            );

            animal.rotation.y = Math.random() * Math.PI * 2;

            const box = new THREE.Box3().setFromObject(animal);
            animal.position.y = -box.min.y;

            animal.traverse(obj => {
                if (obj.isMesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            });

            escena.add(animal);
        }
    }
}

// ==========================
// 🛣️ CARRETERA
// ==========================
let anchoCarretera = 5;

const Z_TERCERA_RAMPA = -100;
const EXTRA_FINAL = 40;
const LIMITE_CARRETERA = Z_TERCERA_RAMPA - EXTRA_FINAL;

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

    let i = 0;
    let zActual = 0;

    while (zActual > LIMITE_CARRETERA) {

        const tramo = modelo.clone();
        const z = -i * (longitud - 0.5);

        tramo.position.set(0, 0, z);
        escena.add(tramo);

        crearBosqueLateral(z, anchoCarretera);

        zActual = z;
        i++;
    }
});

// ==========================
// 🧱 RAMPAS
// ==========================
const rampas = [];

function crearRampa(x, z) {
    const geo = new THREE.BoxGeometry(6, 0.8, 12);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x2b2b2b,
        roughness: 0.9,
        metalness: 0.1
    });

    const rampa = new THREE.Mesh(geo, mat);
    rampa.position.set(x, 0.4, z);
    rampa.rotation.x = Math.PI / 10;
    rampa.rotation.y = 0;

    rampa.castShadow = true;
    rampa.receiveShadow = true;

    escena.add(rampa);
    rampas.push(rampa);
}

crearRampa(0, -18);
crearRampa(0, -60);
crearRampa(0, -100);

// ==========================
// VARIABLES
// ==========================
let coche;
let velocidad = 0;
let turboActivo = false;
let nitro = 100;
let velocidadY = 0;
let enRampa = false;
let enElAire = false;

let luzDel1, luzDel2, luzTras1, luzTras2;

const teclas = {};
let particulas = [];

// CONTROLES

window.addEventListener('keydown', (e) => {
    teclas[e.key] = true;
    if (e.code === 'Space') turboActivo = true; // 🔥 CAMBIO
});

window.addEventListener('keyup', (e) => {
    teclas[e.key] = false;
    if (e.code === 'Space') turboActivo = false; // 🔥 CAMBIO
});



// ==========================
// 🚗 COCHE
// ==========================
const loader = new GLTFLoader();

loader.load('./modelos/coche.glb', (gltf) => {
    coche = gltf.scene;

    coche.scale.set(1.8, 1.8, 1.8);
    coche.position.set(0, 1, 0);

    coche.traverse(obj => {
        if (obj.isMesh) obj.castShadow = true;
    });

    luzDel1 = new THREE.SpotLight(0x66ccff, 0, 30, Math.PI/8);
    luzDel2 = new THREE.SpotLight(0x66ccff, 0, 30, Math.PI/8);

    luzDel1.position.set(-0.5, 0.5, 1.5);
    luzDel2.position.set(0.5, 0.5, 1.5);

    coche.add(luzDel1, luzDel2);

    luzTras1 = new THREE.PointLight(0xff0000, 0, 5);
    luzTras2 = new THREE.PointLight(0xff0000, 0, 5);

    luzTras1.position.set(-0.5, 0.3, -1.5);
    luzTras2.position.set(0.5, 0.3, -1.5);

    coche.add(luzTras1, luzTras2);

    escena.add(coche);
});

// ==========================
// 🚗 MOVIMIENTO + FÍSICA
// ==========================
function moverCoche() {
    if (!coche) return;

    let velocidadBase = 0.12;

    if (turboActivo && nitro > 0) {
        velocidadBase = 0.35;
        nitro -= 1.2;
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

    // 🔥 ACTIVAR ATARDECER (AÑADIDO)
    if (coche.position.z < -50) {
        atardecerActivo = true;
    }

    // 🔥 LUCES
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
        const inicio = rampa.position.z + 6;
        const fin = rampa.position.z - 6;

        if (coche.position.z < inicio && coche.position.z > fin) {
            tocandoRampa = true;

            const progreso = (coche.position.z - inicio) / (fin - inicio);
            const altura = Math.max(0, Math.min(1, progreso)) * 2.2;

            coche.position.y = 1 + altura;

            if (!enRampa) {
                velocidadY = 0.08 + Math.abs(velocidad) * 0.2;
            }

            enRampa = true;
            enElAire = false;
        }
    });

    if (!tocandoRampa) {
        enRampa = false;

        if (coche.position.y > 1 || enElAire) {
            enElAire = true;
            velocidadY -= 0.012;
            coche.position.y += velocidadY;

            if (coche.position.y <= 1) {
                coche.position.y = 1;
                velocidadY = 0;
                enElAire = false;
            }
        } else {
            coche.position.y = 1;
        }
    }

    // 💨 HUMO
    if (turboActivo && nitro > 0) {
        for (let i = 0; i < 5; i++) {
            const offsets = [
                new THREE.Vector3(-0.35, -0.2, -1.2),
                new THREE.Vector3(0.35, -0.2, -1.2)
            ];

            offsets.forEach(offsetLocal => {
                const humo = new THREE.Mesh(
                    new THREE.SphereGeometry(0.08, 8, 8),
                    new THREE.MeshBasicMaterial({
                        color: 0x888888,
                        transparent: true,
                        opacity: 0.4
                    })
                );

                const offset = offsetLocal.clone();
                offset.applyAxisAngle(new THREE.Vector3(0,1,0), coche.rotation.y);

                humo.position.copy(coche.position).add(offset);

                escena.add(humo);

                particulas.push({
                    mesh: humo,
                    vida: 1,
                    velocidadX: (Math.random() - 0.5) * 0.015,
                    velocidadZ: (Math.random() - 0.5) * 0.015,
                    velocidadY: 0.02 + Math.random() * 0.01,
                    crecimiento: 0.02 + Math.random() * 0.02
                });
            });
        }
    }
}

// ==========================
// PARTÍCULAS
// ==========================
function actualizarParticulas() {
    particulas.forEach((p, i) => {
        p.vida -= 0.02;

        p.mesh.position.y += p.velocidadY;
        p.mesh.position.x += p.velocidadX;
        p.mesh.position.z += p.velocidadZ;

        p.mesh.scale.x += p.crecimiento;
        p.mesh.scale.y += p.crecimiento;

        p.mesh.material.opacity = p.vida;

        if (p.vida <= 0) {
            escena.remove(p.mesh);
            particulas.splice(i, 1);
        }
    });
}

// ==========================
// CÁMARA
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
    actualizarParticulas();
    actualizarCamara();
    actualizarAtardecer(); // 🔥 añadido

    const kmh = Math.round(Math.abs(velocidad * 400));
    hudVelocidad.textContent = kmh + " km/h";
    nitroFill.style.width = nitro + "%";

    composer.render();
}

animar();