// ОНОВЛЕНИЙ main.js НА ОСНОВІ ВАШОГО СКРІНШОТА ТА НОВОЇ КОНФІГУРАЦІЇ

// Імпортуємо THREE, оскільки three.module.min.js завантажується як модуль.
// Це робить об'єкт THREE доступним в цьому файлі.
import * as THREE from '../threejs/three.module.min.js';

// Коригуємо шлях для MindARThree, оскільки mindar-image-three.prod.js знаходиться безпосередньо в папці mindar
import { MindARThree } from '../mindar/mindar-image-three.prod.js';


document.addEventListener('DOMContentLoaded', () => {
    const startAR = async () => {
        // Ця перевірка тепер менш потрібна, оскільки ми імпортуємо THREE.
        // Проте, її можна залишити для надійності, якщо ви не впевнені, що імпорт спрацював.
        if (typeof THREE === 'undefined' || typeof THREE.PerspectiveCamera === 'undefined') {
            console.error("Three.js (об'єкт THREE) не завантажений або не коректно імпортований.");
            return;
        }

        const mindarThree = new MindARThree({
            container: document.querySelector('.ar-container'),
            imageTargetSrc: 'targets.mind', // Цей шлях залишиться без змін, якщо targets.mind в laba2
        });
        const { renderer, scene, camera } = mindarThree;

        // --- Константи та масштабування ---
        const SCALE_FACTOR = 0.0001; // 1 км = 0.0001 одиниці Three.js для моделювання розмірів
        
        const REAL_EARTH_RADIUS = 6400; // км
        const REAL_MOON_RADIUS = 1740; // км
        
        const EARTH_RADIUS = REAL_EARTH_RADIUS * SCALE_FACTOR;
        const MOON_RADIUS = REAL_MOON_RADIUS * SCALE_FACTOR;

        const REAL_EARTH_MOON_DISTANCE = 384400; // км
        const EARTH_MOON_DISTANCE = REAL_EARTH_MOON_DISTANCE * SCALE_FACTOR * 5; // Збільшимо в 5 разів

        const REAL_LIGHT_DISTANCE = 150000000; // Приблизна відстань до Сонця в км
        const LIGHT_DISTANCE = REAL_LIGHT_DISTANCE * SCALE_FACTOR * 0.1; 

        // --- Налаштування часу для анімації ---
        const TIME_SCALE = 17000; 
        const SECONDS_PER_DAY = 24 * 60 * 60; 

        // --- Завантаження текстур ---
        const textureLoader = new THREE.TextureLoader();
        // Шляхи до текстур, припускаючи, що вони знаходяться в папці 'images' на рівень вище
        const earthTexture = await textureLoader.loadAsync('../images/2k_earth_daymap.jpg');
        const moonTexture = await textureLoader.loadAsync('../images/2k_moon.jpg');

        // --- Створення Землі ---
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
