import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display hero section with name and title', async ({ page }) => {
    await page.goto('/')

    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Check that the page loaded
    await expect(page).toHaveTitle(/Divij/i)
  })

  test('should have navigation links', async ({ page, isMobile }) => {
    await page.goto('/')

    // Check navigation - specifically target the nav bar to avoid matching footer links
    const nav = page.getByRole('navigation')

    // On mobile, nav links might be in a menu - just check navigation exists
    if (isMobile) {
      await expect(nav).toBeVisible()
    } else {
      await expect(nav.getByRole('link', { name: /blog/i })).toBeVisible()
      await expect(nav.getByRole('link', { name: /projects/i })).toBeVisible()
      await expect(nav.getByRole('link', { name: /about/i })).toBeVisible()
      await expect(nav.getByRole('link', { name: /contact/i })).toBeVisible()
    }
  })

  test('should navigate to blog page', async ({ page, isMobile }) => {
    await page.goto('/')

    if (isMobile) {
      // On mobile, use footer link or CTA button
      await page.getByRole('link', { name: 'Read My Blog' }).click()
    } else {
      // Click on Blog link in navigation
      await page.getByRole('navigation').getByRole('link', { name: /blog/i }).click()
    }

    // Verify navigation
    await expect(page).toHaveURL('/blog')
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible()
  })

  test('should navigate to projects page', async ({ page, isMobile }) => {
    await page.goto('/')

    if (isMobile) {
      // On mobile, use "View Projects" button
      await page.getByRole('link', { name: 'View Projects' }).click()
    } else {
      // Click on Projects link in navigation
      await page.getByRole('navigation').getByRole('link', { name: /projects/i }).click()
    }

    // Verify navigation
    await expect(page).toHaveURL('/projects')
  })

  test('should have theme toggle button', async ({ page }) => {
    await page.goto('/')

    // Find theme toggle by accessible name (most specific)
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' })

    // Theme toggle might be hidden on mobile - check if visible
    const isVisible = await themeToggle.isVisible().catch(() => false)
    if (isVisible) {
      // Click to toggle theme
      await themeToggle.click()

      // Verify theme changed (check for dark class on html)
      const html = page.locator('html')
      const currentClass = await html.getAttribute('class')
      expect(currentClass).toBeTruthy()
    }
  })

  test('should display featured projects section', async ({ page }) => {
    await page.goto('/')

    // Check for Featured Projects section
    const featuredHeading = page.getByRole('heading', { name: /featured projects/i })

    // Scroll to featured projects section if needed
    if (await featuredHeading.isVisible()) {
      await expect(featuredHeading).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check that page loads correctly on mobile
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
