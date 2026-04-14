let botonRestart = null;

export function crearBotonRestart() {

    botonRestart = document.createElement("img");

    // IMAGEN
    botonRestart.src = "./texturas/restart.png";

    botonRestart.style.position = "absolute";
    botonRestart.style.top = "65%";
    botonRestart.style.left = "50%";
    botonRestart.style.transform = "translateX(-50%)";

    botonRestart.style.width = "120px"; // ajusta tamaño
    botonRestart.style.cursor = "pointer";
    botonRestart.style.display = "none";
    botonRestart.style.zIndex = "9999";

    botonRestart.style.transition = "all 0.2s ease";

    // pro
    botonRestart.onmouseenter = () => {
        botonRestart.style.transform = "translateX(-50%) scale(1.1)";
    };

    botonRestart.onmouseleave = () => {
        botonRestart.style.transform = "translateX(-50%) scale(1)";
    };

    // reiniciar juego
    botonRestart.onclick = () => {
        location.reload();
    };

    document.body.appendChild(botonRestart);
}

// mostrar botón
export function mostrarBotonRestart() {
    if (botonRestart) {
        botonRestart.style.display = "block";
    }
}