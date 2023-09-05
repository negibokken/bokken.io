const fs = require('fs');
const { globSync } = require('glob');
const { Article } = require('./entities/article');
const { m2h } = require('./lib/b_markdown_2_html_connector');



(async () => {
    const rowArticles = globSync('./sites/blog.bokken.io/articles/**/*.md',
        { ignore: '**/current/*.md' }
    ).reverse();

    const articles = [];

    for (let i = 0; i < rowArticles.length; i += 1) {
        const prevArticle = i - 1 >= 0 ? rowArticles[i - 1] : undefined;
        const nextArticle = i + 1 < rowArticles.length ? rowArticles[i + 1] : undefined;
        const currentArticle = rowArticles[i];
        const article = new Article(currentArticle, prevArticle, nextArticle);
        articles.push(article);
    }

    const templatePath = './scripts/blog/templates/blog-article.ejs'

    for await (const article of articles) {
        try {
            const articleHTML = await m2h(article.path, article.prev, article.next, templatePath);
            fs.writeFileSync(article.path.replace('.md', '.html'), articleHTML);
            console.log(`✅ ${article.path.replace(".md", ".html")}`);
        } catch (e) {
            console.error(`❌ ${article.path}: ${e}`);
        }
    }
})()
