document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./targets.mind", // твій маркер
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // Світло
  const pointLight = new THREE.PointLight(0xffffff, 2);
  pointLight.position.set(3, 3, 3); // умовна відстань 30 000 км
  scene.add(pointLight);
  scene.add(new THREE.AmbientLight(0x555555));

  // Завантаження текстур
  const loader = new THREE.TextureLoader();
  const earthTexture = loader.load('./2k_earth_daymap.jpg');
  const moonTexture = loader.load('./2k_moon.jpg');

  // Масштабовані розміри
  const earthRadius = 0.2;
  const moonRadius = 0.05;
  const moonDistance = 0.5;

  // Земля
  const earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius, 64, 64),
    new THREE.MeshPhongMaterial({ map: earthTexture })
  );

  // Місяць
  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(moonRadius, 64, 64),
    new THREE.MeshPhongMaterial({ map: moonTexture })
  );

  const moonOrbit = new THREE.Object3D();
  moonMesh.position.set(moonDistance, 0, 0);
  moonOrbit.add(moonMesh);

  // Група для Earth+Moon
  const group = new THREE.Group();
  group.add(earthMesh);
  group.add(moonOrbit);

  anchor.group.add(group);

  // Анімація
  const clock = new THREE.Clock();
  const timeScale = 17000;
  const earthSpeed = (2 * Math.PI / 86400) * timeScale;
  const moonSpeed = (2 * Math.PI / (86400 * 28)) * timeScale;

  const animate = () => {
    const delta = clock.getDelta();
    earthMesh.rotation.y += earthSpeed * delta;
    moonOrbit.rotation.y += moonSpeed * delta;
    renderer.render(scene, camera);
  };

  await mindarThree.start();
  renderer.setAnimationLoop(animate);
});
