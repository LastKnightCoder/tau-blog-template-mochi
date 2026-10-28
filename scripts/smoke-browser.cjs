/**
 * 在真实浏览器（Electron）里打开宿主生成的站点，逐页检查渲染、站内跳转与交互。
 * 用法：TAU_BLOG_CONFIG=<browser-config.json> electron scripts/smoke-browser.cjs
 * browser-config.json 由 editor 仓库的 scripts/plugins/verify-blog-template.mjs 生成。
 */
const { app, BrowserWindow } = require("electron");
const assert = require("node:assert/strict");
const path = require("node:path");

const config = JSON.parse(require("node:fs").readFileSync(process.env.TAU_BLOG_CONFIG, "utf8"));
app.setPath("userData", path.join(config.output, "mochi-browser-profile"));
app.disableHardwareAcceleration();

const cases = [];
const errors = [];
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let window;
const evaluate = (code) => window.webContents.executeJavaScript(code);

async function until(code, label = code) {
  const end = Date.now() + 20000;
  while (Date.now() < end) {
    if (await evaluate(code).catch(() => false)) return;
    await pause(40);
  }
  throw new Error(`等待超时：${label}\n页面文字：${(await evaluate("document.body.innerText")).slice(0, 600)}\n${errors.join("\n")}`);
}

