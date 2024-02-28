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
    const ubicacionMalla200 = 21 // Modificar según la ubicación en la lista de tamices
    const ubicacionMalla4 = 9 // Modificar según la ubicación en la lista de tamices
    const ubicacionMalla3in = 0 // Modificar según la ubicación en la lista de tamices
    const finos = pasanteGtria[ubicacionMalla200];
    const arenas = pasanteGtria[ubicacionMalla4] - finos;
    const gravas = pasanteGtria[ubicacionMalla3in] - pasanteGtria[ubicacionMalla4];
    const IP = LL - LP;
    let clasificacionSuelo = null;
    let simboloSuelo = null;

    if (finos >= 50) {
        if (LL < 50) {
            if (IP > 7 && IP >= 0.73 * (LL - 20)) {
                clasificacionSuelo = "Arcilla fina"
                simboloSuelo = "CL"
            } else if (IP >= 4 && IP <= 7 && IP >= 0.73 * (LL - 20)) {
                clasificacionSuelo = "Arcilla limosa"
                simboloSuelo = "CL-ML"
            } else if (IP < 4 || IP < 0.73 * (LL - 20)) {
                clasificacionSuelo = "Limo"
                simboloSuelo = "ML"
            }
        }

        return [gravas, arenas, finos, IP];
    }
}

function inicializarBotonCalcular() {
    const boton = document.getElementById("boton-calcular");
    boton.addEventListener("click", () => {
        const datosEntradaLeidos = leerDatosEntrada();
        console.log(datosEntradaLeidos)
        const resultados = resolverGranulometria(...datosEntradaLeidos);
        console.log(resultados)
    });
}

// INICIO DEL PROGRAMA
inicializarBotonCalcular();