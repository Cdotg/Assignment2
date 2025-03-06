document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const c = canvas.getContext('2d');

    canvas.width = 1920
    canvas.height = 1080



    c.fillRect(0, 0, canvas.width, canvas.height)
});
