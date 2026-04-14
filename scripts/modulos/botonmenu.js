let botonMenu = null;

export function crearBotonMenu(callback) {

    botonMenu = document.createElement("button");

    botonMenu.innerText = "MENÚ";

    botonMenu.style.position = "absolute";
    botonMenu.style.top = "20px";
    botonMenu.style.left = "20px";

    botonMenu.style.padding = "10px 20px";
    botonMenu.style.fontSize = "16px";
    botonMenu.style.fontFamily = "Consolas";

    botonMenu.style.background = "linear-gradient(45deg, #FFD700, #FFA500)";
    botonMenu.style.border = "none";
    botonMenu.style.borderRadius = "8px";
    botonMenu.style.cursor = "pointer";

    botonMenu.style.boxShadow = "0 0 10px gold";
    botonMenu.style.zIndex = "9999";

    botonMenu.style.transition = "0.2s";

    // hover
    botonMenu.onmouseenter = () => {
        botonMenu.style.transform = "scale(1.1)";
    };

    botonMenu.onmouseleave = () => {
        botonMenu.style.transform = "scale(1)";
    };

    // click
    botonMenu.onclick = callback;

    document.body.appendChild(botonMenu);
}