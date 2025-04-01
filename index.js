const { firefox } = require("playwright");

const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_AUTH_TOKEN,
});

const config = {
  notionDatabaseId: process.env.NOTION_DATABASE_ID,
};

(async () => {
  const browser = await firefox.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.adidas.com.ar/outlet", {
    timeot: 10000,
  });

  await page.waitForSelector('[data-testid="product-grid"]', {
    state: "visible",
    timeout: 10000,
  });

  const products = await page.$$('[data-testid="plp-product-card"]');

  console.log(products.length);

  for (const product of products) {
    try {
      const title = await product.$eval(
        '[data-testid="product-card-title"]',
        (el) => el.textContent
      );
      console.log("Product Title: ", title);

      await notion.pages.create({
        parent: {
          database_id: config.notionDatabaseId,
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
        },
      });
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  await browser.close();
})();
