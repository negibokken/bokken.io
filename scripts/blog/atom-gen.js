const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');
const { format } = require('prettier');
const { BMarkdown2HTML } = require('./lib/b_markdown_2_html');
const { getRelativePath } = require('./lib/getRelativePath');

const baseFilePath = path.dirname(__filename);

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
    if (process.argv.length < 4) {
        console.error(`Usage: ${path.basename(__filename)} <article_path>`)
        process.exit(1);
    }
    const articlesPath = process.argv[2];
    const atomFile = process.argv[3];
    // json を読む
    const jsonText = fs.readFileSync(atomFile);
    let atoms = JSON.parse(jsonText);
    // 記事を読む
    scanFiles(articlesPath, '.html', 'current');
    // 記事から、タイトル、URI、updatedAt を取得
    const articles = htmlFiles.map((f) => {
        const path = f;
        const updatedAt = JSON.parse(JSON.stringify(fs.statSync(f))).mtime;
        return { path, updatedAt };
    });

    // URI から uuid がない記事があるかチェックする
    const unPublishedArticle = articles.filter((f) => {
        return !!!atoms.articles.find((a) => {
            return a.uri === `https://blog.bokken.io/${getRelativePath(f.path, true)}`;
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
            uri: `https://blog.bokken.io/${getRelativePath(u.path, true)}`,
            uuid,
            updatedAt: u.updatedAt,
            summary: m2h.summary,
        };
    });

    // json を更新する
    atoms.articles = atoms.articles.concat(newArticles);
    atoms.articles = atoms.articles.sort((a, b) => a.updatedAt < b.updatedAt);
    atoms.updatedAt = newArticles[0].updatedAt;
    fs.writeFileSync(atomFile, format(JSON.stringify(atoms), { parser: 'json' }));

    // template を読む
    const template = fs.readFileSync(`${baseFilePath}/templates/atom-template.ejs`).toString();
    const atomXml = ejs.render(template, atoms);
    // atom feeds を更新する
    fs.writeFileSync('./sites/blog.bokken.io/feeds/atom.xml', format(atomXml, { parser: 'xml' }));
})();
