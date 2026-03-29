export const LOCALE_EN_CA = 'en-CA' as const; // ISO code for English (Canada)

const cad = new Intl.NumberFormat(LOCALE_EN_CA, {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatNumberEnCa(n: number): string {
  return n.toLocaleString(LOCALE_EN_CA)
}

export function formatCad(amount: number): string {
  return cad.format(amount)
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`
}
