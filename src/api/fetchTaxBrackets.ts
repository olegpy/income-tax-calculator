import { apiBaseUrl } from '../config/env'
import type { ApiErrorBody, TaxBracket } from '../types'

type TaxYearWire = { tax_brackets: TaxBracket[] }

/** One promise per year so repeated submits / retries reuse the same in-flight fetch. */
const bracketPromises = new Map<number, Promise<TaxBracket[]>>()

export async function fetchTaxBracketsForYear(taxYear: number): Promise<TaxBracket[]> {
  const existing = bracketPromises.get(taxYear)
  if (existing) return existing

  const promise = (async () => {
    const response = await fetch(
      `${apiBaseUrl}/tax-calculator/tax-year/${taxYear}`,
    )
    const data: unknown = await response.json()
    if (!response.ok) {
      const errorBody = data as ApiErrorBody
      const message = errorBody.errors.at(0)?.message ?? `Request failed (${response.status})`
      throw new Error(message)
    }
    const { tax_brackets } = data as TaxYearWire
    return tax_brackets
  })()

  bracketPromises.set(taxYear, promise)
  promise.catch(() => {
    bracketPromises.delete(taxYear)
  });
  
  return promise
}