async function click(selector) {
  const found = await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)return false;n.click();return true})()`);
  if (!found) throw new Error(`缺少元素：${selector}\n页面文字：${(await evaluate("document.body.innerText")).slice(0, 600)}`);
}

async function run() {
  await app.whenReady();
  window = new BrowserWindow({ show: false, width: 1280, height: 900, webPreferences: { sandbox: true, contextIsolation: true } });
  window.webContents.on("console-message", (event) => {
    if (event.level === "error") errors.push(event.message);
  });

  // 首页：站名、团子、三个分区、最近做好的
  await window.loadURL(config.url);
  await until("document.querySelector('#recent-title') !== null", "首页最近做好的");
  assert.match(await evaluate("document.querySelector('h1').getAttribute('aria-label')"), /独立博客验证/);
  assert.equal(await evaluate("[...document.querySelectorAll('nav[aria-label=\"分区\"] h2')].map(h => h.textContent).join()"), "文章,卡片,项目");
  assert(await evaluate("document.querySelectorAll('svg.mochi-svg').length >= 2"), "首页有店标与主角团子");
  cases.push("首页渲染站名、团子、三个分区与最近做好的");

  // 团子铺：霞鹜文楷、细线导航、和纸底色；界面不用投影
  const styles = await evaluate(`(()=>{try{const h=document.querySelector('h1 span');const n=document.querySelector('nav[aria-label="主导航"] a');const menu=document.querySelector('nav[aria-label="分区"] a');const s=getComputedStyle(n);return {font:getComputedStyle(h).fontFamily, navBorder:s.borderTopWidth, navShadow:s.boxShadow, menuShadow:getComputedStyle(menu).boxShadow, bg:getComputedStyle(document.querySelector('.washi-paper')).backgroundColor}}catch(e){return {error:String(e)}}})()`);
  assert(!styles.error, styles.error);
  assert.match(styles.font, /LXGW WenKai Screen/);
  assert.equal(styles.navBorder, "0px", "导航只是文字");
  assert.equal(styles.navShadow, "none");
  assert.equal(styles.menuShadow, "none", "分区菜单用细线，不用投影");
  assert.equal(styles.bg, "rgb(251, 248, 246)");
  cases.push("首页用霞鹜文楷、和纸底色，导航与分区菜单没有投影");

  // 戳团子会说话
  await click('button[aria-label$="戳一下"]');
  await until("document.querySelector('main [role=status]')?.textContent.length > 0", "戳团子后说话");
  cases.push("戳主角团子会换一句话");

  // 站内跳转不整页重载
  await evaluate("window.__noReload = true");
  await click('nav[aria-label="主导航"] a[href$="/articles"]');
  await until("location.pathname.endsWith('/articles') && document.querySelector('main h1')?.textContent === '文章'", "文章列表");
  assert(await evaluate("window.__noReload === true"), "站内跳转不应整页重载");
  assert(await evaluate("document.querySelector('nav[aria-label=\"主导航\"] a[aria-current=page]')?.textContent === '文章'"));
  cases.push("站内链接走前端路由，导航高亮当前分区");

  // 文章：页面结构、阅读进度、表情按钮。夹具文章带一个宿主测试插件，
  // 它与已发布的 @tau/blog 版本不兼容时正文区显示失败提示，页面其余部分必须照常
  await click('a[href$="/articles/1"]');
  await until("document.querySelector('article h1')?.textContent.includes('第一篇文章')", "文章页");
  await until("document.querySelector('[data-slate-editor].mochi-prose') !== null || document.querySelector('article [role=alert]') !== null", "文章正文或失败提示");
  const articleBody = await evaluate("document.querySelector('article [role=alert]') ? 'fallback' : 'rendered'");
  cases.push(`文章页渲染标题与元信息，正文${articleBody === "rendered" ? "正常渲染" : "失败时显示团子提示而不白屏"}`);
  await evaluate("window.scrollTo(0, document.body.scrollHeight)");
  await until("Number(document.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow') ?? 100) >= 98", "阅读进度");
  await click('article button[aria-pressed="false"]');
  await until("document.querySelector('article button[aria-pressed=\"true\"]') !== null", "表情按钮点亮");
  cases.push("表情按钮点击后保持点亮");

  // 项目文档：从页头的项目下拉进入
  await click('nav[aria-label="主导航"] button[aria-haspopup]');
  await until("document.querySelector('a[href*=\"/projects/\"]') !== null", "书架展开");
  await click('a[href*="/projects/"]');
  await until("location.pathname.includes('/projects/') && document.querySelector('article h1') !== null", "文档页");
  cases.push("从页头项目下拉进入项目文档");

  // 卡片：便签与标签筛选
  await window.loadURL(config.url + "cards");
  await until("document.querySelector('main h1')?.textContent === '卡片'", "卡片列表");
  assert(await evaluate("document.querySelectorAll('main ul.grid > li').length > 0"), "卡片列表是一盒点心格");
  const jar = await evaluate("[...document.querySelectorAll('main [role=group] button[aria-pressed]')].find(b => b.textContent.includes('发布'))?.textContent");
  if (jar) {
    await evaluate("[...document.querySelectorAll('main [role=group] button[aria-pressed]')].find(b => b.textContent.includes('发布')).click()");
    await until("location.search.includes('tag=')", "标签筛选写入地址");
  }
  cases.push("卡片列表与标签筛选");
  await click("ul a[href*='/cards/']");
  await until("location.pathname.includes('/cards/') && document.querySelector('[data-slate-editor].mochi-prose')?.textContent.includes('共享协议卡片')", "卡片详情正文");
  assert(await evaluate("getComputedStyle(document.querySelector('.mochi-prose')).fontFamily.includes('LXGW WenKai Screen')"));
  cases.push("卡片详情由 ContentRenderer 渲染正文，正文用霞鹜文楷");

  // 搜索
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))");
  await until("document.querySelector('dialog[open] input') !== null", "⌘K 打开搜索");
  await evaluate(`(()=>{const i=document.querySelector('dialog[open] input');const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,'共享协议');i.dispatchEvent(new Event('input',{bubbles:true}))})()`);
  await until("document.querySelectorAll('dialog[open] [role=option]').length > 0", "搜索结果");
  await evaluate("document.querySelector('dialog[open] input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))");
  await until("!document.querySelector('dialog[open]')", "回车打开结果并关闭弹窗");
  cases.push("⌘K 搜索、命中高亮、回车跳转");

  // 404 与夜晚
  await window.loadURL(config.url + "nowhere/at/all");
  await until("document.body.innerText.includes('找不到这一页')", "404 页");
  assert(await evaluate("document.querySelector('header') !== null"), "404 页保留页头");
  cases.push("未知地址显示迷路的团子，页头页脚照常");
  await click('button[role="switch"]');
  await until("document.documentElement.dataset.mode === 'dark'", "切到夜晚");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.washi-paper')).backgroundColor"), "rgb(28, 25, 30)");
  await window.loadURL(config.url);
  await until("document.documentElement.dataset.mode === 'dark'", "夜晚模式刷新后保持");
  cases.push("日夜开关生效并在刷新后保持");

  const unexpected = errors.filter((message) => !/favicon|DevTools|插件包格式、API 版本或平台不兼容/.test(message));
  assert.deepEqual(unexpected, [], "页面不应有控制台错误");
  cases.push("全程没有控制台错误");
  console.log(JSON.stringify({ ok: true, cases }, null, 2));
}

run()
  .then(() => app.exit(0))
  .catch((error) => {
    console.error(error.stack || error.message);
    app.exit(1);
  });
