// Підключення MindARThree з коректним відносним шляхом
// Важливо: переконайтеся, що 'mindar-image-three.prod.js' знаходиться саме за цим шляхом
import { MindARThree } from '../mindar/dist/mindar-image-three.prod.js';

// THREE.js буде доступний глобально, оскільки він підключений через <script> тег в index.html.
// Тому наступний імпорт не потрібен, якщо ви підключаєте 'three.min.js' через <script> тег.
// Якщо ви бачите помилки, пов'язані з 'THREE is not defined', то цей рядок треба закоментувати
// або переконатися, що 'three.min.js' дійсно експортує THREE як модуль.
// У більшості випадків, при підключенні через CDN або локальний файл .min.js, THREE стає глобальним об'єктом.
// import * as THREE from 'three'; 

document.addEventListener('DOMContentLoaded', () => {
    const startAR = async () => {
        // Перевірка, чи THREE.js був завантажений та доступний глобально
        if (typeof THREE === 'undefined') {
            console.error("Three.js (глобальний об'єкт THREE) не завантажений. Перевірте шлях до three.min.js в index.html.");
            return; // Вийти, якщо Three.js не доступний
        }

        const mindarThree = new MindARThree({
            container: document.querySelector('.ar-container'),
            imageTargetSrc: 'targets.mind', // Маркер знаходиться в тій же папці, що й main.js (laba2)
        });
        const { renderer, scene, camera } = mindarThree;

        // --- Константи та масштабування ---
        const SCALE_FACTOR = 0.0001; // 1 км = 0.0001 одиниці Three.js для моделювання розмірів
        
        // Реальні радіуси планет
        const REAL_EARTH_RADIUS = 6400; // км
        const REAL_MOON_RADIUS = 1740; // км
        
        // Масштабовані радіуси для Three.js
        const EARTH_RADIUS = REAL_EARTH_RADIUS * SCALE_FACTOR;
        const MOON_RADIUS = REAL_MOON_RADIUS * SCALE_FACTOR;

        // Відстань від Землі до Місяця (приблизно 384400 км).
        // Збільшуємо для кращої візуалізації в AR, інакше Місяць буде занадто далеко.
        const REAL_EARTH_MOON_DISTANCE = 384400; // км
        const EARTH_MOON_DISTANCE = REAL_EARTH_MOON_DISTANCE * SCALE_FACTOR * 5; // Збільшимо в 5 разів

        // Відстань джерела світла (Сонця)
        // Сонце має бути дуже далеко, тому множимо на значний коефіцієнт
        const REAL_LIGHT_DISTANCE = 150000000; // Приблизна відстань до Сонця в км
        const LIGHT_DISTANCE = REAL_LIGHT_DISTANCE * SCALE_FACTOR * 0.1; // Можемо зменшити для AR, але все одно далеко

        // --- Налаштування часу для анімації ---
        const TIME_SCALE = 17000; // 1 секунда реального часу = 17000 секунд модельного часу
        const SECONDS_PER_DAY = 24 * 60 * 60; // Секунд у одній реальній/модельній добі

        // --- Завантаження текстур ---
        const textureLoader = new THREE.TextureLoader();
        // Шляхи до текстур, припускаючи, що вони знаходяться в папці 'images' на рівень вище
        const earthTexture = await textureLoader.loadAsync('../images/2k_earth_daymap.jpg');
        const moonTexture = await textureLoader.loadAsync('../images/2k_moon.jpg');

        // --- Створення Землі ---
        // Використовуємо 64 сегменти для плавної сфери та хорошого відображення текстури
        const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.rotation.order = 'YXZ'; // Для правильного застосування обертань, якщо будуть складніші анімації
        // Земля буде додана до якоря MindAR пізніше

        // --- Створення Місяця ---
        const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);
        const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        // Початкове положення Місяця відносно Землі (по осі X)
        moon.position.set(EARTH_MOON_DISTANCE, 0, 0); 
        earth.add(moon); // Місяць обертається навколо Землі, тому є дочірнім об'єктом Землі

        // --- Джерела світла ---
        // Спрямоване світло (імітація Сонця)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Колір, інтенсивність
        // Розміщуємо світло далеко і трохи під кутом для освітлення Землі
        directionalLight.position.set(LIGHT_DISTANCE, LIGHT_DISTANCE * 0.5, LIGHT_DISTANCE * 0.7); 
        scene.add(directionalLight);

        // Амбієнтне світло (загальне, м'яке освітлення, щоб темні сторони не були повністю чорними)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // М'яке біле світло, низька інтенсивність
        scene.add(ambientLight);

        // --- Налаштування камери ---
        // Позиція камери відносно маркера.
        // Це впливає на те, наскільки великою буде виглядати модель.
        // Можливо, доведеться експериментувати з цим значенням.
        camera.position.set(0, 0, 0.5); 
        camera.lookAt(0, 0, 0); // Камера дивиться на центр сцени (де буде Земля)

        // --- Анімація ---
        let lastTime = performance.now(); // Час останнього кадру для розрахунку deltaTime

        const animate = () => {
            const currentTime = performance.now();
            const deltaTime = (currentTime - lastTime) / 1000; // Час, що минув з останнього кадру, в секундах
            lastTime = currentTime;

            // Переводимо реальний deltaTime в модельний час, використовуючи TIME_SCALE
            const modelDeltaTime = deltaTime * TIME_SCALE; 

            // Обертання Землі навколо своєї осі: 1 оберт за 1 модельну добу
            // Швидкість обертання: (повний оберт в радіанах) / (період в модельних секундах)
            earth.rotation.y += (2 * Math.PI / SECONDS_PER_DAY) * modelDeltaTime;

            // Обертання Місяця навколо Землі: 1 оберт за 28 модельних діб
            // Оскільки Місяць є дочірнім об'єктом Землі, ми обертаємо його позицію 
            // навколо осі Y Землі, щоб симулювати орбіту.
            const MOON_ORBIT_PERIOD_SECONDS = 28 * SECONDS_PER_DAY;
            moon.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), (2 * Math.PI / MOON_ORBIT_PERIOD_SECONDS) * modelDeltaTime);

            // Рендеринг сцени
            renderer.render(scene, camera);
        };

        // --- Ініціалізація та запуск MindAR ---
        // Додаємо анкор (якір) для першого розпізнаного маркера (індекс 0)
        const anchor = mindarThree.addAnchor(0); 
        // Додаємо Землю (і Місяць разом з нею, оскільки Місяць є дочірнім) до групи анкора.
        // Це робить всю модель Земля-Місяць прив'язаною до маркера.
        anchor.group.add(earth); 

        // Запуск AR двигуна
        await mindarThree.start();
        // Встановлення анімаційного циклу
        renderer.setAnimationLoop(animate);
    };

    // Запускаємо AR функцію, коли DOM повністю завантажиться
    startAR();
});
