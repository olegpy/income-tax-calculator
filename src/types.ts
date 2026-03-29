export type TaxBracket = {
  min: number
  max?: number
  rate: number
}

type ApiError = {
  code: string
  message: string
  field: string
}

export type ApiErrorBody = {
  errors: ApiError[]
}

export const SUPPORTED_TAX_YEARS = [2019, 2020, 2021, 2022] as const
export type SupportedTaxYear = (typeof SUPPORTED_TAX_YEARS)[number]
