// @ts-check
const puppeteer = require("puppeteer");
const DB = require("./db");

const db = new DB();

(async () => {
  let pageIndex = 1;
  let totalPage = 0;
  const host = `http://muchong.com`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const pageUrl = `${host}/f-430-${pageIndex}-threadtype-11`;

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

  //获取当前页的列表项中的标题、跳转地址和发布日期
  const forum_body = await page.$$(".forum_body tbody");
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
    "INSERT INTO paper_spider.tutor_admissions (title,redirectURL,date) VALUES ?",
    data
  );

  //关闭浏览器
  await browser.close();
  console.log("所有操作完成");
})();
