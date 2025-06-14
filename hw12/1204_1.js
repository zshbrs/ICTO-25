import * as THREE from 'https://cdn.skypack.dev/three@0.159.0';

let scene, camera, renderer;

init();
getLocation();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  animate();
}

function getLocation() {
  if (!navigator.geolocation) {
    alert("Ваш браузер не підтримує геолокацію.");
    return;
  }

  navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
}

function success(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  console.log(`📍 Локація: ${lat}, ${lon}`);

  addCubes(lat, lon);
}

function error(err) {
  console.warn(`❌ GPS error (${err.code}): ${err.message}`);
}

function addCubes(lat, lon) {
  const geom = new THREE.BoxGeometry(1, 1, 1);
  const mNorth = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mSouth = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const mWest = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const mEast = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  const cubeN = new THREE.Mesh(geom, mNorth);
  cubeN.position.set(0, 0, -3); // північ (вперед)
  scene.add(cubeN);

  const cubeS = new THREE.Mesh(geom, mSouth);
  cubeS.position.set(0, 0, 3); // південь (назад)
  scene.add(cubeS);

  const cubeW = new THREE.Mesh(geom, mWest);
  cubeW.position.set(-3, 0, 0); // захід (ліворуч)
  scene.add(cubeW);

  const cubeE = new THREE.Mesh(geom, mEast);
  cubeE.position.set(3, 0, 0); // схід (праворуч)
  scene.add(cubeE);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
