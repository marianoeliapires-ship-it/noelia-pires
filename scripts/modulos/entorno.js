import { cargarBosque, crearBosqueLateral } from './bosque.js';
import { cargarAnimales } from './deer.js';
import { cargarCampo } from './campo.js';
import { cargarPlaya } from './playa.js';
import { cargarAgua, actualizarAgua } from './agua.js';
import { cargarTerrenal } from './terreno.js';

export function cargarEntorno() {
    cargarAnimales();
    cargarBosque();
    cargarTerrenal();
    cargarPlaya();
    cargarAgua();
    cargarCampo();
}

export { actualizarAgua, crearBosqueLateral };
