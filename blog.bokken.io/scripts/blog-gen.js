const fs = require('fs');
const { BMarkdown2HTML } = require('./bmarkdown2html');
const { format } = require('prettier');

(async () => {
  try {
    const filepath = process.argv[2];
    const data = fs.readFileSync(filepath).toString();
    const m2h = new BMarkdown2HTML(data);
    const text = m2h.toString();
    console.error(m2h.tags);
    console.error(m2h.summary);
    console.log(format(text, { parser: 'html' }));
    return 0;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
