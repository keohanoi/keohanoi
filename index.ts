import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const saveTemplate = (data: { img: string; artwork: string; artist: string; des: string }) => {
  const templatePath = path.resolve(__dirname, 'README.md');

  // Define the template
  const template = `
<div class="artwork-of-the-day">
  <div class="container">
    <div class="img-wrapper">
      <img
        src="${data.img}"
        alt="${data.artwork}" />
    </div>
    <div class="artwork-detail">
      <div class="artwork-origin"> 
        <h2 class="artwork-name">${data.artwork}</h2>
        <h3 class="artist">
          ${data.artist}
        </h3>
      </div>
      <p class="description">
        ${data.des}
      </p>
    </div>
  </div>
</div>
`;

  // Write to the template file
  fs.writeFileSync(templatePath, template, 'utf8');
  console.log('Template saved to:', templatePath);
};

const scrapeArtwork = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Go to WikiArt
  await page.goto('https://www.wikiart.org/');

  // Get page content
  const content = await page.content();
  const $ = cheerio.load(content);

  // Extract data
  const artwork = $('.artwork-of-the-day article h3 a').text().trim();
  const img = $('.artwork-of-the-day img').attr('src') || '';
  const artist = $('.artwork-of-the-day article h5 a').text().trim();
  const des = $('.artwork-of-the-day .artwork-description-text').text().trim();

  // Log extracted data
  console.log({ img, artwork, artist, des });

  // Save the template
  saveTemplate({ img, artwork, artist, des });

  await browser.close();
};

scrapeArtwork();