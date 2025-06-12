const day = 24.0 * 60 * 60; // тривалість земного дня у секундах
const TIME_SCALE = 17000; // масштаб часу 1:17,000
const dt = 1.0 / 60.0; // крок інтегрування (60 FPS)

AFRAME.registerComponent('planet', {
  schema: {
    name: { type: 'string', default: "" },
    dist: { type: 'number', default: 0 }, // відстань в одиницях A-Frame
    mass: { type: 'number', default: 0 },
    T: { type: 'number', default: 0 }, // орбітальний період у днях
    rotation_period: { type: 'number', default: 1 } // період обертання в днях
  },
  
  init: function () {
    // Швидкість обертання навколо власної осі (радіани за секунду реального часу)
    this.rotationSpeed = (2 * Math.PI / (this.data.rotation_period * day)) * TIME_SCALE;
    this.currentRotation = 0;
    
    console.log(`${this.data.name}: rotation speed = ${this.rotationSpeed} rad/s`);
  },
  
  tick: function(time, deltaTime) {
    // Обертання навколо власної осі
    this.currentRotation += this.rotationSpeed * (deltaTime / 1000);
    this.el.setAttribute('rotation', '0 ' + (this.currentRotation * 180 / Math.PI) + ' 0');
  }
});

AFRAME.registerComponent('main', {
  init: function () {
    this.earth = document.querySelector('#earth');
    this.moon = document.querySelector('#moon');
    
    // Параметри орбіти Місяця
    this.moonOrbitAngle = 0;
    this.moonOrbitRadius = 38.44; // відстань в одиницях A-Frame
    this.moonOrbitSpeed = (2 * Math.PI / (28 * day)) * TIME_SCALE; // радіани за секунду
    
    console.log('Moon orbit speed:', this.moonOrbitSpeed, 'rad/s');
    console.log('Moon orbit period:', 28 * day / TIME_SCALE, 'real seconds');
  },
  
  tick: function (time, deltaTime) {
    const dt_scaled = deltaTime / 1000; // конвертуємо мілісекунди в секунди
    
    // Обертання Місяця навколо Землі
    this.moonOrbitAngle += this.moonOrbitSpeed * dt_scaled;
    
    // Позиціонуємо Місяць на орбіті
    const moonX = this.moonOrbitRadius * Math.cos(this.moonOrbitAngle);
    const moonZ = this.moonOrbitRadius * Math.sin(this.moonOrbitAngle);
    
    this.moon.setAttribute('position', moonX + ' 0 ' + moonZ);
    
    // Оновлюємо інформацію
    this.updateInfo(time);
  },
  
  updateInfo: function(time) {
    const realTimeSeconds = time / 1000;
    const modelTimeSeconds = realTimeSeconds * TIME_SCALE;
    const modelDays = modelTimeSeconds / day;
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
        `\n` +
        `Модельних днів: ${modelDays.toFixed(2)}\n` +
        `Обертань Землі: ${earthRotations.toFixed(2)}\n` +
        `Обертів Місяця: ${moonOrbits.toFixed(3)}\n` +
        `Реальний час: ${realTimeSeconds.toFixed(1)} с`
      );
    }
  }
});
