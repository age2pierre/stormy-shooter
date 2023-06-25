/** https://github.com/LingDong-/ndwfc */

import assert from 'assert'
import { FixedLengthArray, Join, ReadonlyTuple } from 'type-fest'

import { entries, fromEntries, isNotNil, split } from './utils'

// the rules is an array of 3-tuples.
// for each rule, the first element specifies the axis, and the 2nd and 3rd
// specifies what tiles can go next to each other on that axis

type StringCoord<N extends number> = Join<ReadonlyTuple<`${number}`, N>, ','>
type Vec<N extends number> = FixedLengthArray<number, N>
export type Rule = {
  ['1D']: ['x', number, number]
  ['2D']: ['x' | 'y', number, number]
  ['3D']: ['x' | 'y' | 'z', number, number]
}

export class WFC<N extends 1 | 2 | 3> {
  private wavefront: Record<StringCoord<N>, number[]> = {} as Record<
    StringCoord<N>,
    number[]
  >
  private readonly n_patterns: number
  private nd: N
  private weights: number[]
  private rules: Rule[`${N}D`][]
  private wave: Record<StringCoord<N>, number>

  constructor(arg: {
    nd: N
    weights: number[]
    rules: Rule[`${N}D`][]
    wave?: Record<StringCoord<N>, number>
  }) {
    this.weights = arg.weights
    this.rules = arg.rules
    this.nd = arg.nd
    this.wave = arg.wave ?? ({} as Record<StringCoord<N>, number>)
    this.n_patterns = this.weights.length
  }

  readout(collapse: true): Record<StringCoord<N>, number>
  readout(collapse: false): Record<StringCoord<N>, number[]>
  readout(collapse = true) {
    if (!collapse) {
      const result = fromEntries(
        entries(this.wave).map(([k, v]) => {
          const oh = Array<0 | 1>(this.n_patterns).fill(0)
          oh[v] = 1
          return [k, oh as number[]]
        }),
      )
      entries(this.wavefront).forEach(([k, v]) => {
        const s = v.reduce((a, b) => a + b, 0)
        const oh = v.map((x) => (s === 0 ? 0 : x / s))
        result[k] = oh
      })
      return result
    } else {
      const result = fromEntries(
        entries(this.wavefront)
          .map(([k, v]) => {
            const s = v.reduce((a, b) => a + b, 0)
            if (s === 1) {
              return [k, this.getIndexOfMaxValue(v)] as const
            }
            return null
          })
          .filter(isNotNil),
      )
      return { ...this.wave, ...result }
    }
  }

