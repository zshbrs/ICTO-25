// main.js - Основний скрипт для AR-сцени Земля-Місяць

// Імпортуємо THREE з його шляху, оскільки 'three.module.min.js' завантажується як модуль.
// Це робить об'єкт THREE доступним в цьому файлі.
import * as THREE from '../threejs/three.module.min.js';

// Імпортуємо MindARThree з його шляху.
// Переконайтеся, що шлях відповідає розташуванню 'mindar-image-three.prod.js'.
import { MindARThree } from '../mindar/mindar-image-three.prod.js';


document.addEventListener('DOMContentLoaded', () => {
    // Асинхронна функція для запуску AR-сцени
    const startAR = async () => {
        // Перевірка наявності об'єкта THREE після імпорту.
        // Хоча імпорт і робить його доступним, це може бути корисно для налагодження.
        if (typeof THREE === 'undefined' || typeof THREE.PerspectiveCamera === 'undefined') {
            console.error("Помилка: Three.js не був завантажений або імпортований коректно. Перевірте шляхи.");
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
        const moonTexture = await textureLoader.loadAsync('../2k_moon.jpg'); // Помилка: виправив шлях, якщо moon.jpg в images, то має бути ../images/2k_moon.jpg

        // Перевірка: Якщо '2k_moon.jpg' також в 'images', то повинно бути:
        // const moonTexture = await textureLoader.loadAsync('../images/2k_moon.jpg');

        // --- Створення Землі ---
        // SphereGeometry(радіус, горизонтальні_сегменти, вертикальні_сегменти)
        // 64 сегменти забезпечують достатню гладкість для якісних текстур
        const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture }); // MeshPhongMaterial реагує на світло
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.rotation.order = 'YXZ'; // Встановлення порядку обертання для коректних трансформацій
        // Земля буде додана до групи якоря MindAR пізніше

        // --- Створення Місяця ---
        const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);
        const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        // Початкове положення Місяця відносно Землі (встановлюємо по осі X)
        moon.position.set(EARTH_MOON_DISTANCE, 0, 0); 
        earth.add(moon); // Місяць є дочірнім об'єктом Землі, щоб він обертався навколо Землі

        // --- Джерела світла ---
        // Спрямоване світло (імітація Сонця)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Колір білий, інтенсивність 1.5
        // Розміщуємо світло далеко від центру сцени та трохи під кутом
        directionalLight.position.set(LIGHT_DISTANCE, LIGHT_DISTANCE * 0.5, LIGHT_DISTANCE * 0.7); 
        scene.add(directionalLight);

        // Амбієнтне світло (загальне, м'яке освітлення, щоб темні сторони не були повністю чорними)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Сірувате світло, інтенсивність 0.5
        scene.add(ambientLight);

        // --- Налаштування камери ---
        // Початкова позиція камери відносно центру сцени (який буде на маркері).
        // Значення 0.5 по Z означає, що камера трохи далі від 3D-моделі.
        // Можливо, доведеться експериментувати з цим значенням для кращої перспективи.
        camera.position.set(0, 0, 0.5); 
        camera.lookAt(0, 0, 0); // Камера дивиться на початок координат (де буде Земля)

        // --- Анімація ---
        let lastTime = performance.now(); // Зберігаємо час останнього кадру для розрахунку deltaTime

        const animate = () => {
            const currentTime = performance.now();
            // Час, що минув з останнього кадру, в секундах
            const deltaTime = (currentTime - lastTime) / 1000; 
            lastTime = currentTime;

            // Переводимо реальний deltaTime в модельний час, використовуючи TIME_SCALE
            const modelDeltaTime = deltaTime * TIME_SCALE; 

            // Обертання Землі навколо своєї осі: 1 оберт за 1 модельну добу
            // (2 * Math.PI) - це повний оберт в радіанах
            earth.rotation.y += (2 * Math.PI / SECONDS_PER_DAY) * modelDeltaTime;

            // Обертання Місяця навколо Землі: 1 оберт за 28 модельних діб
            const MOON_ORBIT_PERIOD_SECONDS = 28 * SECONDS_PER_DAY;
            // Обертаємо позицію Місяця навколо осі Y Землі, симулюючи орбіту
            moon.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), (2 * Math.PI / MOON_ORBIT_PERIOD_SECONDS) * modelDeltaTime);

            // Рендеринг сцени
            renderer.render(scene, camera);
        };

        // --- Ініціалізація та запуск MindAR ---
        // Додаємо анкор (якір) для першого розпізнаного маркера (індекс 0)
        const anchor = mindarThree.addAnchor(0); 
        // Додаємо Землю (і Місяць разом з нею) до групи анкора.
        // Це прив'язує всю модель Земля-Місяць до розпізнаного AR-маркера.
        anchor.group.add(earth); 

        // Запуск AR двигуна MindAR
        await mindarThree.start();
        // Встановлення анімаційного циклу для рендерера Three.js
        renderer.setAnimationLoop(animate);
    };

    // Запускаємо функцію 'startAR', коли DOM повністю завантажиться
    startAR();
});
