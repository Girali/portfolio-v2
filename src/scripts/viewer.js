const imgViewerWrapper = document.getElementById("img-viewer");
const imgViewerContainerWrapper = document.getElementById("portfolio-image-viewer");

function setupViewers(){
    document.querySelectorAll('.viewer').forEach(div => {
        div.addEventListener("click", (e) => {
            onViewerClick(div);
        })
    });
}

function onViewerClick(div) {
    imgViewerContainerWrapper.classList.add('opaque');
    imgViewerContainerWrapper.classList.remove('transparent');
    imgViewerContainerWrapper.classList.remove('overlay-no-pointer-events');

    const imgSrc = div.getAttribute('toView');
    imgViewerWrapper.src = imgSrc;
}

function onQuitViewer(){
    imgViewerContainerWrapper.classList.add('transparent');
    imgViewerContainerWrapper.classList.remove('opaque');
    imgViewerContainerWrapper.classList.add('overlay-no-pointer-events');
}

function notifyController() {
    anime({
        targets: '#notify-controller',
        scale: ["80%", "200%"],
        opacity: [0.5, 1, 0],
        duration: 500,
        easing: 'easeInQuad',
    });
}

imgViewerContainerWrapper.addEventListener("click", (e) => {
    onQuitViewer();
});

document.getElementById("viewer-notify-controller").addEventListener("click", notifyController);

setupViewers();