const marked = require('marked');
const ejs = require('ejs');
const hljs = require('highlightjs');
const hash = require('crypto').createHash;

let articleTitle = '';
let tags = '';
let summary = '';
let descriptionExist = false;
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

let isInIndex = false;
const SUMMARY_LENGTH = 300;

const htmltagRegexp = RegExp('<.+?>', 'g');
let paragraphNumber = 1;

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
        } else if (text.includes("@description:")) {
            descriptionExist = true;
            summary = text;
            return '';
        }

        if (!isInIndex) {
            const copiedText = text.slice().replaceAll(htmltagRegexp, '').replaceAll("\n", "");
            const t = copiedText.slice(0, Math.max(SUMMARY_LENGTH - summary.length + 1, 0));
            summary += t;
        }

        const id = `paragraph-${paragraphNumber}`;
        paragraphNumber += 1;
        return `<p id="${id}" class="paragraph">${text}<a href="#${id}" class="paragraph-anchor">¶</a></p>`;
    },
    heading: (text, level) => {
        const escapedText = text.slice().toLowerCase().replaceAll(" ", "-");
        if (level == 1) {
            articleTitle = text;
        }
        const h = `<h${level}>
                      <a name="${escapedText}" href="#${escapedText}" id="${escapedText}">
                        ${text}
                      </a>
                    </h${level}>`;
        if (isInIndex) {
            isInIndex = false;
            return `</details>${h}`;
        }
        if (text === '目次' || text == 'もくじ') {
            isInIndex = true;
            return `<details><summary>## ${text} (click で開く)</summary>${h}`;
        }

        return h;
    },
    link: (href, title, text) => {
        return `<a ${isInIndex ? "" : 'target="_blank" rel="noopener"'} href="${href}" >${text}</a>`;
    },
    image: (src) => {
        return `<a href="${src}" rel="noopener"><img src="${src}" /></a>`;
    },
    listitem: (text) => {
        if (!isInIndex) {
            const copiedText = text.slice().replaceAll(htmltagRegexp, '').replaceAll("\n", "");
            const t = copiedText.slice(0, Math.max(SUMMARY_LENGTH - summary.length + 1, 0));
            summary += t;
        }
        return `<li>${text}</li>`;
    }
};

class BMarkdown2HTML {
    constructor(markdown, template, option = {}) {
        marked.use({ renderer });
        marked.setOptions({
            highlight: function(code, lang) {
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
