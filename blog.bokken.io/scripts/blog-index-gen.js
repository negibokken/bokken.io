const fs = require('fs');
const ejs = require('ejs');
const bm2h = require('./bmarkdown2html');
const {BMarkdown2HTML} = require('./bmarkdown2html');
const {format} = require('prettier');

const mdFiles = [];
function scanFiles(path, ext, ignore = '') {
  const files = fs.readdirSync(path);
  for (const file of files) {
    if (file == ignore) continue;
    const curPath = `${path}/${file}`;
    if (fs.lstatSync(curPath).isDirectory()) {
      scanFiles(curPath, ext);
    } else {
      if (curPath.includes(ext)) mdFiles.push(curPath);
    }
  }
}

(async () => {
  try {
    scanFiles('articles', '.md', 'current');
    let articles = [];
    for (const mdFile of mdFiles) {
      const data = fs.readFileSync(mdFile).toString();
      const url = mdFile.replace('.md', '.html');
      const m = new BMarkdown2HTML(data, null, {url});
      const article = {
        filepath: url,
        date: m.dates[0],
        title: m.title,
        tags: m.tags,
      };
      articles.push(article);
    }

    articles = articles.sort((a, b) => a > b);
    const template = fs.readFileSync('./templates/blog-index.ejs').toString();
    const html = ejs.render(template, {articles});
    // console.log(html);
    console.log(format(html, {parser: 'html'}));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
