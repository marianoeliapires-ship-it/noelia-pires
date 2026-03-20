import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ======================
// ESCENA
// ======================
const escena = new THREE.Scene();

// 🌅 CIELO
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;

const ctx = canvas.getContext('2d');
const grad = ctx.createLinearGradient(0, 0, 0, 512);

grad.addColorStop(0, "#ff7e5f");
grad.addColorStop(1, "#ffd6a5");

ctx.fillStyle = grad;
ctx.fillRect(0, 0, 512, 512);

escena.background = new THREE.CanvasTexture(canvas);

// ======================
// CÁMARA
// ======================
const camara = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// ======================
// RENDER
// ======================
const render = new THREE.WebGLRenderer({
  canvas: document.getElementById('lienzo'),
  antialias: true
});
render.setSize(window.innerWidth, window.innerHeight);

// ======================
// LUCES
// ======================
escena.add(new THREE.AmbientLight(0xffffff, 0.6));

const luz = new THREE.DirectionalLight(0xffffff, 1);
luz.position.set(10, 20, 10);
escena.add(luz);

// ======================
// SUELO
// ======================
const suelo = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 100),
  new THREE.MeshStandardMaterial({ color: 0x1f1f1f })
);
suelo.rotation.x = -Math.PI / 2;
escena.add(suelo);

// ======================
// LÍNEAS
// ======================
for (let i = -50; i < 50; i += 5) {
  const linea = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );

  linea.rotation.x = -Math.PI / 2;
  linea.position.set(0, 0.01, i);
  escena.add(linea);
}

// ======================
// 🚗 COCHE
// ======================
let cocheGrupo;

const loader = new GLTFLoader();

loader.load('modelos/coche.glb', function (gltf) {

  const modelo = gltf.scene;

  modelo.scale.set(0.6, 0.6, 0.6);

  // 🔥 orientación correcta
  modelo.rotation.y = Math.PI;

  modelo.position.y = 0.2;

  cocheGrupo = new THREE.Group();
  cocheGrupo.add(modelo);

  cocheGrupo.position.set(0, 0, 5);

  escena.add(cocheGrupo);

  actualizarCamara();
});

// ======================
// CONTROLES
// ======================
const teclas = {};
let velocidad = 0;
let aceleracion = 0.002;
let maxVelocidad = 0.2;
let rotacion = 0.03;

window.addEventListener('keydown', e => teclas[e.key] = true);
window.addEventListener('keyup', e => teclas[e.key] = false);

// ======================
// MOVIMIENTO PRO
// ======================
function moverCoche() {
  if (!cocheGrupo) return;

  if (teclas['ArrowUp']) velocidad += aceleracion;
  else velocidad *= 0.98;

  if (teclas['ArrowDown']) velocidad -= aceleracion;

  if (teclas['Shift']) maxVelocidad = 0.4;
  else maxVelocidad = 0.2;

  velocidad = Math.max(-maxVelocidad, Math.min(maxVelocidad, velocidad));

  // giro
  if (Math.abs(velocidad) > 0.01) {
    if (teclas['ArrowLeft']) cocheGrupo.rotation.y += rotacion;
    if (teclas['ArrowRight']) cocheGrupo.rotation.y -= rotacion;
  }

  // movimiento
  cocheGrupo.position.x += Math.sin(cocheGrupo.rotation.y) * velocidad;
  cocheGrupo.position.z += Math.cos(cocheGrupo.rotation.y) * velocidad;

  // 🎮 INCLINACIÓN PRO REALISTA
  let inclinacion = 0;

  if (Math.abs(velocidad) > 0.01) {
    if (teclas['ArrowLeft']) inclinacion = 0.1;
    if (teclas['ArrowRight']) inclinacion = -0.1;
  }

  cocheGrupo.rotation.z = THREE.MathUtils.lerp(
    cocheGrupo.rotation.z,
    inclinacion,
    0.05
  );
}

// ======================
// CÁMARA PRO (CON ÁNGULO)
// ======================
function actualizarCamara() {
  if (!cocheGrupo) return;

  const distancia = 4;
  const altura = 1.5;
  const lateral = 1.5;

  camara.position.x =
    cocheGrupo.position.x -
    Math.sin(cocheGrupo.rotation.y) * distancia +
    Math.cos(cocheGrupo.rotation.y) * lateral;

  camara.position.z =
    cocheGrupo.position.z -
    Math.cos(cocheGrupo.rotation.y) * distancia -
    Math.sin(cocheGrupo.rotation.y) * lateral;

  camara.position.y = altura;

  camara.lookAt(
    cocheGrupo.position.x,
    cocheGrupo.position.y + 0.5,
    cocheGrupo.position.z
  );
}

// ======================
// LOOP
// ======================
function animar() {
  requestAnimationFrame(animar);

  moverCoche();
  actualizarCamara();

  render.render(escena, camara);
}

animar();