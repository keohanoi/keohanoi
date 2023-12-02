const path = require("path");
const cheerio = require("cheerio");

const puppeteer = require("puppeteer");
const fs = require("fs");

// variable declaration
const filePath = `../`;

const getData = async () => {
  return (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://www.wikiart.org/");

    const textContent = await page.evaluate(() => {
      return document.querySelector("div.artwork-of-the-day").innerHTML;
    });

    const $ = cheerio.load(textContent);

    const img = $("aside > div.wiki-layout-artist-image-wrapper > img").last().attr("src");
    const artwork = $("article > h3").text();
    const artist = $("article > h5").text();
    const des = $("li.artwork-description").html();

    browser.close();
    return {
      img,
      artwork,
      artist,
      des,
    };
  })();
};

const saveFile = async (template) => {
  // remove existing readme file
  const readmePath = path.join(__dirname, filePath, "README.md");
  if (fs.existsSync(readmePath)) {
    fs.unlinkSync(readmePath);
  }

  // create new readme file with template content
  fs.writeFile(readmePath, template, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
};

(async () => {
  let data = await getData();
  let template = fs.readFileSync(path.join(__dirname, "template/daily-artwork-template.md"), "utf8");

  template = template.replace("{{img}}", data.img.trim());
  template = template.replace("{{artwork}}", data.artwork.trim());
  template = template.replace("{{artist}}", data.artist.trim());
  template = template.replace("{{des}}", data.des.trim());

  await saveFile(template);
})();
