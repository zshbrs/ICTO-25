import * as THREE from "three";

let scene, camera, renderer;
const geom = new THREE.BoxGeometry(20, 20, 20);
let orientationControls;
let mousedown = false, lastX = 0;
let fake = null;
let first = true;

init();
startGPS();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 50000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  if (isMobile() && 'DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', () => {
      const controls = new THREE.DeviceOrientationControls(camera);
      orientationControls = controls;
    }, { once: true });
  }

  window.addEventListener("mousedown", () => mousedown = true);
  window.addEventListener("mouseup", () => mousedown = false);
  window.addEventListener("mousemove", e => {
    if (!mousedown) return;
    if (e.clientX < lastX) camera.rotation.y += 5 * Math.PI / 180;
    else if (e.clientX > lastX) camera.rotation.y -= 5 * Math.PI / 180;
    lastX = e.clientX;
  });

  animate();
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function animate() {
  requestAnimationFrame(animate);
  if (orientationControls) orientationControls.update();
  renderer.render(scene, camera);
  resizeUpdate();
}

function resizeUpdate() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  if (width !== canvas.width || height !== canvas.height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function startGPS() {
  if (fake) {
    setupObjects(fake.lon, fake.lat);
  } else {
    if (!navigator.geolocation) {
      alert("Геолокація не підтримується вашим браузером.");
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      if (first) {
        setupObjects(position.coords.longitude, position.coords.latitude);
        first = false;
      }
    }, err => {
      alert(`GPS error: code ${err.code}`);
    }, { enableHighAccuracy: true });
  }
}

function setupObjects(longitude, latitude) {
  const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const material4 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  const box1 = new THREE.Mesh(geom, material1);
  box1.position.set(0, 0, -100); // північ
  scene.add(box1);

  const box2 = new THREE.Mesh(geom, material2);
  box2.position.set(0, 0, 100); // південь
  scene.add(box2);

  const box3 = new THREE.Mesh(geom, material3);
  box3.position.set(-100, 0, 0); // захід
  scene.add(box3);

  const box4 = new THREE.Mesh(geom, material4);
  box4.position.set(100, 0, 0); // схід
  scene.add(box4);
}

