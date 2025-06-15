document.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./targets.mind", // правильна назва
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // Світло
  const light = new THREE.PointLight(0xffffff, 2);
  light.position.set(3, 3, 3);
  scene.add(light);

  const earthRadius = 0.064; // масштабовано
  const moonRadius = 0.0174;
  const moonDistance = 0.384;

  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('./2k_earth_daymap.jpg');
  const moonTexture = textureLoader.load('./2k_moon.jpg');

  const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
  const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);

  const moonGeometry = new THREE.SphereGeometry(moonRadius, 64, 64);
  const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
  const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

  const moonOrbit = new THREE.Object3D();
  moonMesh.position.set(moonDistance, 0, 0);
  moonOrbit.add(moonMesh);

  const group = new THREE.Group();
  group.add(earthMesh);
  group.add(moonOrbit);

  anchor.group.add(group);

  // Анімація
  let clock = new THREE.Clock();

  const animate = () => {
    const delta = clock.getDelta();

    const scale = 17000;
    const earthRotationSpeed = (2 * Math.PI / 86400) * scale;
    const moonOrbitSpeed = (2 * Math.PI / (86400 * 28)) * scale;

    earthMesh.rotation.y += earthRotationSpeed * delta;
    moonOrbit.rotation.y += moonOrbitSpeed * delta;

    renderer.render(scene, camera);
  };

  await mindarThree.start();
  renderer.setAnimationLoop(animate);
});
