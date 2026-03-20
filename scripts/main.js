import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';

// UI
document.body.style.margin = "0";
document.body.style.background = "#bfdfff";

// ESCENA
const escena = new THREE.Scene();
escena.background = new THREE.Color(0xbfdfff);
escena.fog = new THREE.Fog(0xbfdfff, 50, 200);

// CÁMARA
const camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// RENDER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// LUCES
escena.add(new THREE.AmbientLight(0xffffff, 0.6));

const sol = new THREE.DirectionalLight(0xffffff, 0.8);
sol.position.set(10, 20, 10);
escena.add(sol);

// 💙 LUZ NITRO
const luzNitro = new THREE.PointLight(0x00ccff, 0, 6);
escena.add(luzNitro);

// 🚗 FAROS
const faro1 = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 6, 0.5);
const faro2 = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 6, 0.5);
escena.add(faro1);
escena.add(faro2);

// 🔴 LUCES TRASERAS
const luzTrasera1 = new THREE.PointLight(0xff0000, 1, 3);
const luzTrasera2 = new THREE.PointLight(0xff0000, 1, 3);
escena.add(luzTrasera1);
escena.add(luzTrasera2);

// CARRETERA
const carretera = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 300),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
);
carretera.rotation.x = -Math.PI / 2;
carretera.receiveShadow = true;
escena.add(carretera);

// LINEAS
for (let i = -150; i < 150; i += 5) {
    const linea = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.1, 2),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    linea.position.set(0, 0.05, i);
    escena.add(linea);
}

// VARIABLES
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

// COCHE
const loader = new GLTFLoader();
loader.load('./modelos/coche.glb', (gltf) => {
    coche = gltf.scene;
    coche.scale.set(1.5, 1.5, 1.5);
    coche.position.y = 0.3;
    coche.rotation.y = Math.PI;

    coche.traverse(obj => {
        if (obj.isMesh) obj.castShadow = true;
    });

    escena.add(coche);
});

// MOVIMIENTO
function moverCoche() {
    if (!coche) return;

    let velocidadBase = 0.1;

    if (turboActivo && nitro > 0) {
        velocidadBase = 0.35;
        nitro -= 0.7;
    } else {
        nitro += 0.3;
    }

    nitro = Math.max(0, Math.min(100, nitro));

    if (teclas['ArrowUp']) velocidad = velocidadBase;
    else if (teclas['ArrowDown']) velocidad = -velocidadBase;
    else velocidad *= 0.92;

    if (teclas['ArrowLeft']) coche.rotation.y += 0.025;
    if (teclas['ArrowRight']) coche.rotation.y -= 0.025;

    coche.position.x -= Math.sin(coche.rotation.y) * velocidad;
    coche.position.z -= Math.cos(coche.rotation.y) * velocidad;
}

// 💨 HUMO SUAVE (SIN CÍRCULOS FEOS)
function crearNitro() {
    if (!coche) return;

    const dirX = Math.sin(coche.rotation.y);
    const dirZ = Math.cos(coche.rotation.y);

    const lateral = 0.25;
    const atras = 1.3;
    const abajo = -0.2;

    for (let i = 0; i < 2; i++) {
        const lado = i === 0 ? 1 : -1;

        const material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.4
        });

        const humo = new THREE.Mesh(
            new THREE.CircleGeometry(Math.random() * 0.15 + 0.08, 32),
            material
        );

        humo.position.set(
            coche.position.x + dirX * atras + Math.cos(coche.rotation.y) * lateral * lado,
            coche.position.y + abajo,
            coche.position.z + dirZ * atras - Math.sin(coche.rotation.y) * lateral * lado
        );

        humo.lookAt(camara.position);

        escena.add(humo);
        particulas.push({ mesh: humo, vida: 1 });
    }
}

// PARTÍCULAS
function actualizarParticulas() {
    particulas.forEach((p, i) => {
        p.vida -= 0.03;

        p.mesh.material.opacity = p.vida;
        p.mesh.scale.multiplyScalar(1.04);
        p.mesh.position.y += 0.01;

        if (p.vida <= 0) {
            escena.remove(p.mesh);
            particulas.splice(i, 1);
        }
    });
}

// LUCES COCHE
function actualizarLuces() {
    if (!coche) return;

    const dirX = Math.sin(coche.rotation.y);
    const dirZ = Math.cos(coche.rotation.y);

    faro1.position.set(coche.position.x + dirX, 0.5, coche.position.z + dirZ);
    faro2.position.set(coche.position.x - dirX, 0.5, coche.position.z + dirZ);

    luzTrasera1.position.set(coche.position.x + dirX, 0.3, coche.position.z - dirZ);
    luzTrasera2.position.set(coche.position.x - dirX, 0.3, coche.position.z - dirZ);
}

// CÁMARA
function actualizarCamara() {
    if (!coche) return;

    const distancia = 7;
    const altura = 3;

    const offsetX = Math.sin(coche.rotation.y) * distancia;
    const offsetZ = Math.cos(coche.rotation.y) * distancia;

    const objetivo = new THREE.Vector3(
        coche.position.x + offsetX,
        coche.position.y + altura,
        coche.position.z + offsetZ
    );

    camara.position.lerp(objetivo, 0.1);
    camara.lookAt(coche.position);
}

// LOOP
function animar() {
    requestAnimationFrame(animar);

    moverCoche();
    actualizarLuces();

    if (turboActivo && nitro > 0) {
        for (let i = 0; i < 4; i++) crearNitro();

        luzNitro.intensity = 2;
        luzNitro.position.copy(coche.position);
    } else {
        luzNitro.intensity = 0;
    }

    actualizarParticulas();
    actualizarCamara();

    renderer.render(escena, camara);
}

animar();

// RESPONSIVE
window.addEventListener('resize', () => {
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});