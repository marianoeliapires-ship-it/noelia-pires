import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

export const escena = new THREE.Scene();
escena.background = new THREE.Color(0xbfdfff);
escena.fog = new THREE.Fog(0xbfdfff, 30, 120);

// SUELO
export const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: 0x3a7d44 })
);
suelo.rotation.x = -Math.PI / 2;
suelo.position.y = -0.1;
escena.add(suelo);

// LUCES GENERALES
escena.add(new THREE.AmbientLight(0xffffff, 0.1));
export const sol = new THREE.DirectionalLight(0xffffff, 0.6);
sol.position.set(10, 20, 10);
sol.castShadow = true;
escena.add(sol);
