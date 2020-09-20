const fs = require('fs');
const ejs = require('ejs');
const {v4: uuidv4} = require('uuid');
const {format} = require('prettier');
const {BMarkdown2HTML} = require('./bmarkdown2html');

const htmlFiles = [];
function scanFiles(path, ext, ignore = '') {
  const files = fs.readdirSync(path);
  for (const file of files) {
    if (file == ignore) continue;
    const curPath = `${path}/${file}`;
    if (fs.lstatSync(curPath).isDirectory()) {
      scanFiles(curPath, ext);
    } else {
      if (curPath.includes(ext)) htmlFiles.push(curPath);
    }
  }
}

(async () => {
  const atomFile = './atoms.json';
  // json を読む
  const jsonText = fs.readFileSync(atomFile);
  let atoms = JSON.parse(jsonText);
  // 記事を読む
  scanFiles('articles', '.html', 'current');
  // 記事から、タイトル、URI、updatedAt を取得
  const articles = htmlFiles.map((f) => {
    const path = f;
    const updatedAt = JSON.parse(JSON.stringify(fs.statSync(f))).mtime;
    return {path, updatedAt};
  });

  // URI から uuid がない記事があるかチェックする
  const unPublishedArticle = articles.filter((f) => {
    return !!!atoms.articles.find((a) => {
      return a.uri === `https://blog.bokken.io/${f.path}`;
    });
  });

  if (unPublishedArticle.length <= 0) return;

  // あったらtitle, id, link, アップデート日時、summary を追加
  const newArticles = unPublishedArticle.map((u) => {
    const uuid = uuidv4();
    const m2h = new BMarkdown2HTML(
      fs.readFileSync(u.path.replace('.html', '.md')).toString(),
      undefined,
      undefined
    );
    return {
      title: m2h.title,
      uri: `https://blog.bokken.io/${u.path}`,
      uuid,
      updatedAt: u.updatedAt,
      summary: m2h.summary,
    };
  });

  // json を更新する
  atoms.articles = atoms.articles.concat(newArticles);
  atoms.articles = atoms.articles.sort((a, b) => a.updatedAt < b.updatedAt);
  atoms.updatedAt = newArticles[0].updatedAt;
  fs.writeFileSync(atomFile, format(JSON.stringify(atoms), {parser: 'json'}));

  // template を読む
  const template = fs.readFileSync('./templates/atom-template.ejs').toString();
  const atomXml = ejs.render(template, atoms);
  // atom feeds を更新する
  fs.writeFileSync('./feeds/atom.xml', format(atomXml, {parser: 'xml'}));
})();