  step() {
    let min_ent = Infinity
    let min_arg: Vec<N> | undefined = undefined

    for (const k in this.wavefront) {
      let ent = this.entropy(this.wavefront[k as StringCoord<N>])
      if (isNaN(ent)) {
        for (const k in this.wavefront) {
          this.wavefront[k as StringCoord<N>] = new Array(this.n_patterns).fill(
            1,
          )
        }
        for (const k in this.wave) {
          this.propagate(this.coord(k as StringCoord<N>))
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
        min_arg = this.coord(k as StringCoord<N>)
      }
    }

    if (min_ent == Infinity) {
      this.wave = this.readout(true)
      this.wavefront = {} as Record<StringCoord<N>, number[]>
      return true
    }
    assert.ok(min_arg)
    this.wavefront[String(min_arg) as StringCoord<N>] = this.collapse(
      this.wavefront[String(min_arg) as StringCoord<N>],
    )
    this.propagate(min_arg)
    return false
  }

  expand(xmin: Vec<N>, xmax: Vec<N>) {
    let coords = [[0]]
    for (let i = 0; i < xmin.length; i++) {
      let cc: number[][] = []
      for (let x = xmin[i]; x < xmax[i]; x++) {
        const c = coords.map((coord) => coord.concat(x))
        cc = cc.concat(c)
      }
      coords = cc
    }
    coords = coords
      .map((x) => x.slice(1))
      .filter((x) => !(String(x) in this.wave || String(x) in this.wavefront))

    coords.map(
      (x) =>
        (this.wavefront[this.strCoord(x as any as Vec<N>)] = new Array(
          this.n_patterns,
        ).fill(1)),
    )
    entries(this.wave).forEach(([k]) => {
      this.propagate(this.coord(k))
    })
  }

  private propagate(p: Vec<N>) {
    const stack = [p]

    while (stack.length) {
      p = stack.pop()!

      const dirs: number[][] = []
      for (let i = 0; i < this.nd; i++) {
        const d0 = new Array(this.nd).fill(0)
        d0[i] = -1
        dirs.push(d0)

        const d1 = new Array(this.nd).fill(0)
        d1[i] = 1
        dirs.push(d1)
      }
      for (let i = 0; i < dirs.length; i++) {
        const q = []
        for (let j = 0; j < p.length; j++) {
          q.push(p[j] + dirs[i][j])
        }
        let x: number | number[] = this.wavefront[this.strCoord(p)]
        if (x == undefined) {
          x = this.wave[this.strCoord(p)]
        }
        const y = this.wavefront[this.strCoord(q as any as Vec<N>)]
        if (x == undefined) {
          x = this.wave[this.strCoord(q as any as Vec<N>)]
        }

        if (typeof y == 'number' || typeof y == 'undefined') {
          continue
        } else if (typeof x == 'number' && typeof y == 'object') {
          let mod = false
          for (let j = 0; j < y.length; j++) {
            if (y[j] == 0) {
              continue
            }
            if (y[j] > 0 && !this.neighborable(dirs[i], x, j)) {
              y[j] = 0
              mod = true
            }
          }
          if (mod) {
            stack.push(q as any as Vec<N>)
          }
        } else if (typeof x == 'object' && typeof y == 'object') {
          let mod = false
          for (let j = 0; j < y.length; j++) {
            if (y[j] == 0) {
              continue
            }
            let ok = false
            for (let k = 0; k < x.length; k++) {
              if (x[k] > 0 && y[j] > 0 && this.neighborable(dirs[i], k, j)) {
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
            stack.push(q as any as Vec<N>)
          }
        } else {
          throw Error(`Invalid propagation parameter ${x}, ${y}`)
        }
      }
    }
  }

  private coord(k: StringCoord<N>): Vec<N> {
    return (split(k, ',') as `${number}`[]).map((x) =>
      parseInt(x),
    ) as any as Vec<N>
  }

  private strCoord(k: Vec<N>): StringCoord<N> {
    return String(k) as StringCoord<N>
  }

  private entropy(x: number[]): number {
    const one = x.reduce((acc, val, i) => (acc += val * this.weights[i]), 0)
    return x.reduce((acc, val, i) => {
      const pi = (val * this.weights[i]) / one
      acc -= pi != 0 ? pi * Math.log(pi) : 0
      return acc
    }, 0)
  }

  private collapse(x: number[]): number[] {
    const one = x.reduce((acc, val, i) => (acc += val * this.weights[i]), 0)
    let r = Math.random() * one
    const y = new Array(x.length).fill(0)
    for (let i = 0; i < x.length; i++) {
      r -= x[i] * this.weights[i]
      if (r < 0) {
        y[i] = 1
        return y
      }
    }
    return y
  }

  private neighborable(d: number[], a: number, b: number): boolean {
    let didx = d.indexOf(1)
    if (didx < 0) {
      didx = d.indexOf(-1)
      ;[a, b] = [b, a]
    }
    for (let i = 0; i < this.rules.length; i++) {
      if ('yxz'[didx] == this.rules[i][0]) {
        if (a == this.rules[i][1] && b == this.rules[i][2]) {
          return true
        }
      }
    }
    return false
  }

  private getIndexOfMaxValue(vals: number[]): number {
    return vals.reduce(
      (acc, val, i) => {
        if (val > acc.maxValue) {
          acc.maxIndex = i
          acc.maxValue = val
        }
        return acc
      },
      {
        maxIndex: -1,
        maxValue: -Infinity,
      },
    ).maxIndex
  }
}
