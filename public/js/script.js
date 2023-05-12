// get the sticky element
const stickyElm = document.querySelector('header')

window.onscroll = function() {
    if (window.scrollY === 0) {
        stickyElm.classList.remove("isSticky");
    } else {
        stickyElm.classList.add("isSticky");
    }
};

// const uiElapsedElement = document.getElementById('home-discord-ui-elapsed');
// let seconds = 0;
// let minutes = 0;
// let hours = 0;
// function pad(n) {
//     return n < 10 ? '0' + n : n;
// }
// const uiElapsed = setInterval(() => {
//     seconds++;
//     if (seconds >= 60) {
//         minutes++;
//         seconds = 0;
//     }
//     if (minutes >= 60) {
//         hours++;
//         minutes = 0;
//     }
//     uiElapsedElement.innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)} elapsed`;
// }, 1000)