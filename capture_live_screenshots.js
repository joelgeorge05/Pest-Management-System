
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';
const ARTIFACTS_DIR = 'C:/Users/Acer/.gemini/antigravity/brain/abdbb8b6-ef46-4634-960b-4d433525e7d4';

async function capture() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors', '--disable-gpu']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        // 1. Landing Page
        console.log(`Navigating to ${BASE_URL}...`);
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_landing_page.png') });
        console.log('Captured landing page.');

        // 2. Login Page
        const loginBtn = await page.$('a[href="/login"]');
        if (loginBtn) {
            await loginBtn.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        } else {
            await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
        }
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_login_page.png') });
        console.log('Captured login page.');

        // 3. Admin Dashboard (Login)
        console.log('Attempting login...');

        // Generic selectors are safer
        const usernameSelector = 'input[type="text"]';
        const passwordSelector = 'input[type="password"]';

        await page.waitForSelector(usernameSelector, { timeout: 10000 });
        await page.type(usernameSelector, 'admin');
        await page.type(passwordSelector, 'admin123');

        // Click login button (button type submit)
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 5000));
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_admin_dashboard.png') });
        console.log('Captured admin dashboard.');

    } catch (error) {
        console.error('Error capturing screenshots:', error);
    } finally {
        await browser.close();
    }
}

capture();
