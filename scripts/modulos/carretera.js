import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js';
import { escena } from './escena.js';
import { crearBosqueLateral } from './entorno.js';
import { getCoche } from './coche.js';
import { LIMITE_CARRETERA, LIMITE_BOSQUE } from './constantes.js';

export let anchoCarretera = 5;
export const rampas = [];
export const farolas = [];

export function cargarCarretera() {
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

        // 🔥 LIMITE TIERRA
        const LIMITE_FIN_CARRETERA = -200;

        while (zActual > LIMITE_FIN_CARRETERA) {
            const z = -i * (longitud - 0.5);

            const tramo = modelo.clone();
            tramo.position.set(0, 0, z);
            escena.add(tramo);

            if (z > LIMITE_BOSQUE) {
                crearBosqueLateral(z, anchoCarretera);
            }

            zActual = z;
            i++;
        }

        crearFarolas(anchoCarretera);
    });

    crearRampa(-1.8, -18);
    crearRampa(-1.8, -60);
    crearRampa(-1.8, -100);
}

function crearRampa(x, z, invertida = false) {
    const geo = new THREE.BoxGeometry(4, 0.8, 15);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x2b2b2b,
        roughness: 0.9,
        metalness: 0.1
    });

    const rampa = new THREE.Mesh(geo, mat);
    rampa.position.set(x, 0.4, z);
    rampa.rotation.x = invertida ? -Math.PI / 10 : Math.PI / 10;
    rampa.castShadow = true;
    rampa.receiveShadow = true;

    escena.add(rampa);
    rampas.push(rampa);
}

function crearFarolas(ancho) {
    for (let i = 0; i < 35; i++) {
        const lado = i % 2 === 0 ? 1 : -1;
        const x = lado * (ancho + 3);
        const z = -i * 12;

        if (z < LIMITE_CARRETERA) break;

        const poste = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 4),
            new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        poste.position.set(x, 2, z);
        escena.add(poste);

        const luz = new THREE.PointLight(0xffddaa, 0, 60);
        luz.position.set(x, 4, z);

        escena.add(luz);
        farolas.push(luz);

        const bombilla = new THREE.Mesh(
            new THREE.SphereGeometry(0.3),
            new THREE.MeshBasicMaterial({ color: 0xffddaa })
        );
        bombilla.position.set(x, 4, z);
        escena.add(bombilla);
    }
}

export function limitarCarretera() {
    const cocheObj = getCoche();
    if (!cocheObj) return;

    const limite = anchoCarretera - 1;

    if (cocheObj.position.y <= 1.5) {
        if (cocheObj.position.x > limite) cocheObj.position.x = limite;
        if (cocheObj.position.x < -limite) cocheObj.position.x = -limite;
    }
}

export function actualizarFarolas(progresoAtardecer) {
    farolas.forEach(luz => {
        luz.intensity = Math.pow(progresoAtardecer, 1.5) * 10;
    });
}