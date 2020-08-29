const fs = require('fs');
const { BMarkdown2HTML } = require('./bmarkdown2html');

(async () => {
  const filepath = process.argv[2];
  const data = fs.readFileSync(filepath).toString();
  const m2h = new BMarkdown2HTML(data);
  const text = m2h.toString();
  console.log(text);
})();
