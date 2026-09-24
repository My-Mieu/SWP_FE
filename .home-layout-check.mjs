import { chromium } from 'file:///C:/Users/MSI%20PC/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const width of [1440, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 950 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:5174', { waitUntil: 'domcontentloaded' });
    await page.locator('.home-content').waitFor();
    await page.waitForTimeout(1000);
    const rails = page.locator('.home-discovery');
    const checks = [];
    for (let i = 0; i < await rails.count(); i++) {
      const rail = rails.nth(i);
      await rail.scrollIntoViewIfNeeded();
      const track = rail.locator('.home-discovery-track');
      const next = rail.getByRole('button', { name: /^Xem tiếp/ });
      const metrics = await track.evaluate(el => ({ label: el.getAttribute('aria-label'), scrollable: el.scrollWidth > el.clientWidth + 4, visibleCards: el.clientWidth / (el.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(el).gap)) }));
      if (metrics.scrollable) {
        await next.click();
        await page.waitForTimeout(700);
        metrics.moves = await track.evaluate(el => el.scrollLeft > 0);
        await rail.getByRole('button', { name: /^Xem trước/ }).click();
      } else metrics.disabled = await next.isDisabled();
      checks.push(metrics);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(50);
    const hidden = await page.locator('.home-reveal').evaluateAll(els => els.filter(el => getComputedStyle(el).opacity === '0').length);
    await page.screenshot({ path: join(tmpdir(), `shareloop-horizontal-${width}.png`), fullPage: true });
    await page.locator('.home-rail-categories').scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(tmpdir(), `shareloop-category-${width}.png`) });
    const link = page.locator('.home-rail-categories .home-category').first();
    const destination = await link.getAttribute('href');
    await link.click();
    await page.waitForURL(url => url.pathname === '/browse');
    console.log(JSON.stringify({ width, checks, overflow, hidden, errors, categoryNavigation: page.url().endsWith(destination) }));
    await page.close();
  }
} finally { await browser.close(); }
