/**
 * Marginal tax: each bracket’s rate applies only to income in that range.
 * Uses one `tax_brackets`-shaped list (last row has no `max`).
 */
import { describe, expect, it } from 'vitest'
import type { TaxBracket } from '../types'
import { calculateMarginalTax } from './calculateMarginalTax'

/** Like `tax_brackets` from the interview API — last entry has no `max`. */
const interviewApiBrackets: TaxBracket[] = [
  { min: 0, max: 48535, rate: 0.15 },
  { min: 48535, max: 97069, rate: 0.205 },
  { min: 97069, max: 150473, rate: 0.26 },
  { min: 150473, max: 214368, rate: 0.29 },
  { min: 214368, rate: 0.33 },
]

describe('calculateMarginalTax', () => {
  it('no income means no tax and 0% effective rate', () => {
    const r = calculateMarginalTax(0, interviewApiBrackets)
    expect(r.totalTax).toBe(0)
    expect(r.effectiveRate).toBe(0)
  })

  it('income only in the first bracket is taxed only at that rate', () => {
    const income = 10_000
    const r = calculateMarginalTax(income, interviewApiBrackets)
    expect(r.totalTax).toBeCloseTo(income * 0.15, 5)
    expect(r.effectiveRate).toBeCloseTo(0.15, 5)
  })

  it('when the last bracket has no max, the result still has max = null and tax applies there', () => {
    const r = calculateMarginalTax(300_000, interviewApiBrackets)
    const top = r.bands[r.bands.length - 1]
    expect(top.min).toBe(214368)
    expect(top.max).toBeNull()
    expect(top.bandIncome).toBeGreaterThan(0)
  })

  it('sample incomes against expected totals', () => {
    const expected = {
      at50k: 7580.575,
      at100k: 17991.78,
      at300k: 77902.87,
    }
    expect(calculateMarginalTax(50_000, interviewApiBrackets).totalTax).toBeCloseTo(
      expected.at50k,
      5,
    )
    expect(calculateMarginalTax(100_000, interviewApiBrackets).totalTax).toBeCloseTo(
      expected.at100k,
      2,
    )
    expect(calculateMarginalTax(300_000, interviewApiBrackets).totalTax).toBeCloseTo(
      expected.at300k,
      2,
    )
  })

  it('total tax matches adding each band’s tax', () => {
    const r = calculateMarginalTax(100_000, interviewApiBrackets)
    const sumOfBands = r.bands.reduce((acc, b) => acc + b.bandTax, 0)
    expect(sumOfBands).toBeCloseTo(r.totalTax, 5)
  })
})
