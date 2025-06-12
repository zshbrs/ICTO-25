const day = 24.0 * 60 * 60; // тривалість земного дня у секундах
const TIME_SCALE = 17000; // масштаб часу 1:17,000
const dt = (day / TIME_SCALE) / 60; // крок інтегрування з урахуванням масштабу часу
const G = 6.67e-11; // гравітаційна стала

AFRAME.registerComponent('planet', {
  schema: {
    name: { type: 'string', default: "" }, // ім'я планети
    dist: { type: 'number', default: 0 }, // середня відстань (в тисячах км)
    mass: { type: 'number', default: 0 }, // маса
    T: { type: 'number', default: 0 }, // орбітальний період у земних днях
    rotation_period: { type: 'number', default: 1 }, // період обертання навколо осі в днях
    v: { type: 'array', default: [0, 0, 0] }, // вектор швидкості
    a: { type: 'array', default: [0, 0, 0] }, // вектор прискорення
    pos: { type: 'array', default: [0, 0, 0] }, // координатний вектор (в км)
    rotation_speed: { type: 'number', default: 0 } // швидкість обертання навколо осі
  },
  
  init: function () {
    // Конвертуємо період з днів у секунди
    this.data.T *= day;
    
    // Початкова позиція (переводимо з тисяч км у км)
    this.data.pos[0] = this.data.dist * 1000; // км
    
    // Встановлюємо позицію в A-Frame (масштаб 1 км = 0.01 одиниці)
    this.el.setAttribute('position', (this.data.dist * 10) + ' 0 0');
    
    // Обчислюємо орбітальну швидкість для Місяця
    if (this.data.T !== 0 && this.data.dist !== 0) {
      this.data.v[1] = 2 * Math.PI * this.data.dist * 1000 / this.data.T; // км/с
    }
    
    // Обчислюємо швидкість обертання навколо осі (радіани за секунду реального часу)
    this.data.rotation_speed = (2 * Math.PI / (this.data.rotation_period * day)) * TIME_SCALE;
    
    // Початкове обертання
    this.currentRotation = 0;
  },
  
  tick: function(time, deltaTime) {
    // Обертання навколо власної осі
    this.currentRotation += this.data.rotation_speed * (deltaTime / 1000);
    this.el.setAttribute('rotation', '0 ' + (this.currentRotation * 180 / Math.PI) + ' 0');
  }
});

AFRAME.registerComponent('main', {
  init: function () {
    this.solar_system = document.querySelectorAll('[planet]');
    this.earth = document.querySelector('#earth');
    this.moon = document.querySelector('#moon');
    
    // Створюємо групу для орбіти Місяця
    this.moonOrbit = document.createElement('a-entity');
    this.moonOrbit.setAttribute('id', 'moon-orbit');
    this.earth.parentNode.appendChild(this.moonOrbit);
    
    // Переміщуємо Місяць до орбітальної групи
    this.moonOrbit.appendChild(this.moon);
    
    this.moonOrbitAngle = 0;
    this.moonOrbitSpeed = (2 * Math.PI / (28 * day)) * TIME_SCALE; // радіани за секунду
  },
  
  tick: function (time, deltaTime) {
    const dt_scaled = deltaTime / 1000; // конвертуємо мілісекунди в секунди
    
    // Обертання Місяця навколо Землі
    this.moonOrbitAngle += this.moonOrbitSpeed * dt_scaled;
    
    // Позиціонуємо Місяць на орбіті
    const moonDistance = 384.4 * 10; // в одиницях A-Frame
    const moonX = moonDistance * Math.cos(this.moonOrbitAngle);
    const moonZ = moonDistance * Math.sin(this.moonOrbitAngle);
    
    this.moon.setAttribute('position', moonX + ' 0 ' + moonZ);
    
    // Фізичне моделювання для більш точних обчислень (опціонально)
    for (let i = 0; i < this.solar_system.length; i++) {
      let planet_i = this.solar_system[i].getAttribute('planet');
      
      // Скидаємо прискорення
      planet_i.a = [0, 0, 0];
      
      // Обчислюємо гравітаційні сили
      for (let j = 0; j < this.solar_system.length; j++) {
        if (i !== j) {
          let planet_j = this.solar_system[j].getAttribute('planet');
          let deltapos = [0, 0, 0];
          
          for (let k = 0; k < 3; k++) {
            deltapos[k] = planet_j.pos[k] - planet_i.pos[k];
          }
          
          let r = Math.sqrt(
            deltapos[0] ** 2 + deltapos[1] ** 2 + deltapos[2] ** 2
          );
          
          if (r !== 0) {
            for (let k = 0; k < 3; k++) {
              planet_i.a[k] += (G * planet_j.mass * deltapos[k]) / Math.pow(r, 3);
            }
          }
        }
      }
      
      // Інтегрування швидкості та позиції
      for (let k = 0; k < 3; k++) {
        planet_i.v[k] += planet_i.a[k] * dt * TIME_SCALE;
        planet_i.pos[k] += planet_i.v[k] * dt * TIME_SCALE;
      }
    }
    
    // Оновлюємо інформацію
    this.updateInfo(time);
  },
  
  updateInfo: function(time) {
    const modelTime = (time / 1000) * TIME_SCALE; // модельний час у секундах
    const modelDays = modelTime / day;
    const earthRotations = modelDays;
    const moonOrbits = modelDays / 28;
    
    const infoPanel = document.querySelector('#info-panel');
    if (infoPanel) {
      infoPanel.setAttribute('value', 
        `Модель Земля-Місяць\n` +
        `Масштаб часу: 1:${TIME_SCALE}\n` +
        `Радіус Землі: 6,400 км\n` +
        `Радіус Місяця: 1,740 км\n` +
        `Відстань до світла: 30,000 км\n` +
        `Модельних днів: ${modelDays.toFixed(2)}\n` +
        `Обертань Землі: ${earthRotations.toFixed(2)}\n` +
        `Обертів Місяця: ${moonOrbits.toFixed(3)}`
      );
    }
  }
});
