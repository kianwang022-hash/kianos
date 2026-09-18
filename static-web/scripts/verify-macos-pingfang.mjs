import { chromium } from 'playwright';

if (process.platform !== 'darwin') {
  throw new Error(`MAC_VISUAL_GATE_REQUIRES_DARWIN: got ${process.platform}`);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });
  await page.setContent(`<!doctype html><html lang="zh-CN"><body><span id="probe" style="font-family:'PingFang SC';font-size:32px;font-weight:600">错题 到期 收藏 西综</span></body></html>`);
  const result = await page.evaluate(() => {
    const node = document.querySelector('#probe');
    const style = getComputedStyle(node);
    return {
      platform: navigator.platform,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fontCheck: document.fonts.check('600 32px "PingFang SC"', '错题 到期 收藏 西综')
    };
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.fontCheck) throw new Error('PINGFANG_NOT_AVAILABLE_IN_BROWSER');
  if (!String(result.fontFamily).includes('PingFang SC')) throw new Error(`PINGFANG_NOT_REQUESTED: ${result.fontFamily}`);
} finally {
  await browser.close();
}
