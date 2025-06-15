// main.js - Основний скрипт для AR-сцени Земля-Місяць

// Three.js тепер завантажується з CDN і доступний глобально як 'THREE'.
// Тому нам НЕ потрібен локальний імпорт 'import * as THREE from ...'.
// Якщо ви залишите його, це може викликати конфлікти або помилки.

// Імпортуємо MindARThree з його шляху.
// Це єдиний імпорт, який має бути у main.js, оскільки сам MindARThree є модулем.
import { MindARThree } from '../mindar/mindar-image-three.prod.js';


document.addEventListener('DOMContentLoaded', () => {
    // Асинхронна функція для запуску AR-сцени
    const startAR = async () => {
        // Перевірка наявності глобального об'єкта THREE.
        // Це критично, оскільки MindARThree, ймовірно, очікує, що THREE вже існує.
        if (typeof THREE === 'undefined') {
            console.error("Помилка: Three.js (глобальний об'єкт THREE) не завантажений. Перевірте підключення в index.html.");
            return; // Вийти, якщо Three.js не доступний
        }

        // Ініціалізація MindARThree
        const mindarThree = new MindARThree({
            container: document.querySelector('.ar-container'), // Контейнер для AR-відображення
            imageTargetSrc: 'targets.mind', // Шлях до файлу з даними маркерів.
                                           // 'targets.mind' знаходиться в тій же папці 'laba2'.
        });
        // Отримуємо об'єкти рендерера, сцени та камери MindAR
        const { renderer, scene, camera } = mindarThree;

        // --- Константи для масштабування та анімації ---
        const SCALE_FACTOR = 0.0001; // Масштабний коефіцієнт: 1 км = 0.0001 одиниці Three.js
        
        // Реальні радіуси планет (в км)
        const REAL_EARTH_RADIUS = 6400; 
        const REAL_MOON_RADIUS = 1740; 
        
        // Масштабовані радіуси для Three.js сцени
        const EARTH_RADIUS = REAL_EARTH_RADIUS * SCALE_FACTOR;
        const MOON_RADIUS = REAL_MOON_RADIUS * SCALE_FACTOR;

        // Реальна відстань від Землі до Місяця (приблизно 384400 км).
        // Збільшуємо її в 5 разів для кращої візуалізації в AR, інакше Місяць може бути занадто далеко.
        const REAL_EARTH_MOON_DISTANCE = 384400; 
        const EARTH_MOON_DISTANCE = REAL_EARTH_MOON_DISTANCE * SCALE_FACTOR * 5; 

        // Приблизна відстань до Сонця (150 мільйонів км).
        // Масштабуємо її, але все одно тримаємо світло достатньо далеко.
        const REAL_LIGHT_DISTANCE = 150000000; 
        const LIGHT_DISTANCE = REAL_LIGHT_DISTANCE * SCALE_FACTOR * 0.1; 

        // Часовий масштаб: 1 секунда реального часу = 17000 секунд модельного часу
        const TIME_SCALE = 17000; 
        const SECONDS_PER_DAY = 24 * 60 * 60; // Кількість секунд в одній добі

        // --- Завантаження текстур ---
        const textureLoader = new THREE.TextureLoader();
        // Шляхи до текстур, припускаємо, що папка 'images' знаходиться на тому ж рівні, що й 'laba2'
        const earthTexture = await textureLoader.loadAsync('../images/2k_earth_daymap.jpg');
        const moonTexture = await textureLoader.loadAsync('../images/2k_moon.jpg'); 
        // Якщо '2k_moon.jpg' знаходиться не в 'images', а, наприклад, у 'laba2', то шлях буде '2k_moon.jpg'.
        // Але на основі ваших скріншотів, 'images' виглядає як правильне місце для обох.

        // --- Створення Землі ---
        // SphereGeometry(радіус, горизонтальні_сегменти, вертикальні_сегменти)
        const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.rotation.order = 'YXZ'; 

        // --- Створення Місяця ---
        const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);
        const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(EARTH_MOON_DISTANCE, 0, 0); 
        earth.add(moon); 

        // --- Джерела світла ---
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); 
        directionalLight.position.set(LIGHT_DISTANCE, LIGHT_DISTANCE * 0.5, LIGHT_DISTANCE * 0.7); 
        scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.5); 
        scene.add(ambientLight);

        // --- Налаштування камери ---
        camera.position.set(0, 0, 0.5); 
        camera.lookAt(0, 0, 0); 

        // --- Анімація ---
        let lastTime = performance.now(); 

        const animate = () => {
            const currentTime = performance.now();
            const deltaTime = (currentTime - lastTime) / 1000; 
            lastTime = currentTime;

            const modelDeltaTime = deltaTime * TIME_SCALE; 

            earth.rotation.y += (2 * Math.PI / SECONDS_PER_DAY) * modelDeltaTime;

            const MOON_ORBIT_PERIOD_SECONDS = 28 * SECONDS_PER_DAY;
            moon.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), (2 * Math.PI / MOON_ORBIT_PERIOD_SECONDS) * modelDeltaTime);

            renderer.render(scene, camera);
        };

        // --- Ініціалізація та запуск MindAR ---
        const anchor = mindarThree.addAnchor(0); 
        anchor.group.add(earth); 

        await mindarThree.start();
        renderer.setAnimationLoop(animate);
    };

    startAR();
});
