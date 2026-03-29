import { useState, type SubmitEvent } from 'react'
import './App.css'
import { fetchTaxBracketsForYear } from './api/fetchTaxBrackets'
import { formatCad, formatNumberEnCa, formatPercent } from './format/cad'
import {
  type MarginalTaxResult,
  calculateMarginalTax,
} from './tax/calculateMarginalTax'
import { SUPPORTED_TAX_YEARS, type SupportedTaxYear } from './types'

function bandRangeLabel(min: number, max: number | null): string {
  if (max == null) return `${formatNumberEnCa(min)}+`
  return `${formatNumberEnCa(min)} – ${formatNumberEnCa(max)}`
}

function App() {
  const [salaryInput, setSalaryInput] = useState('')
  const [taxYear, setTaxYear] = useState<SupportedTaxYear>(2022)
  const [result, setResult] = useState<MarginalTaxResult | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    setResult(null)

    const salary = Number.parseFloat(salaryInput.replace(/,/g, ''))
    const isValidIncome = Number.isFinite(salary) && salary >= 0
    if (!isValidIncome) {
      setMessage('Enter a valid annual income (zero or positive).')
      return
    }

    setPending(true)
    try {
      const brackets = await fetchTaxBracketsForYear(taxYear)
      setResult(calculateMarginalTax(salary, brackets))
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Could not load tax brackets.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Income tax calculator</h1>
        <p className="app-lede">
          Marginal rates from the interview API for tax years 2019–2022.
        </p>
      </header>

      <form className="tax-form" onSubmit={onSubmit} aria-busy={pending}>
        <div className="tax-form-fields">
          <div className="form-field">
            <label className="form-field-label" htmlFor="annual-income">
              Annual income (CAD)
            </label>
            <input
              id="annual-income"
              className="form-field-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 100000"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              aria-describedby={message ? 'tax-form-message' : undefined}
            />
          </div>
          <fieldset className="form-field form-field-tax-year">
            <legend className="form-field-label" id="tax-year-label">
              Tax year
            </legend>
            <ul
              className="tax-year-list"
              role="listbox"
              aria-labelledby="tax-year-label"
            >
              {SUPPORTED_TAX_YEARS.map((year) => {
                const selected = taxYear === year
                return (
                  <li key={year} className="tax-year-item" role="none">
                    <button
                      type="button"
                      id={`tax-year-option-${year}`}
                      className={
                        selected ? 'tax-year-option is-selected' : 'tax-year-option'
                      }
                      role="option"
                      aria-selected={selected}
                      onClick={() => setTaxYear(year)}
                    >
                      {year}
                    </button>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        </div>
        <button className="tax-form-submit" type="submit" disabled={pending}>
          {pending ? 'Calculating…' : 'Calculate'}
        </button>
      </form>

      {message ? (
        <p
          id="tax-form-message"
          className="tax-feedback tax-feedback-error"
          role="alert"
        >
          {message}
        </p>
      ) : null}

      {result ? (
        <section className="tax-results" aria-live="polite">
          <h2 className="tax-results-heading">Results</h2>
          <dl className="tax-summary">
            <div className="tax-summary-row">
              <dt>Total tax</dt>
              <dd>{formatCad(result.totalTax)}</dd>
            </div>
            <div className="tax-summary-row">
              <dt>Effective rate</dt>
              <dd>{formatPercent(result.effectiveRate)}</dd>
            </div>
          </dl>

          <h3 className="tax-brackets-heading">Tax by bracket</h3>
          <div className="tax-brackets-table-wrap">
            <table className="tax-brackets-table">
              <caption className="visually-hidden">
                Tax breakdown by income bracket for your calculation
              </caption>
              <thead>
                <tr>
                  <th scope="col">Bracket (income range)</th>
                  <th scope="col">Rate</th>
                  <th scope="col">Income in bracket</th>
                  <th scope="col">Tax</th>
                </tr>
              </thead>
              <tbody>
                {result.bands.map((row, i) => (
                  <tr key={i}>
                    <td>{bandRangeLabel(row.min, row.max)}</td>
                    <td>{formatPercent(row.rate)}</td>
                    <td>{formatCad(row.bandIncome)}</td>
                    <td>{formatCad(row.bandTax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default App
