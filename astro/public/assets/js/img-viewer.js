document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
        img.addEventListener('click', () => {
            window.open(img.src);
        })
    })
});
