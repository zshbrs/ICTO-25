import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

document.addEventListener('DOMContentLoaded', () => {
    const startAR = async () => {
        const mindarThree = new MindARThree({
            container: document.querySelector('.ar-container'),
            imageTargetSrc: 'targets.mind', // Файл з даними маркерів
        });
        const { renderer, scene, camera } = mindarThree;

        // Масштабування для моделей
        const SCALE_FACTOR = 0.0001; // 1 км = 0.0001 одиниці Three.js

        // Радіуси планет у Three.js одиницях
        const EARTH_RADIUS = 6400 * SCALE_FACTOR;
        const MOON_RADIUS = 1740 * SCALE_FACTOR;

        // Відстань від Землі до Місяця (приблизно 384400 км)
        const EARTH_MOON_DISTANCE = 384400 * SCALE_FACTOR * 10; // Збільшимо для кращої візуалізації

        // Відстань джерела світла
        const LIGHT_DISTANCE = 30000 * SCALE_FACTOR * 100; // Достатньо далеко

        // Часовий масштаб: 1:17000. Це означає, що 1 секунда в реальному світі = 17000 секунд у моделі.
        // Переводимо у години: 17000 секунд / 3600 секунд/година = 4.72 години.
        // Або в дні: 17000 секунд / (3600 секунд/година * 24 години/день) = 0.196 діб.
        // Щоб зрозуміти, скільки реальних секунд потрібно для 1 дня на Землі:
        // 1 доба / (17000 секунд/секунда_реальна / 86400 секунд/доба) = 5.08 секунд реального часу.
        // Тобто, 1 день на Землі (3600*24 секунд) буде пройдено за 5.08 реальних секунд.
        const TIME_SCALE = 17000; // 1 секунда реального часу = 17000 секунд модельного часу
        const SECONDS_PER_DAY = 24 * 60 * 60; // Секунд у добі

        // Завантаження текстур
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = await textureLoader.loadAsync('2k_earth_daymap.jpg');
        const moonTexture = await textureLoader.loadAsync('2k_moon.jpg');

        // Створення Землі
        // segments-height (кількість сегментів по вертикалі) має бути достатньо високою для плавної сфери.
        // Зазвичай використовують значення від 32 до 64. Для 2k текстури 64 буде добре.
        const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.rotation.order = 'YXZ'; // Для правильного застосування обертань
        scene.add(earth);

        // Створення Місяця
        const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);
        const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(EARTH_MOON_DISTANCE, 0, 0); // Початкове положення Місяця
        earth.add(moon); // Місяць обертається навколо Землі

        // Джерело світла (сонце)
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(LIGHT_DISTANCE, LIGHT_DISTANCE, LIGHT_DISTANCE); // Позиція відносно центру сцени
        scene.add(light);

        // Додаємо амбієнтне світло для загальної освітленості
        const ambientLight = new THREE.AmbientLight(0x404040); // М'яке біле світло
        scene.add(ambientLight);

        // Позиціонування камери
        camera.position.set(0, 0, 0.5); // Розмістіть камеру трохи ближче до об'єктів
        camera.lookAt(0, 0, 0);

        // Анімація
        let lastTime = performance.now();

        const animate = () => {
            const currentTime = performance.now();
            const deltaTime = (currentTime - lastTime) / 1000; // Час в секундах
            lastTime = currentTime;

            const modelDeltaTime = deltaTime * TIME_SCALE; // Дельта часу в модельних секундах

            // Обертання Землі навколо своєї осі: 1 доба
            // Переводимо 1 добу в радіани: (2 * Math.PI) радіан / SECONDS_PER_DAY модельного часу
            earth.rotation.y += (2 * Math.PI / SECONDS_PER_DAY) * modelDeltaTime;

            // Обертання Місяця навколо Землі: 28 діб
            // Місяць є дочірнім об'єктом Землі, тому його обертання буде відносно Землі
            const MOON_ORBIT_PERIOD_SECONDS = 28 * SECONDS_PER_DAY;
            moon.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), (2 * Math.PI / MOON_ORBIT_PERIOD_SECONDS) * modelDeltaTime);

            renderer.render(scene, camera);
        };

        // Ініціалізація MindAR
        const anchor = mindarThree.addAnchor(0); // Anchor index 0 corresponds to the first target in targets.mind
        anchor.group.add(earth); // Додаємо Землю до групи анкору, щоб вона з'являлася на маркері

        await mindarThree.start();
        renderer.setAnimationLoop(animate);
    };

    startAR();
});
