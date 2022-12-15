const marked = require('marked');
const ejs = require('ejs');
const hljs = require('highlightjs');
const hash = require('crypto').createHash;

let articleTitle = '';
let tags = '';
let summary = '';
let dates = [];
const extractTags = (text) => {
    const i = text.indexOf('[');
    const j = text.indexOf(']');
    return text.substring(i + 1, j);
};
const extractDate = (text) => {
    const i = text.indexOf('[');
    const j = text.indexOf(']');
    let localDates = text.substring(i + 1, j).split(',');
    return localDates.map((d) => d.trim());
};

let isIndexBefore = false;

const htmltagRegexp = RegExp('<.+?>', 'g');

// Custom Renderer
const renderer = {
    paragraph: (text) => {
        if (text.includes('@tags:')) {
            let tagsText = extractTags(text);
            const localTags = tagsText.split(',');
            tags = localTags.map((t) => t.trim());
            return '';
        } else if (text.includes('@date:')) {
            dates = extractDate(text);
            return '';
        }
        if (summary.length + text.length <= 200) {
            const t = text.slice();
            summary += t.replaceAll(htmltagRegexp, '');
        }
        const h = hash('md5').update(text).digest('base64')
        return `<p id="${h}" class="paragraph">${text}<a href="#${h}" class="paragraph-anchor">¶</a></p>`;
    },
    heading: (text, level) => {
        // const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        const escapedText = text;
        if (level == 1) {
            articleTitle = text;
        }
        const h = `<h${level}>
  <a name="${escapedText}" href="#${escapedText}" id="${escapedText}">
    ${text}
  </a>
</h${level}>
`;
        if (isIndexBefore) {
            isIndexBefore = false;
            return `</details>${h}`;
        }
        if (text === '目次' || text == 'もくじ') {
            isIndexBefore = true;
            return `<details><summary>## ${text} (click で開く)</summary>${h}`;
        }

        return h;
    },
    link: (href, title, text) => {
        return `<a target="_blank" href="${href}" rel="noopener">${text}</a>`;
    },
};

class BMarkdown2HTML {
    constructor(markdown, template, option = {}) {
        marked.use({ renderer });
        marked.setOptions({
            highlight: function (code, lang) {
                return hljs.highlightAuto(code, [lang]).value;
            },
        });
        this.self = this;
        this.markdown = markdown;
        this.template = template;
        this.content = marked(this.markdown);
        this.title = articleTitle;
        this.summary = summary;
        this.tags = tags;
        this.dates = dates;
        this.url = option.url;
        this.data = {
            article: {
                url: this.url,
                title: this.title,
                tags: this.tags,
                summary: this.summary,
                content: this.content,
                createdAt: dates[0],
                updatedAt: dates[1],
                prev: option ? option.prev : undefined,
                next: option ? option.next : undefined,
            },
        };
    }
    async init() {
        try {
            if (!this.template) return;
            this.content = await ejs.renderFile(this.template, this.data);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
        return this.self;
    }
    toString() {
        return this.content;
    }
}

module.exports = { BMarkdown2HTML };
