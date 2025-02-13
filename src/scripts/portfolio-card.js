const portfolioZones = [
    "portfolio-zone-tech",
    "portfolio-zone-art",
    "portfolio-zone-ui"
]

const SetupZoneButtons = (zoneName) => {
    const zoneWrapper = document.getElementById(zoneName);

    const previewWrapper = zoneWrapper.getElementsByClassName("preview")
    const activeWrapper = zoneWrapper.getElementsByClassName("active")
    const collapsedWrapper = zoneWrapper.getElementsByClassName("collapsed")

    const buttonPreview = previewWrapper[0].getElementsByClassName("portfolio-zone-button")[0]
    buttonPreview.addEventListener("click", (e) => {
        ActiveZone(zoneName);
        portfolioZones.forEach(zone => {
            if(zoneName !== zone){
                CollapseZone(zone);
            }
        })
    })

    const buttonCollapsed = collapsedWrapper[0].getElementsByClassName("portfolio-zone-button")[0]
    buttonCollapsed.addEventListener("click", (e) => {
        ActiveZone(zoneName);
        portfolioZones.forEach(zone => {
            if(zoneName !== zone){
                CollapseZone(zone);
            }
        })
    })

    const activeButton = activeWrapper[0].getElementsByClassName("portfolio-close-button")[0]
    activeButton.addEventListener("click", (e) => {
       portfolioZones.forEach(zone => {
           PreviewAllZone(zone);
       })
    })
}

const ActiveZone = (zoneName) => {
    switch(zoneName){
        case "portfolio-zone-tech":
            window.TechGalaxy();
            break;
        case "portfolio-zone-art":
            window.ArtGalaxy();
            break;
        case "portfolio-zone-ui":
            window.UiGalaxy();
            break;
    }

    const zoneWrapper = document.getElementById(zoneName);

    zoneWrapper.classList.remove("preview-size");
    zoneWrapper.classList.add("active-size");
    zoneWrapper.classList.remove("collapsed-size");

    const previewWrapper = zoneWrapper.getElementsByClassName("preview")
    const activeWrapper = zoneWrapper.getElementsByClassName("active")
    const collapsedWrapper = zoneWrapper.getElementsByClassName("collapsed")

    activeWrapper[0].classList.remove("disabled");
    activeWrapper[0].classList.add("enabled");

    previewWrapper[0].classList.remove("enabled");
    previewWrapper[0].classList.add("disabled");

    collapsedWrapper[0].classList.remove("enabled");
    collapsedWrapper[0].classList.add("disabled");
}

const CollapseZone = (zoneName) => {
    const zoneWrapper = document.getElementById(zoneName);

    zoneWrapper.classList.remove("preview-size");
    zoneWrapper.classList.remove("active-size");
    zoneWrapper.classList.add("collapsed-size");

    const previewWrapper = zoneWrapper.getElementsByClassName("preview")
    const activeWrapper = zoneWrapper.getElementsByClassName("active")
    const collapsedWrapper = zoneWrapper.getElementsByClassName("collapsed")

    collapsedWrapper[0].classList.remove("disabled");
    collapsedWrapper[0].classList.add("enabled");

    previewWrapper[0].classList.remove("enabled");
    previewWrapper[0].classList.add("disabled");

    activeWrapper[0].classList.remove("enabled");
    activeWrapper[0].classList.add("disabled");
}

const PreviewAllZone = () => {
    window.DefaultGalaxy();

    portfolioZones.forEach(zoneName => {
        const zoneWrapper = document.getElementById(zoneName);

        zoneWrapper.classList.add("preview-size");
        zoneWrapper.classList.remove("active-size");
        zoneWrapper.classList.remove("collapsed-size");

        const previewWrapper = zoneWrapper.getElementsByClassName("preview")
        const activeWrapper = zoneWrapper.getElementsByClassName("active")
        const collapsedWrapper = zoneWrapper.getElementsByClassName("collapsed")

        previewWrapper[0].classList.remove("disabled");
        previewWrapper[0].classList.add("enabled");

        activeWrapper[0].classList.remove("enabled");
        activeWrapper[0].classList.add("disabled");

        collapsedWrapper[0].classList.remove("enabled");
        collapsedWrapper[0].classList.add("disabled");
    })
}

portfolioZones.forEach(zoneName => {
    SetupZoneButtons(zoneName);
})