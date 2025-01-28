const mainTitleWrapper = $("#main-title-name-container");
const titleResumeWrapper = $("#title-resume");

calculateSize = () => {
    titleResumeWrapper.width(mainTitleWrapper.width());
}

const titleCrossButton = document.getElementById("cross-button");

titleCrossButton.addEventListener("click", (e) => {

    const textWrapper = document.getElementById("cross-button-text");
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

    anime.timeline({loop: true})
        .add({
            targets: '#cross-button-text .letter',
            scale: 0,
            opacity: 0,
            translateZ: 0,
            easing: "easeOutExpo",
            duration: anime.stagger(400, {direction: 'reverse'}),
            delay: (el, i) => 50 * (i+1)
        })

    anime({
        targets: '#cross-button',
        width: 0,
        opacity: 0,
        duration: 700,
        easing: 'easeInQuad',
    });

    anime({
        targets: '#cross-left',
        left: "-48vw",
        duration: 1000,
        easing: 'easeInQuad',
        delay: 1000,
    });

    anime({
        targets: '#cross-right',
        left: "48vw",
        duration: 1000,
        easing: 'easeInQuad',
        delay: 1000,
    });

    anime({
        targets: '#portfolio-zone',
        width: "95vw",
        duration: 1000,
        easing: 'easeInQuad',
        delay: 1000,
    });

    setTimeout(() =>{
        const portfolioWrapper = document.getElementById("portfolio");
        portfolioWrapper.classList.remove("transparent");
        portfolioWrapper.classList.add("opaque");
        portfolioWrapper.classList.remove("overlay-no-pointer-events");
    }, 2000)
})

window.onresize = () => calculateSize();
calculateSize();