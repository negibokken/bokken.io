const fs = require('fs');
const { BMarkdown2HTML } = require('./b_markdown_2_html');
const { format } = require('prettier');
const { getRelativePath } = require('./getRelativePath');

async function m2h(filepath, prev, next, templatePath) {
    const data = fs.readFileSync(filepath).toString();
    const m2h = new BMarkdown2HTML(data, templatePath, {
        url: getRelativePath(filepath.replace('.md', '.html')),
        prev: getRelativePath(prev?.replace('.md', '.html')),
        next: getRelativePath(next?.replace('.md', '.html')),
    });
    await m2h.init();
    const text = m2h.toString();

    return format(text, { parser: 'html' });
}

module.exports = { m2h };
