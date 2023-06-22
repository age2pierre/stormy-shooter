/** https://github.com/LingDong-/ndwfc */

export class WFCTool2D {
  tiles = []
  weights = []
  n_prototypes = 0
  formulae = []

  transformBank = {
    cw: function (m) {
      let r = []
      for (let i = 0; i < m.length; i++) {
        r.push([])
        for (let j = m.length - 1; j >= 0; j--) {
          r[r.length - 1].push(m[j][i])
        }
      }
      return r
    },

    fx: function (m) {
      let r = []
      for (let i = 0; i < m.length; i++) {
        r.push([])
        for (let j = m[0].length - 1; j >= 0; j--) {
          r[r.length - 1].push(m[i][j])
        }
      }
      return r
    },
    fy: function (m) {
      let r = []
      for (let i = m.length - 1; i >= 0; i--) {
        r.push([])
        for (let j = 0; j < m[i].length; j++) {
          r[r.length - 1].push(m[i][j])
        }
      }
      return r
    },
  }

  addTile(s, { transforms = 'auto', weight = 1 } = {}) {
    let t = s.split('\n').map((x) => x.split(''))
    this.tiles.push(t)
    this.formulae.push([this.n_prototypes, '', t])
    this.weights.push(weight)

    let tests = []

    if (transforms == 'auto') {
      transforms = ['cw', 'cw+cw', 'cw+cw+cw']
    }

    for (let i = 0; i < transforms.length; i++) {
      let tl = transforms[i].split('+')
      let tt = t
      for (let j = 0; j < tl.length; j++) {
        tt = this.transformBank[tl[j]](tt)
      }
      tests.push(tt)
    }
    for (let i = 0; i < tests.length; i++) {
      let ok = true
      for (let j = 0; j < this.tiles.length; j++) {
        if (equal(tests[i], this.tiles[j])) {
          ok = false
          break
        }
      }
      if (ok) {
        this.tiles.push(tests[i])
        this.weights.push(weight)
        this.formulae.push([this.n_prototypes, transforms[i], tests[i]])
      }
    }
    this.n_prototypes++
  }

  getTileFormulae() {
    return this.formulae
  }

  generateWFCInput() {
    let rules = []
    for (let i = 0; i < this.tiles.length; i++) {
      for (let j = 0; j < this.tiles.length; j++) {
        if (fit('x', this.tiles[i], this.tiles[j])) {
          rules.push(['x', i, j])
        }
        if (fit('y', this.tiles[i], this.tiles[j])) {
          rules.push(['y', i, j])
        }
      }
    }
    return { weights: this.weights, rules, nd: 2 }
  }
}

function equal(m, r) {
  for (let i = 0; i < m.length; i++) {
    for (let j = 0; j < m[0].length; j++) {
      if (m[i][j] != r[i][j]) {
        return false
      }
    }
  }
  return true
}

function fit(d, a, b) {
  if (d == 'x') {
    for (let i = 0; i < a.length; i++) {
      if (a[i][a[i].length - 1] != b[i][0]) {
        return false
      }
    }
  } else if (d == 'y') {
    for (let i = 0; i < a[0].length; i++) {
      if (a[a.length - 1][i] != b[0][i]) {
        return false
      }
    }
  }
  return true
}
