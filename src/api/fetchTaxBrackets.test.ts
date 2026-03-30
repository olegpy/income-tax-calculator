import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiBaseUrl } from '../config/env'
import type { TaxBracket } from '../types'

let fetchTaxBracketsForYear: (taxYear: number) => Promise<TaxBracket[]>

describe('fetchTaxBracketsForYear', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.stubGlobal('fetch', vi.fn())
    const mod = await import('./fetchTaxBrackets')
    fetchTaxBracketsForYear = mod.fetchTaxBracketsForYear;
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GETs /tax-calculator/tax-year/:year from the configured base URL', async () => {
    const brackets: TaxBracket[] = [{ min: 0, max: 100, rate: 0.1 }]
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ tax_brackets: brackets }),
    } as Response)

    const result = await fetchTaxBracketsForYear(2022)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${apiBaseUrl}/tax-calculator/tax-year/2022`,
    )
    expect(result).toEqual(brackets)
  })

  it('uses the first error message for server-style bodies (e.g. 5xx)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        errors: [
          {
            code: 'INTERNAL_SERVER_ERROR',
            field: '',
            message: 'Database not found!',
          },
        ],
      }),
    } as Response)

    await expect(fetchTaxBracketsForYear(2022)).rejects.toThrow('Database not found!')
  })

  it('reuses one fetch for the same year (promise cache)', async () => {
    let resolveJson: (value: unknown) => void
    const jsonPromise = new Promise((r) => {
      resolveJson = r
    })
    vi.mocked(globalThis.fetch).mockImplementation(
      () =>
        Promise.resolve({
          ok: true,
          json: () => jsonPromise,
        }) as Promise<Response>,
    )

    const p1 = fetchTaxBracketsForYear(2022)
    const p2 = fetchTaxBracketsForYear(2022)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)

    resolveJson!({ tax_brackets: [{ min: 0, rate: 0.1 }] })
    await expect(Promise.all([p1, p2])).resolves.toHaveLength(2)
  })
})
