const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const bm2h = require('./lib/b_markdown_2_html');
const { BMarkdown2HTML } = require('./lib/b_markdown_2_html');
const { format } = require('prettier');
const { getRelativePath } = require('./lib/getRelativePath');

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
        const articlesDir = process.argv[2];
        const templateFilePath = process.argv[3];
        const outputFile = process.argv[4];

        if (process.argv.length < 5) {
            const programName = path.basename(__filename);
            console.error(`Usage: ${programName} <articles_dir> <template_file_path> <otuput_file_path>`)
            process.exit(1);
        }

        scanFiles(articlesDir, '.md', 'current');
        let articles = [];
        for (const mdFile of mdFiles) {
            const data = fs.readFileSync(mdFile).toString();
            const url = getRelativePath(mdFile.replace('.md', '.html'));
            const m = new BMarkdown2HTML(data, null, { url });
            const article = {
                filepath: url,
                date: m.dates[0],
                title: m.title,
                tags: m.tags,
            };
            articles.push(article);
        }

        articles = articles.sort().reverse();
        const html = await ejs.renderFile(templateFilePath, {
            articles,
        });
        fs.writeFileSync(outputFile, format(html, { parser: 'html' }));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
