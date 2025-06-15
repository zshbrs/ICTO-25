document.addEventListener("DOMContentLoaded", async () => {
  const statusDiv = document.getElementById('status');
  const instructionsDiv = document.getElementById('instructions');
  
  // Функція оновлення статусу
  const updateStatus = (message) => {
    statusDiv.textContent = message;
    console.log(message);
  };

  try {
    updateStatus('Перевірка підтримки WebGL...');
    
    // Перевірка WebGL
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      throw new Error('WebGL не підтримується цим браузером');
    }

    updateStatus('Ініціалізація MindAR...');
    
    // Ініціалізація MindAR
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.querySelector("#ar-container"),
      imageTargetSrc: "./targets.mind",
      maxTrack: 1,
      filterMinCF: 0.0001,
      filterBeta: 0.001,
      warmupTolerance: 5,
      missTolerance: 5
    });

    const { renderer, scene, camera } = mindarThree;
    
    // Налаштування рендерера
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    updateStatus('Створення 3D об\'єктів...');
    
    const anchor = mindarThree.addAnchor(0);

    // Освітлення
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Параметри системи (зменшені для кращої видимості)
    const earthRadius = 0.03;
    const moonRadius = 0.008;
    const moonDistance = 0.08;

    // Завантаження текстур з fallback
    const textureLoader = new THREE.TextureLoader();
    
    const loadTextureWithFallback = (url, fallbackColor) => {
      return new Promise((resolve) => {
        textureLoader.load(
          url,
          (texture) => {
            console.log(`Текстура завантажена: ${url}`);
            resolve(texture);
          },
          undefined,
          (error) => {
            console.warn(`Не вдалося завантажити ${url}, використовуємо колір`);
            resolve(null);
          }
        );
      });
    };

    const [earthTexture, moonTexture] = await Promise.all([
      loadTextureWithFallback('./2k_earth_daymap.jpg', 0x4a90e2),
      loadTextureWithFallback('./2k_moon.jpg', 0xcccccc)
    ]);

    // Створення Землі
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 32, 32);
    const earthMaterial = earthTexture ? 
      new THREE.MeshLambertMaterial({ map: earthTexture }) :
      new THREE.MeshLambertMaterial({ color: 0x4a90e2 });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);

    // Створення Місяця
    const moonGeometry = new THREE.SphereGeometry(moonRadius, 16, 16);
    const moonMaterial = moonTexture ?
      new THREE.MeshLambertMaterial({ map: moonTexture }) :
      new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

    // Орбіта Місяця
    const moonOrbit = new THREE.Object3D();
    moonMesh.position.set(moonDistance, 0, 0);
    moonOrbit.add(moonMesh);

    // Траєкторія орбіти (опціонально)
    const orbitGeometry = new THREE.RingGeometry(moonDistance - 0.001, moonDistance + 0.001, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x888888, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbitRing.rotation.x = Math.PI / 2;

    // Група системи
    const systemGroup = new THREE.Group();
    systemGroup.add(earthMesh);
    systemGroup.add(moonOrbit);
    systemGroup.add(orbitRing);
    
    // Початковий поворот для кращого вигляду
    systemGroup.rotation.x = 0.1;
    
    anchor.group.add(systemGroup);

    // Анімація
    const clock = new THREE.Clock();
    let isTracking = false;

    // Обробники подій трекінгу
    anchor.onTargetFound = () => {
      isTracking = true;
      updateStatus('Маркер знайдено!');
      instructionsDiv.style.display = 'none';
    };

    anchor.onTargetLost = () => {
      isTracking = false;
      updateStatus('Маркер втрачено');
      instructionsDiv.style.display = 'block';
    };

    const animate = () => {
      const delta = clock.getDelta();
      
      if (isTracking) {
        // Швидкості обертання (прискорені для демонстрації)
        const speedMultiplier = 2;
        const earthRotationSpeed = (2 * Math.PI / 10) * speedMultiplier; // повний оберт за 5 секунд
        const moonOrbitSpeed = (2 * Math.PI / 20) * speedMultiplier; // повний оберт за 10 секунд
        const moonRotationSpeed = moonOrbitSpeed; // синхронне обертання

        earthMesh.rotation.y += earthRotationSpeed * delta;
        moonOrbit.rotation.y += moonOrbitSpeed * delta;
        moonMesh.rotation.y += moonRotationSpeed * delta;
      }

      renderer.render(scene, camera);
    };

    // Обробка змін розміру вікна
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    updateStatus('Запуск камери...');
    
    // Запуск MindAR
    await mindarThree.start();
    
    updateStatus('AR готовий! Шукайте маркер');
    renderer.setAnimationLoop(animate);

    // Приховати статус через 3 секунди
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);

  } catch (error) {
    console.error('Помилка:', error);
    updateStatus('Помилка: ' + error.message);
    
    // Показати детальну інформацію про помилку
    if (error.message.includes('camera')) {
      instructionsDiv.innerHTML = 'Помилка доступу до камери.<br>Перевірте дозволи браузера.';
    } else if (error.message.includes('targets.mind')) {
      instructionsDiv.innerHTML = 'Файл targets.mind не знайдено.<br>Перевірте що файл існує.';
    } else {
      instructionsDiv.innerHTML = 'Помилка завантаження.<br>Спробуйте оновити сторінку.';
    }
  }
});
