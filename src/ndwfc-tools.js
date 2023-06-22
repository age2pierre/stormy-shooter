/** https://github.com/LingDong-/ndwfc */

export class WFCTool2D {
  tiles = []
  weights = []
  n_prototypes = 0
  formulae = []

  transformBank = {
    cw: function (m) {
      var r = []
      for (var i = 0; i < m.length; i++) {
        r.push([])
        for (var j = m.length - 1; j >= 0; j--) {
          r[r.length - 1].push(m[j][i])
        }
      }
      return r
    },

    fx: function (m) {
      var r = []
      for (var i = 0; i < m.length; i++) {
        r.push([])
        for (var j = m[0].length - 1; j >= 0; j--) {
          r[r.length - 1].push(m[i][j])
        }
      }
      return r
    },
    fy: function (m) {
      var r = []
      for (var i = m.length - 1; i >= 0; i--) {
        r.push([])
        for (var j = 0; j < m[i].length; j++) {
          r[r.length - 1].push(m[i][j])
        }
      }
      return r
    },
  }

  addTile(s, { transforms = 'auto', weight = 1 } = {}) {
    var t = s.split('\n').map((x) => x.split(''))
    tiles.push(t)
    formulae.push([n_prototypes, '', t])
    weights.push(weight)

    var tests = []

    if (transforms == 'auto') {
      transforms = ['cw', 'cw+cw', 'cw+cw+cw']
    }

    for (var i = 0; i < transforms.length; i++) {
      var tl = transforms[i].split('+')
      var tt = t
      for (var j = 0; j < tl.length; j++) {
        tt = transformBank[tl[j]](tt)
      }
      tests.push(tt)
    }
    for (var i = 0; i < tests.length; i++) {
      var ok = true
      for (var j = 0; j < tiles.length; j++) {
        if (equal(tests[i], tiles[j])) {
          ok = false
          break
        }
      }
      if (ok) {
        tiles.push(tests[i])
        weights.push(weight)
        formulae.push([n_prototypes, transforms[i], tests[i]])
      }
    }
    n_prototypes++
  }

  getTileFormulae() {
    return formulae
  }

  generateWFCInput() {
    var rules = []
    for (var i = 0; i < tiles.length; i++) {
      for (var j = 0; j < tiles.length; j++) {
        if (fit('x', tiles[i], tiles[j])) {
          rules.push(['x', i, j])
        }
        if (fit('y', tiles[i], tiles[j])) {
          rules.push(['y', i, j])
        }
      }
    }
    return { weights, rules, nd: 2 }
  }
}

function equal(m, r) {
  for (var i = 0; i < m.length; i++) {
    for (var j = 0; j < m[0].length; j++) {
      if (m[i][j] != r[i][j]) {
        return false
      }
    }
  }
  return true
}

function fit(d, a, b) {
  if (d == 'x') {
    for (var i = 0; i < a.length; i++) {
      if (a[i][a[i].length - 1] != b[i][0]) {
        return false
      }
    }
  } else if (d == 'y') {
    for (var i = 0; i < a[0].length; i++) {
      if (a[a.length - 1][i] != b[0][i]) {
        return false
      }
    }
  }
  return true
}
