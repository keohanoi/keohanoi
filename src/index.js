const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const puppeteer = require('puppeteer');
const fs = require('fs');

// variable declaration
const url = 'https://www.wikiart.org';
const filePath = `../`;

const instance = axios.create({
  baseURL: url,
  headers: {
    'Host': 'wikiart.org',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36',
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});

const getData = async () => {
  return (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.wikiart.org/');

    const textContent = await page.evaluate(() => {
      return document.querySelector('div.artwork-of-the-day').innerHTML;
    });

    const $ = cheerio.load(textContent);

    const img = $('aside > div.wiki-layout-artist-image-wrapper > img').last().attr('src');
    const artwork = $('article > h3').text();
    const artist = $('article > h5').text();
    const des = $('li.artwork-description').html();

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
  const readmePath = path.join(__dirname, filePath, 'README.md');
  if (fs.existsSync(readmePath)) {
    fs.unlinkSync(readmePath);
  }

  // create new readme file with template content
  fs.writeFile(readmePath, template, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
};

(async () => {
  let data = await getData();
  const template = `<div class="artwork-of-the-day">
      <img src="${data.img}" alt="${data.artwork}"/>
      <h5>${data.artwork}</h5> - <h3>${data.artist}</h3>
    </div>`;
  await saveFile(template);
})();
