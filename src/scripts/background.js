
const tileWrapper = document.getElementById("tiles");
const sparksWrapper = document.getElementById("sparks");

let sizeYTile = document.body.clientHeight
const sizeXTile = 75

let columns = 0;
let rows = 0;

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

const maxDelay = 2500;
const sparkCount = 20;

let opened = false;

const createSpark = () => {
    const tile = document.createElement('div');

    tile.classList.add('spark');

    const randX = Math.floor(Math.random() * screenWidth);
    const randDelay = Math.floor(Math.random() * maxDelay);

    tile.style.left = randX + "px";
    tile.style.bottom = "-200px";

    sparksWrapper.appendChild(tile);
}

const handleOnClickTitle = index => {
    if(opened == false) {
        opened = true;

        anime({
            targets: ".tile",
            opacity: 0,
            delay: anime.stagger(50, {
                grid: [columns, rows],
                from: index,
            })
        })

        anime({
            targets: ".spark",
            delay: function () { return anime.random(0, maxDelay) },
            translateY: -screenHeight * 1.5,
            easing: "easeInOutExpo",
            duration: 1000,
            loop: true,
        })

        document.getElementById("background-mask").classList.add("background-animated");
        document.getElementById("background-blur").classList.add("background-blur-animated");

        const titleWrapper = document.getElementById("title");

        titleWrapper.classList.remove("transparent");
        titleWrapper.classList.add("opaque");

        const crossButton = document.getElementById("portfolio-button");

        crossButton.classList.remove("transparent");
        crossButton.classList.add("opaque");


        const startWrapper = document.getElementById("start-text");

        startWrapper.classList.remove("opaque");
        startWrapper.classList.add("transparent");

        const backgroundWrapper = document.getElementById("background");
        backgroundWrapper.classList.add("overlay-no-pointer-events");

        window.InitGalaxy();
    }
}

const createTile = index => {
    const tile = document.createElement('div');

    tile.classList.add('tile');

    tile.onclick = e => handleOnClickTitle(index);

    return tile;
}

const createTiles = quantity => {
    Array.from(Array(quantity)).map((tile, index) => {
        tileWrapper.appendChild(createTile(index));
    })
}

const createGrid = () => {
    tileWrapper.innerHTML = '';

    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    sizeYTile = document.body.clientHeight

    columns = Math.floor(document.body.clientWidth / sizeXTile);
    rows = Math.floor(document.body.clientHeight / sizeYTile);

    tileWrapper.style.setProperty('--columns', columns);
    tileWrapper.style.setProperty('--rows', rows);

    createTiles(columns * rows);
}

const createSparks = () => {
    for (i = 0; i < sparkCount; i++) {
        createSpark();
    }
}

window.onresize = () => createGrid();
createGrid();
