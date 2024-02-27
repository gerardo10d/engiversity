// FUNCIONES

function leerDatosEntrada() {
    const pesosGranulometria = document.getElementsByClassName("pesos-granulom");
    let pesosGtria = [];
    for (let i = 0; i < pesosGranulometria.length; i++) {
        pesosGtria.push(parseFloat(pesosGranulometria[i].value) || 0);
    }
    const LL = parseFloat(document.getElementById("LL").value);
    const LP = parseFloat(document.getElementById("LP").value);
    return [pesosGtria, LL, LP];
}

function resolverGranulometria(pesosGtria, LL, LP) {
    const totalPesos = pesosGtria.reduce((acumulador, elemento) => acumulador + elemento, 0);
    let retParcial = [];
    let retParcialAcum = [];
    let pasanteGtria = [];
    for (let i = 0; i < pesosGtria.length; i++) {
        retParcial[i] = pesosGtria[i] / totalPesos * 100;
        retParcialAcum[i] = retParcial[i] + (retParcialAcum[i - 1] || 0);
        pasanteGtria.push(Math.round((100 - retParcialAcum[i]) * 100) / 100);
    }
    const finos = pasanteGtria[12];
    const arenas = pasanteGtria[6] - finos;
    const gravas = 100 - arenas - finos;
    const IP = LL - LP;
    let clasificacionSuelo = null;

    if (finos >= 50) {
        if (LL < 50) {
            if (IP >= 0.73 * (LL - 20)) {
                if (IP > 7) {
                    clasificacionSuelo = "CL";
                } else if (IP >= 4 && IP <= 7) {
                    clasificacionSuelo = "CL-ML";
                } else {
                    clasificacionSuelo = "ML";
                }
            } else {
                clasificacionSuelo = "ML";
            }
        }
    } else {

    }

    return [gravas, arenas, finos];
}

function inicializarBotonCalcular() {
    const boton = document.getElementById("boton-calcular");
    boton.addEventListener("click", () => {
        const datosEntradaLeidos = leerDatosEntrada();
        const resultados = resolverGranulometria(...datosEntradaLeidos);
    });
}

// INICIO DEL PROGRAMA
inicializarBotonCalcular();