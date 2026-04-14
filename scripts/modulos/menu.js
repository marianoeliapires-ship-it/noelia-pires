let modoJuego = null;

export function crearMenu(iniciarJuegoCallback) {

    const menu = document.createElement("div");

    menu.style.position = "absolute";
    menu.style.top = "0";
    menu.style.left = "0";
    menu.style.width = "100%";
    menu.style.height = "100%";
    menu.style.background = "linear-gradient(#1a1a1a, #000)";
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.justifyContent = "center";
    menu.style.alignItems = "center";
    menu.style.zIndex = "9999";

    // TÍTULO
    const titulo = document.createElement("h1");
    titulo.innerText = "🚗 JUEGO NOELIA PIRES";
    titulo.style.color = "#FFD700";
    titulo.style.fontFamily = "Consolas";
    titulo.style.fontSize = "50px";
    titulo.style.textShadow = "0 0 20px gold";

    //  BOTÓN SOLO
    const soloBtn = document.createElement("button");
    soloBtn.innerText = "CARRERA LIBRE";
    estiloBoton(soloBtn);

    soloBtn.onclick = () => {
        modoJuego = "solo";
        document.body.removeChild(menu);
        iniciarJuegoCallback(modoJuego);
    };

    //  BOTÓN IA
    const iaBtn = document.createElement("button");
    iaBtn.innerText = "CARRERA CONTRA IA"
    estiloBoton(iaBtn);

    iaBtn.onclick = () => {
        modoJuego = "ia";
        document.body.removeChild(menu);
        iniciarJuegoCallback(modoJuego);
    };

    menu.appendChild(titulo);
    menu.appendChild(soloBtn);
    menu.appendChild(iaBtn);

    document.body.appendChild(menu);
}

// estilo reutilizable
function estiloBoton(btn) {
    btn.style.margin = "10px";
    btn.style.padding = "15px 40px";
    btn.style.fontSize = "20px";
    btn.style.fontFamily = "Consolas";
    btn.style.background = "linear-gradient(45deg, #FFD700, #FFA500)";
    btn.style.border = "none";
    btn.style.borderRadius = "10px";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 0 10px gold";

    btn.onmouseenter = () => {
        btn.style.transform = "scale(1.1)";
    };

    btn.onmouseleave = () => {
        btn.style.transform = "scale(1)";
    };
}