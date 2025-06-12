const day = 24.0 * 60 * 60; // сек в добі
const dt = day / 3;         // крок інтегрування (в секундах)
const G = 6.67e-11;         // гравітаційна стала
const scale = 1e3;          // 1000 км = 1 одиниця

AFRAME.registerComponent('planet', {
  schema: {
    name: { type: 'string', default: "" },
    dist: { type: 'number', default: 0 },
    mass: { type: 'number', default: 0 },
    T: { type: 'number', default: 0 },
    v: { type: 'array', default: [0, 0, 0] },
    a: { type: 'array', default: [0, 0, 0] },
    pos: { type: 'array', default: [0, 0, 0] }
  },

  init: function () {
    this.data.T *= day;
    this.data.pos[0] = this.data.dist;
    this.el.setAttribute('position', (this.data.dist / scale) + ' 0 0');

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
      pi.a = [0, 0, 0];

      for (let j = 0; j < this.solar_system.length; j++) {
        if (i === j) continue;
        let pj = this.solar_system[j].getAttribute('planet');
        let dp = [0, 0, 0];

        for (let k = 0; k < 3; k++) dp[k] = pj.pos[k] - pi.pos[k];

        let r = Math.sqrt(dp[0] ** 2 + dp[1] ** 2 + dp[2] ** 2);
        if (r === 0) continue;

        for (let k = 0; k < 3; k++) {
          pi.a[k] += (G * pj.mass * dp[k]) / Math.pow(r, 3);
        }
      }

      for (let k = 0; k < 3; k++) {
        pi.v[k] += pi.a[k] * dt;
        pi.pos[k] += pi.v[k] * dt;
      }

      this.solar_system[i].setAttribute(
        'position',
        (pi.pos[0] / scale) + ' ' + (pi.pos[1] / scale) + ' ' + (pi.pos[2] / scale)
      );
    }
  }
});
