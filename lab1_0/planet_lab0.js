const day = 24.0 * 60 * 60;  // тривалість земного дня у секундах
const dt = day / 3;          // крок інтегрування (в секундах)
const G = 6.67e-11;          // гравітаційна стала
const scale = 1e3;           // масштаб: 1 одиниця = 1000 км

AFRAME.registerComponent('planet', {
  schema: {
    name: { type: 'string', default: "" },        // ім’я тіла
    dist: { type: 'number', default: 0 },         // початкова відстань у км
    mass: { type: 'number', default: 0 },         // маса тіла
    T: { type: 'number', default: 0 },            // період обертання (у добах)
    v: { type: 'array', default: [0, 0, 0] },      // швидкість
    a: { type: 'array', default: [0, 0, 0] },      // прискорення
    pos: { type: 'array', default: [0, 0, 0] }     // позиція у км
  },

  init: function () {
    this.data.T *= day; // переводимо доби у секунди
    this.data.pos[0] = this.data.dist; // ініціалізуємо позицію
    this.el.setAttribute('position', (this.data.dist / scale) + ' 0 0');

    // якщо період заданий — розраховуємо початкову швидкість для кругової орбіти
    if (this.data.T !== 0) {
      this.data.v[1] = 2 * Math.PI * this.data.dist / this.data.T;
    }
  }
});

AFRAME.registerComponent('main', {
  init: function () {
    this.solar_system = document.querySelectorAll('[planet]');
  },

  tick: function () {
    for (let i = 0; i < this.solar_system.length; i++) {
      let pi = this.solar_system[i].getAttribute('planet');
      pi.a = [0, 0, 0]; // скидання прискорення

      for (let j = 0; j < this.solar_system.length; j++) {
        if (i === j) continue;

        let pj = this.solar_system[j].getAttribute('planet');
        let dp = [
          pj.pos[0] - pi.pos[0],
          pj.pos[1] - pi.pos[1],
          pj.pos[2] - pi.pos[2]
        ];

        let r = Math.sqrt(dp[0] ** 2 + dp[1] ** 2 + dp[2] ** 2);
        if (r === 0) continue;

        for (let k = 0; k < 3; k++) {
          pi.a[k] += (G * pj.mass * dp[k]) / Math.pow(r, 3);
        }
      }

      // оновлення швидкості та позиції
      for (let k = 0; k < 3; k++) {
        pi.v[k] += pi.a[k] * dt;
        pi.pos[k] += pi.v[k] * dt;
      }

      // оновлення положення у сцені з масштабуванням
      this.solar_system[i].setAttribute(
        'position',
        (pi.pos[0] / scale) + ' ' +
        (pi.pos[1] / scale) + ' ' +
        (pi.pos[2] / scale)
      );
    }
  }
});


