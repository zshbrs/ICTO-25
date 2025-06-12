const day = 24.0 * 60 * 60;
const dt = day / 3;
const G = 6.67e-11;
const scale = 1e3;

AFRAME.registerComponent('planet', {
  schema: {
    name: { type: 'string', default: "" },
    dist: { type: 'number', default: 0 },
    mass: { type: 'number', default: 0 },
    T: { type: 'number', default: 0 },
    v: { type: 'array', default: [0, 0, 0] },
    a: { type: 'array', default: [0, 0, 0] },
    pos: { type: 'array', default: [0, 0, 0] },
    fixed: { type: 'boolean', default: false }
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

      if (!pi.fixed) {
        for (let k = 0; k < 3; k++) {
          pi.v[k] += pi.a[k] * dt;
          pi.pos[k] += pi.v[k] * dt;
        }
      }

      this.solar_system[i].setAttribute(
        'position',
        (pi.pos[0] / scale) + ' ' +
        (pi.pos[1] / scale) + ' ' +
        (pi.pos[2] / scale)
      );
    }
  }
});
