class Article {
    constructor(
        _path, _prev, _next,
    ) {
        this.path = _path;
        this.prev = _prev;
        this.next = _next;
    }
}

module.exports = { Article };
