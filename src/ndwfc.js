/** https://github.com/LingDong-/ndwfc */
export class WFC {
  constructor({ nd, weights, rules, wave }) {
    wave = wave || {}
    let n_patterns = weights.length
    let wavefront = {}

    function coord(k) {
      return k.split(',').map((x) => parseInt(x))
    }

    function entropy(x) {
      let one = 0
      for (let i = 0; i < x.length; i++) {
        one += x[i] * weights[i]
      }
      let S = 0
      for (let i = 0; i < x.length; i++) {
        let pi = (x[i] * weights[i]) / one
        if (pi != 0) {
          S -= pi * Math.log(pi)
        }
      }
      return S
    }

    function collapse(x) {
      let one = 0
      for (let i = 0; i < x.length; i++) {
        one += x[i] * weights[i]
      }
      let r = Math.random() * one
      for (let i = 0; i < x.length; i++) {
        r -= x[i] * weights[i]
        if (r < 0) {
          let y = new Array(x.length).fill(0)
          y[i] = 1
          return y
        }
      }
    }

    function neighborable(d, a, b) {
      let didx = d.indexOf(1)
      if (didx < 0) {
        didx = d.indexOf(-1)
        ;[a, b] = [b, a]
      }
      for (let i = 0; i < rules.length; i++) {
        if (didx == rules[i][0] || 'yxz'[didx] == rules[i][0]) {
          if (a == rules[i][1] && b == rules[i][2]) {
            return true
          }
        }
      }
      return false
    }

    function propagate(p) {
      let stack = [p]

      while (stack.length) {
        p = stack.pop()

        let dirs = []
        for (let i = 0; i < nd; i++) {
          let d0 = new Array(nd).fill(0)
          d0[i] = -1
          dirs.push(d0)

          let d1 = new Array(nd).fill(0)
          d1[i] = 1
          dirs.push(d1)
        }
        for (let i = 0; i < dirs.length; i++) {
          let q = []
          for (let j = 0; j < p.length; j++) {
            q.push(p[j] + dirs[i][j])
          }
          let x = wavefront[p]
          if (x == undefined) {
            x = wave[p]
          }
          let y = wavefront[q]
          if (x == undefined) {
            x = wave[q]
          }

          if (typeof y == 'number' || typeof y == 'undefined') {
            continue
          } else if (typeof x == 'number' && typeof y == 'object') {
            let mod = false
            for (let j = 0; j < y.length; j++) {
              if (y[j] == 0) {
                continue
              }
              if (y[j] > 0 && !neighborable(dirs[i], x, j)) {
                y[j] = 0
                mod = true
              }
            }
            if (mod) {
              stack.push(q)
            }
          } else if (typeof x == 'object' && typeof y == 'object') {
            let mod = false
            for (let j = 0; j < y.length; j++) {
              if (y[j] == 0) {
                continue
              }
              let ok = false
              for (let k = 0; k < x.length; k++) {
                if (x[k] > 0 && y[j] > 0 && neighborable(dirs[i], k, j)) {
                  ok = true
                  break
                }
              }
              if (!ok) {
                y[j] = 0
                mod = true
              }
            }
            if (mod) {
              stack.push(q)
            }
          } else {
            throw Error('Invalid propagation parameter', x, y)
          }
        }
      }
    }

    function argmax(vals) {
      let mi = -1
      let mv = -Infinity
      for (let i = 0; i < vals.length; i++) {
        if (vals[i] > mv) {
          mv = vals[i]
          mi = i
        }
      }
      return mi
    }

    this.readout = function (collapse = true) {
      if (!collapse) {
        let result = {}
        for (let k in wave) {
          let oh = Array(n_patterns).fill(0)
          oh[wave[k]] = 1
          result[k] = oh
        }
        for (let k in wavefront) {
          let s = wavefront[k].reduce((a, b) => a + b, 0)
          let oh = wavefront[k].map((x) => (s == 0 ? 0 : x / s))
          result[k] = oh
        }
        return result
      }

      let result = {}
      for (let k in wavefront) {
        if (wavefront[k].reduce((a, b) => a + b, 0) == 1) {
          result[k] = argmax(wavefront[k])
        }
      }
      return Object.assign({}, wave, result)
    }

    this.expand = function (xmin, xmax) {
      let coords = [[0]]
      for (let i = 0; i < xmin.length; i++) {
        let cc = []
        for (let x = xmin[i]; x < xmax[i]; x++) {
          let c = []
          for (let j = 0; j < coords.length; j++) {
            c.push(coords[j].concat(x))
          }
          cc = cc.concat(c)
        }
        coords = cc
      }
      coords = coords
        .map((x) => x.slice(1))
        .filter((x) => !(x in wave || x in wavefront))

      coords.map((x) => (wavefront[x] = new Array(n_patterns).fill(1)))
      for (let k in wave) {
        propagate(coord(k))
      }
    }

    this.step = function () {
      let min_ent = Infinity
      let min_arg = undefined

      for (let k in wavefront) {
        let ent = entropy(wavefront[k])
        if (isNaN(ent)) {
          for (let k in wavefront) {
            wavefront[k] = new Array(n_patterns).fill(1)
          }
          for (let k in wave) {
            propagate(coord(k))
          }
          console.log(':(')
          return false
        }
        if (ent == 0) {
          continue
        }
        ent += Math.random() - 0.5
        if (ent < min_ent) {
          min_ent = ent
          min_arg = coord(k)
        }
      }

      if (min_ent == Infinity) {
        wave = this.readout()
        wavefront = {}
        return true
      }
      wavefront[min_arg] = collapse(wavefront[min_arg])
      propagate(min_arg)
      return false
    }
  }
}
