function getRelativePath(path, ext) {
    const basePath = `${ext ? './' : ''}sites/blog.bokken.io/`;
    const replacedPath = path?.replace(basePath, "")
    return replacedPath;
}

module.exports = { getRelativePath };
