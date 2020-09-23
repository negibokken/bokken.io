const fs = require('fs');
const {BMarkdown2HTML} = require('./bmarkdown2html');
const {format} = require('prettier');

(async () => {
  try {
    const filepath = process.argv[2];
    const templatePath = process.argv[3];
    const prev = process.argv[4];
    const next = process.argv[5];
    const data = fs.readFileSync(filepath).toString();
    const template = fs.readFileSync(templatePath).toString();
    const m2h = new BMarkdown2HTML(data, template, {
      url: filepath.replace('.md', '.html'),
      prev,
      next,
    });
    const text = m2h.toString();
    console.log(format(text, {parser: 'html'}));
    return 0;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
