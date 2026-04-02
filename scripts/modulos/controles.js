export const teclas = {};
let turboActivo = false;

window.addEventListener('keydown', (e) => {
    teclas[e.key] = true;
    if (e.code === 'Space') turboActivo = true;
});

window.addEventListener('keyup', (e) => {
    teclas[e.key] = false;
    if (e.code === 'Space') turboActivo = false;
});

export function getTurbo() {
    return turboActivo;
}
