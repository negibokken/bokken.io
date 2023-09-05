const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { format } = require('prettier');
const { getRelativePath } = require('./lib/getRelativePath');

const baseFilePath = path.dirname(__filename);

const domain = 'https://blog.bokken.io';
const templatePath = `${baseFilePath}/templates/sitemap-template.ejs`;

(async () => {
    const template = fs.readFileSync(templatePath).toString();

    // lastModified
    // articles : {url, lastModified }
    if (process.argv.length < 4) {
        console.error(`Usage: ${path.basename(__filename)} <articles_path> <output_file>`)
    }
    const articlesPath = process.argv[2];
    const outputFilePath = process.argv[3];
    let articles = fs.readdirSync(articlesPath);
    articles = articles.filter((a) => a.match(/\d{4}-\d{2}-\d{2}/));
    articles = articles.sort((a, b) => a < b);
    const lastModified = articles[articles.length];
    const sitemaps = [];
    articles.forEach((date) => {
        let articleFiles = fs.readdirSync(`${articlesPath}/${date}`);
        if (articleFiles.length <= 0) {
            return;
        }
        let article = articleFiles.filter((a) => a.match(/.*\.html/));
        const element = {
            url: `${domain}/${getRelativePath(articlesPath, true)}/${date}/${article}`,
            lastModified: date,
        };
        sitemaps.push(element);
    });
    const text = ejs.render(template, {
        lastModified,
        articles: sitemaps,
    });
    fs.writeFileSync(outputFilePath, format(text, { parser: 'xml' }));
})();
