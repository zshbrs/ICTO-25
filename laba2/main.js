const start = async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./assets/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // Освітлення
  const light = new THREE.PointLight(0xffffff, 1.5);
  light.position.set(30, 0, 0); // 30 000 км умовно
  scene.add(light);

  const anchor = mindarThree.addAnchor(0);
  const group = new THREE.Group();
  anchor.group.add(group);

  // Завантаження текстур
  const loader = new THREE.TextureLoader();
  const earthTexture = loader.load('./assets/2k_earth_daymap.jpg');
  const moonTexture = loader.load('./assets/2k_moon.jpg');

  // Земля
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(0.064, 64, 64),
    new THREE.MeshStandardMaterial({ map: earthTexture })
  );

  // Місяць
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.0174, 64, 64),
    new THREE.MeshStandardMaterial({ map: moonTexture })
  );
  moon.position.set(0.2, 0, 0);

  const moonOrbit = new THREE.Object3D();
  moonOrbit.add(moon);

  group.add(earth);
  group.add(moonOrbit);

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    const t = performance.now() / 1000;
    earth.rotation.y = t * 2 * Math.PI / (1 / 17000);     // Земля за добу
    moonOrbi

