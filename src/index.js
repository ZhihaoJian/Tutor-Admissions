// @ts-check
const puppeteer = require("puppeteer");
const DB = require("./db");

const db = new DB();
const host = `http://muchong.com`;

async function parsePage() {
  //获取当前页的列表项中的标题、跳转地址和发布日期
  const forum_body = await this.$$(".forum_body tbody");
  const data = [];

  for (let i = 0; i < forum_body.length; i++) {
    const elementHandle = forum_body[i];
    const title = await elementHandle.$eval(
      "tbody tr>.thread-name a.a_subject",
      el => ({
        name: el.textContent,
        redirectURL: el.getAttribute("href")
      })
    );
    const publishDate = await elementHandle.$eval(
      "tbody tr>.by span.xmc_b9",
      el => el.textContent
    );
    data.push([title.name, host + title.redirectURL, publishDate]);
  }

  //批量插入到mysql
  db.insert(
    "INSERT INTO paper_spider.tutor_admissions (`title`,`redirectURL`,`date`) VALUES ?",
    data
  );
}

function getUrl(index) {
  return `${host}/f-430-${index}-threadtype-11`;
}

(async () => {
  let pageIndex = 1;
  let totalPage = 0;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const pageUrl = getUrl(pageIndex);

  console.log(`开始请求URL：${pageUrl}`);
  await page.goto(pageUrl);

  //获取分页
  const paginationText = await page.$eval(
    "div.xmc_fr  table  tr > td:nth-child(2)",
    el => el.textContent
  );
  if (paginationText) {
    totalPage = Number(paginationText.split("/")[1]);
  }

  for (; pageIndex < totalPage; pageIndex++) {
    await parsePage.call(page);
    console.log(`开始请求URL：${getUrl(pageIndex + 1)}`);
    await page.goto(getUrl(pageIndex + 1));
  }

  //关闭浏览器
  await browser.close();
  console.log("所有操作完成");
})();
