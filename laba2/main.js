import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

const start = async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  const light = new THREE.PointLight(0xffffff, 1.5, 0);
  light.position.set(30, 0, 0); // 30 "тис." км умовно
  scene.add(light);

  const anchor = mindarThree.addAnchor(0);
  const group = new THREE.Group();
  anchor.group.add(group);

  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('./assets/2k_earth_daymap.jpg');
  const moonTexture = textureLoader.load('./assets/2k_moon.jpg');

  const earthRadius = 0.064;
  const moonRadius = 0.0174;
  const moonDistance = 0.2;

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius, 64, 64),
    new THREE.MeshStandardMaterial({ map: earthTexture })
  );

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(moonRadius, 64, 64),
    new THREE.MeshStandardMaterial({ map: moonTexture })
  );
  moon.position.set(moonDistance, 0, 0);

  const moonOrbit = new THREE.Object3D();
  moonOrbit.add(moon);

  group.add(earth);
  group.add(moonOrbit);

  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    const time = performance.now() / 1000;

    // 1 оберт Землі = 1 доба => оберт за 1/17000 секунди
    earth.rotation.y = time * (2 * Math.PI / (1 / 17000));

    // 1 оберт Місяця навколо Землі = 28 діб => за 28/17000 секунди
    moonOrbit.rotation.y = time * (2 * Math.PI / (28 / 17000));

    renderer.render(scene, camera);
  });
};
start();
