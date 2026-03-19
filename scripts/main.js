// IMPORTAR THREE
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

// =======================
// ESCENA
// =======================
const escena = new THREE.Scene();
escena.background = new THREE.Color(0x87ceeb);

// =======================
// CÁMARA
// =======================
const camara = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camara.position.set(0, 5, 10);

// =======================
// RENDER
// =======================
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('lienzo')
});
renderer.setSize(window.innerWidth, window.innerHeight);

// =======================
// LUZ
// =======================
const luz = new THREE.DirectionalLight(0xffffff, 1);
luz.position.set(5, 10, 5);
escena.add(luz);

// =======================
// SUELO (CIRCUITO BASE)
// =======================
const sueloGeo = new THREE.PlaneGeometry(50, 50);
const sueloMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
const suelo = new THREE.Mesh(sueloGeo, sueloMat);

suelo.rotation.x = -Math.PI / 2;
escena.add(suelo);

// =======================
// RAMPA
// =======================
const rampaGeo = new THREE.BoxGeometry(5, 0.5, 3);
const rampaMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const rampa = new THREE.Mesh(rampaGeo, rampaMat);

rampa.position.set(0, 0.25, -5);
rampa.rotation.x = -0.3;

escena.add(rampa);

// =======================
// COCHE (CUBO)
// =======================
const cocheGeo = new THREE.BoxGeometry(1, 1, 2);
const cocheMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const coche = new THREE.Mesh(cocheGeo, cocheMat);

coche.position.y = 0.5;
escena.add(coche);

// =======================
// CONTROLES
// =======================
const teclas = {};

window.addEventListener("keydown", (e) => teclas[e.key] = true);
window.addEventListener("keyup", (e) => teclas[e.key] = false);

// =======================
// VELOCIDAD
// =======================
let velocidad = 0.1;

// =======================
// ANIMACIÓN
// =======================
function animar() {
  requestAnimationFrame(animar);

  // MOVIMIENTO
  if (teclas["ArrowUp"]) coche.position.z -= velocidad;
  if (teclas["ArrowDown"]) coche.position.z += velocidad;
  if (teclas["ArrowLeft"]) coche.position.x -= velocidad;
  if (teclas["ArrowRight"]) coche.position.x += velocidad;

  // TURBO (SHIFT)
  if (teclas["Shift"]) {
    velocidad = 0.3;
  } else {
    velocidad = 0.1;
  }

  // CÁMARA SIGUE AL COCHE
  camara.position.x = coche.position.x;
  camara.position.z = coche.position.z + 10;
  camara.lookAt(coche.position);

  renderer.render(escena, camara);
}

// INICIAR
animar();

// =======================
// RESPONSIVE
// =======================
window.addEventListener("resize", () => {
  camara.aspect = window.innerWidth / window.innerHeight;
  camara.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});