import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import { escena } from './escena.js';

let agua;

export function cargarAgua() {
    agua = new THREE.Mesh(
        new THREE.PlaneGeometry(600, 600, 100, 100),
        new THREE.MeshStandardMaterial({
            color: 0x4ec1e6,
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        })
    );
    agua.rotation.x = -Math.PI / 2;
    agua.position.set(0, 0.5, 400);
    escena.add(agua);
}

export function actualizarAgua(tiempo) {
    if (agua) {
        const pos = agua.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);

            const ola =
                Math.sin(x * 0.2 + tiempo) * 0.2 +
                Math.cos(y * 0.3 + tiempo) * 0.2;

            pos.setZ(i, ola);
        }
        agua.geometry.attributes.position.needsUpdate = true;
    }
}
