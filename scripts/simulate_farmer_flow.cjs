const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting Farmer Flow Simulation...');
    console.log('Please start your screen recorder NOW if you wish to caption this.');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    try {
        // Modern clickByText
        const clickByText = async (tag, text) => {
            try {
                const selector = `${tag}::-p-text(${text})`;
                const element = await page.waitForSelector(selector, { timeout: 3000 });
                if (element) {
                    await element.click();
                    return true;
                }
            } catch (e) {
                // console.log(`Text ${text} not found`); 
            }
            return false;
        };

        // 1. Start at Login (Try multiple URLs on Backend Port 5000)
        const urls = [
            'http://localhost:5000/login',
            'http://127.0.0.1:5000/login',
            'http://0.0.0.0:5000/login'
        ];

        let connected = false;
        for (const url of urls) {
            try {
                console.log(`Trying ${url}...`);
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
                connected = true;
                console.log(`Connected to ${url}`);
                break;
            } catch (e) {
                console.log(`Failed ${url}: ${e.message}`);
            }
        }

        if (!connected) throw new Error("Could not connect to frontend server.");

        await new Promise(r => setTimeout(r, 2000));

        // 2. Login as Farmer (Role: User)
        console.log('Logging in as Farmer...');

        // Ensure we are on login page
        let onLoginPage = false;
        try {
            await page.waitForSelector('input[placeholder="Enter username"]', { timeout: 2000 });
            onLoginPage = true;
        } catch (e) { }

        if (!onLoginPage) {
            // Try clicking "Login / Register" or "Get Started"
            let clicked = await clickByText('button', 'Login / Register');
            if (!clicked) clicked = await clickByText('button', 'Get Started');
            if (!clicked) clicked = await clickByText('button', 'Login');

            if (clicked) {
                await page.waitForSelector('input[placeholder="Enter username"]', { timeout: 5000 });
            }
        }

        await page.type('input[placeholder="Enter username"]', 'demo_farmer', { delay: 150 });
        await page.type('input[placeholder="Enter password"]', 'password123', { delay: 150 });

        let submitted = await clickByText('button', 'Sign In');
        if (!submitted) await page.click('button[type="submit"]');

        await new Promise(r => setTimeout(r, 5000)); // Wait for Dashboard load

        // 3. Highlight Dashboard Features
        console.log('Navigating Dashboard...');
        await page.evaluate(() => { window.scrollBy({ top: 400, behavior: 'smooth' }); });
        await new Promise(r => setTimeout(r, 4000));

        // 4. Disease Guide (Look for known text)
        console.log('Checking Disease Guide...');
        // Try button or header text
        await clickByText('button', 'Disease Guide');
        // Or if it's a card link
        // await clickByText('h3', 'Disease Guide'); 

        await new Promise(r => setTimeout(r, 4000));
        await page.evaluate(() => { window.scrollBy({ top: 500, behavior: 'smooth' }); });
        await new Promise(r => setTimeout(r, 3000));

        // 5. Shops
        console.log('Checking Shops...');
        await clickByText('button', 'Local Shops');
        if (!submitted) await clickByText('h3', 'Local Shops');

        await new Promise(r => setTimeout(r, 4000));
        await page.evaluate(() => { window.scrollBy({ top: 500, behavior: 'smooth' }); });
        await new Promise(r => setTimeout(r, 3000));

        // 6. Messaging
        console.log('Checking Messages...');
        await clickByText('button', 'Messages');
        await new Promise(r => setTimeout(r, 4000));

        // 7. Logout
        console.log('Logging Out...');
        await clickByText('button', 'Logout');
        await new Promise(r => setTimeout(r, 3000));

    } catch (e) {
        console.error('Simulation Error:', e);
    } finally {
        await new Promise(r => setTimeout(r, 3000));
        await browser.close();
        console.log('Simulation Complete.');
    }
})();
