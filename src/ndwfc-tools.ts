/** https://github.com/LingDong-/ndwfc */

// TODO type for other transform than cw

import { Rule } from './ndwfc'
import { split } from './utils'

export class WFCTool2D {
  tiles: Array<string[][]> = []
  weights: number[] = []
  n_prototypes = 0
  formulae: Array<[number, '' | 'cw' | 'cw+cw' | 'cw+cw+cw', string[][]]> = []

  transformBank = {
    cw: function (m: string[][]) {
      const r: string[][] = []
      for (let i = 0; i < m.length; i++) {
        r.push([])
        for (let j = m.length - 1; j >= 0; j--) {
          r[r.length - 1].push(m[j][i])
        }
      }
      return r
    },

    // fx: function (m: string[][]) {
    //   const r: string[][] = []
    //   for (let i = 0; i < m.length; i++) {
    //     r.push([])
    //     for (let j = m[0].length - 1; j >= 0; j--) {
    //       r[r.length - 1].push(m[i][j])
    //     }
    //   }
    //   return r
    // },
    // fy: function (m: string[][]) {
    //   const r: string[][] = []
    //   for (let i = m.length - 1; i >= 0; i--) {
    //     r.push([])
    //     for (let j = 0; j < m[i].length; j++) {
    //       r[r.length - 1].push(m[i][j])
    //     }
    //   }
    //   return r
    // },
  }

  addTile(
    strTile: string,
    {
      transforms = ['cw', 'cw+cw', 'cw+cw+cw'],
      weight = 1,
    }: {
      transforms?: ('cw' | 'cw+cw' | 'cw+cw+cw')[]
      weight?: number
    } = {},
  ) {
    const tile = strTile.split('\n').map((x) => x.split(''))
    this.tiles.push(tile)
    this.formulae.push([this.n_prototypes, '', tile])
    this.weights.push(weight)

    const tests = transforms.map((transform) => {
      return split(transform, '+').reduce((transformedTile, transformOp) => {
        return this.transformBank[transformOp](transformedTile)
      }, tile)
    })

    tests.forEach((test, i) => {
      let ok = true
      for (let j = 0; j < this.tiles.length; j++) {
        if (equal(test, this.tiles[j])) {
          ok = false
          break
        }
      }
      if (ok) {
        this.tiles.push(test)
        this.weights.push(weight)
        this.formulae.push([this.n_prototypes, transforms[i], test])
      }
    })

    this.n_prototypes++
    return this.n_prototypes
  }

  getTileFormulae() {
    return this.formulae
  }

  generateWFCInput() {
    const rules: Rule['2D'][] = []
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

function equal(m: string[][], r: string[][]): boolean {
  for (let i = 0; i < m.length; i++) {
    for (let j = 0; j < m[0].length; j++) {
      if (m[i][j] != r[i][j]) {
        return false
      }
    }
  }
  return true
}

function fit(d: 'x' | 'y', a: string[][], b: string[][]): boolean {
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
