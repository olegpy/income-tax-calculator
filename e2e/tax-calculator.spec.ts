import { expect, test } from '@playwright/test'

const apiPattern = '**/tax-calculator/tax-year/*'

test('types income, clicks calculate, and shows tax results', async ({
  page,
}) => {
  await page.route(apiPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tax_brackets: [
          { min: 0, max: 50_197, rate: 0.15 },
          { min: 50_197, max: 100_392, rate: 0.205 },
          { min: 100_392, max: 155_625, rate: 0.26 },
          { min: 155_625, max: 221_708, rate: 0.29 },
          { min: 221_708, rate: 0.33 },
        ],
      }),
    })
  })

  await page.goto('/')
  await page.getByLabel('Annual income (CAD)').fill('140000')
  await page.getByRole('button', { name: 'Calculate' }).click()

  const results = page.locator('.tax-results')
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(results.getByText('Total tax')).toBeVisible()
  await expect(results.getByText('Effective rate')).toBeVisible()
  await expect(results.getByText('$28,117.60')).toBeVisible()
  await expect(results.getByText('20.08%')).toBeVisible()
  await expect(results.getByRole('table')).toBeVisible()
  await expect(results).toContainText('0')
  await expect(results).toContainText('50,197')
  await expect(results).toContainText('$10,289.97')
})

test('shows a validation message for invalid income before submit succeeds', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByLabel('Annual income (CAD)').fill('abc')
  await page.getByRole('button', { name: 'Calculate' }).click()

  await expect(page.getByRole('alert')).toContainText(
    'Enter a valid annual income (zero or positive).',
  )
  await expect(page.getByRole('heading', { name: 'Results' })).toHaveCount(0)
})

test('shows a pending state while the calculation is in flight', async ({
  page,
}) => {
  await page.route(apiPattern, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tax_brackets: [{ min: 0, rate: 0.15 }],
      }),
    })
  })

  await page.goto('/')
  await page.getByLabel('Annual income (CAD)').fill('50000')
  await page.getByRole('button', { name: 'Calculate' }).click()

  await expect(page.getByRole('button', { name: 'Calculating…' })).toBeDisabled()
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'true')

  await expect(page.locator('.tax-results')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Calculate' })).toBeEnabled()
})

test('shows the API error message when tax brackets cannot be loaded', async ({
  page,
}) => {
  await page.route(apiPattern, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: [
          {
            code: 'INTERNAL_SERVER_ERROR',
            field: '',
            message: 'Database not found!',
          },
        ],
      }),
    })
  })

  await page.goto('/')
  await page.getByLabel('Annual income (CAD)').fill('100000')
  await page.getByRole('button', { name: 'Calculate' }).click()

  await expect(page.getByRole('alert')).toContainText('Database not found!')
  await expect(page.getByRole('heading', { name: 'Results' })).toHaveCount(0)
})
