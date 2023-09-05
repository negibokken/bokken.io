const fs = require('fs');
const { BMarkdown2HTML } = require('./lib/b_markdown_2_html');
const { format } = require('prettier');

const { m2h } = require('./lib/b_markdown_2_html_connector');

(async () => {
    try {
        const templatePath = process.argv[2];
        const filepath = process.argv[3];
        const prev = process.argv[4];
        const next = process.argv[5];

        const text = m2h(filepath, prev, next, templatePath);
        console.log(text);

        return 0;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
