const fs = require('fs');
const ejs = require('ejs');
const {format} = require('prettier');

const domain = 'https://blog.bokken.io';
const templatePath = 'templates/sitemap-template.ejs';

(async () => {
  const template = fs.readFileSync(templatePath).toString();

  // lastModified
  // articles : {url, lastModified }
  const path = 'articles';
  let articles = fs.readdirSync(path);
  articles = articles.filter((a) => a.match(/\d{4}-\d{2}-\d{2}/));
  articles = articles.sort((a, b) => a < b);
  const lastModified = articles[articles.length];
  const sitemaps = [];
  articles.forEach((date) => {
    let articleFiles = fs.readdirSync(`${path}/${date}`);
    if (articleFiles.length <= 0) {
      return;
    }
    let article = articleFiles.filter((a) => a.match(/.*\.html/));
    const element = {
      url: `${domain}/${path}/${date}/${article}`,
      lastModified: date,
    };
    sitemaps.push(element);
  });
  const text = ejs.render(template, {
    lastModified,
    articles: sitemaps,
  });
  console.log(format(text, {parser: 'xml'}));
})();
