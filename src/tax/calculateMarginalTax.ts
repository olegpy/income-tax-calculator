import type { TaxBracket } from '../types'

export type MarginalTaxResult = {
  totalTax: number
  effectiveRate: number
  bands: Array<{
    min: number
    max: number | null
    rate: number
    bandIncome: number
    bandTax: number
  }>
}

/** Income in each bracket × that bracket’s rate; sum = total tax. */
export function calculateMarginalTax(
  annualIncome: number,
  brackets: TaxBracket[],
): MarginalTaxResult {
  const income = Math.max(0, annualIncome)
  const { bands, totalTax } = brackets.reduce(
    (acc, b) => {
      const top = b.max ?? Infinity
      const bandIncome =
        income <= b.min ? 0 : Math.max(0, Math.min(income, top) - b.min)
      const bandTax = bandIncome * b.rate
      acc.bands.push({
        min: b.min,
        max: b.max ?? null,
        rate: b.rate,
        bandIncome,
        bandTax,
      })
      acc.totalTax += bandTax
      return acc
    },
    { bands: [] as MarginalTaxResult['bands'], totalTax: 0 },
  )

  return {
    totalTax,
    effectiveRate: income > 0 ? totalTax / income : 0,
    bands,
  }
}
