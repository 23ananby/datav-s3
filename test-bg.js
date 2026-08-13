import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Try the metaKey trick
  await page.evaluate(() => {
    window.openInBackground = (url) => {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        metaKey: true
      });
      a.dispatchEvent(evt);
    };
  });
  
  await browser.close();
})();
