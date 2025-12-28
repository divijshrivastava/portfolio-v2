#!/usr/bin/env node
/**
 * Script to automatically take screenshots of the website
 * Usage: node scripts/take-screenshots.mjs
 */

import { chromium } from 'playwright';

const SITE_URL = process.env.SITE_URL || 'https://divij.tech';
const OUTPUT_DIR = '.github/screenshots';

const screenshots = [
  { name: 'homepage', path: '/', description: 'Homepage' },
  { name: 'blog', path: '/blog', description: 'Blog Listing' },
  { name: 'projects', path: '/projects', description: 'Projects Showcase' },
  { name: 'admin-dashboard', path: '/admin', description: 'Admin Dashboard (requires login)' },
];

async function takeScreenshots() {
  console.log(`🚀 Taking screenshots of ${SITE_URL}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  for (const screenshot of screenshots) {
    try {
      console.log(`📸 Capturing: ${screenshot.description}`);
      await page.goto(`${SITE_URL}${screenshot.path}`, {
        waitUntil: 'networkidle',
      });

      // Wait a bit for any animations to complete
      await page.waitForTimeout(1000);

      // Take screenshot
      await page.screenshot({
        path: `${OUTPUT_DIR}/${screenshot.name}.png`,
        fullPage: true,
      });

      console.log(`✅ Saved: ${OUTPUT_DIR}/${screenshot.name}.png\n`);
    } catch (error) {
      console.error(`❌ Failed to capture ${screenshot.name}: ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('✨ Screenshot capture complete!');
  console.log(`\n📁 Screenshots saved to: ${OUTPUT_DIR}/`);
  console.log('\n⚠️  Note: Admin dashboard screenshot may show login page if not authenticated.');
  console.log('   You may need to manually capture an authenticated admin screenshot.\n');
}

takeScreenshots().catch(console.error);
