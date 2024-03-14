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
    let resultados = []
    const totalPesos = pesosGtria.reduce((acumulador, elemento) => acumulador + elemento, 0);
    let retParcial = [];
    let retParcialAcum = [];
    let pasanteGtria = [];
    let aberturaTamizmm = [75, 63, 50, 37.5, 25, 19, 12.5, 9.5, 6.3, 4.75, 2.36, 2.0, 1.1, 0.85, 0.6, 0.425, 0.3, 0.25, 0.18, 0.15, 0.106, 0.075]
    for (let i = 0; i < pesosGtria.length; i++) {
        retParcial[i] = pesosGtria[i] / totalPesos * 100;
        retParcialAcum[i] = retParcial[i] + (retParcialAcum[i - 1] || 0);
        pasanteGtria.push(Math.round((100 - retParcialAcum[i]) * 100) / 100);
    }
    const ubicacionMalla200 = 21 // Modificar según la ubicación en la lista de tamices
    const ubicacionMalla4 = 9 // Modificar según la ubicación en la lista de tamices
    const ubicacionMalla3in = 0 // Modificar según la ubicación en la lista de tamices
    const finos = pasanteGtria[ubicacionMalla200];
    const gruesos = 100 - finos
    const arenas = pasanteGtria[ubicacionMalla4] - finos;
    const gravas = pasanteGtria[ubicacionMalla3in] - pasanteGtria[ubicacionMalla4];
    const IP = LL - LP;
    let clasificacionSuelo = null;
    let simboloSuelo = null;

    function resolverSufijosYprefijos(clasificacionSuelo, simboloSuelo, gruesos, arenas, gravas) {

        if (gruesos >= 15 && gruesos < 30) {
            if (arenas >= gravas) {
                clasificacionSuelo = clasificacionSuelo + " con arena"
                simboloSuelo = "(" + simboloSuelo + ")s"
            } else {
                clasificacionSuelo = clasificacionSuelo + " con grava"
                simboloSuelo = "(" + simboloSuelo + ")g"
            }
        } else if (gruesos >= 30) {

            if (arenas >= gravas) {

                if (gravas < 15) {
                    clasificacionSuelo = clasificacionSuelo + " arenoso(a)"
                    simboloSuelo = "s(" + simboloSuelo + ")"
                } else {
                    clasificacionSuelo = clasificacionSuelo + " arenoso(a) con grava"
                    simboloSuelo = "s(" + simboloSuelo + ")g"
                }
            } else {
                if (arenas < 15) {
                    clasificacionSuelo = clasificacionSuelo + " gravoso(a)"
                    simboloSuelo = "g(" + simboloSuelo + ")"
                } else {
                    clasificacionSuelo = clasificacionSuelo + " gravoso(a) con arena"
                    simboloSuelo = "g(" + simboloSuelo + ")s"
                }
            }
        }

        console.log("avanzó", clasificacionSuelo, simboloSuelo)
        return [clasificacionSuelo, simboloSuelo]
    }
    function resolverFinos(clasificacionSuelo, simboloSuelo, LL, IP) {
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
        } else {
            if (IP >= 0.73 * (LL - 20)) {
                clasificacionSuelo = "Arcilla gruesa"
                simboloSuelo = "CH"
            } else {
                clasificacionSuelo = "Limo elástico"
                simboloSuelo = "MH"
            }
        }
        // console.log(clasificacionSuelo)
        return [clasificacionSuelo, simboloSuelo]
    }

    if (finos >= 50) { // Suelos finos

        [clasificacionSuelo, simboloSuelo] = resolverFinos(clasificacionSuelo, simboloSuelo, LL, IP)

        resultados = resolverSufijosYprefijos(clasificacionSuelo, simboloSuelo, gruesos, arenas, gravas)


    } else { // Suelos gruesos
        const pasaInf60 = pasanteGtria.find((el) => el < 60)
        const indexPasaInf60 = pasanteGtria.indexOf(pasaInf60)
        const indexPasaSup60 = indexPasaInf60 - 1
        const pasaSup60 = pasanteGtria[indexPasaSup60]
        const Dsup60 = aberturaTamizmm[indexPasaSup60]
        const Dinf60 = aberturaTamizmm[indexPasaInf60]
        const D60 = Dinf60 * (Dsup60 / Dinf60) ** ((60 - pasaInf60) / (pasaSup60 - pasaInf60))

        const pasaInf30 = pasanteGtria.find((el) => el < 30)
        const indexPasaInf30 = pasanteGtria.indexOf(pasaInf30)
        const indexPasaSup30 = indexPasaInf30 - 1
        const pasaSup30 = pasanteGtria[indexPasaSup30]
        const Dsup30 = aberturaTamizmm[indexPasaSup30]
        const Dinf30 = aberturaTamizmm[indexPasaInf30]
        const D30 = Dinf30 * (Dsup30 / Dinf30) ** ((30 - pasaInf30) / (pasaSup30 - pasaInf30))
        
        const pasaInf10 = pasanteGtria.find((el) => el < 10)
        const indexPasaInf10 = pasanteGtria.indexOf(pasaInf10)
        const indexPasaSup10 = indexPasaInf10 - 1
        const pasaSup10 = pasanteGtria[indexPasaSup10]
        const Dsup10 = aberturaTamizmm[indexPasaSup10]
        const Dinf10 = aberturaTamizmm[indexPasaInf10]
        const D10 = Dinf10 * (Dsup10 / Dinf10) ** ((10 - pasaInf10) / (pasaSup10 - pasaInf10))
        
        const Cu = Math.round(D60 / D10 * 100) / 100
        const Cc = Math.round( (D30 ** 2) / (D60 * D10) *100 ) / 100
        console.log(D60, D30, D10)
        
        const [, simboloPorcionFina] = resolverFinos(clasificacionSuelo, simboloSuelo, LL, IP)

        if (gravas > arenas) {
            if (finos < 5) {
                if (Cu >= 4 && Cc <= 3 && Cc >= 1) {
                    clasificacionSuelo = "Grava bien gradada"
                    simboloSuelo = "GW"
                } else {
                    clasificacionSuelo = "Grava mal gradada"
                    simboloSuelo = "GP"
                }
            } else if (finos >= 5 && finos <= 12) {
                if (Cu >= 4 && Cc <= 3 && Cc >= 1) {
                    clasificacionSuelo = "Grava bien gradada"
                    simboloSuelo = "GW"
                } else {
                    clasificacionSuelo = "Grava mal gradada"
                    simboloSuelo = "GP"
                }

                if (simboloPorcionFina === "ML" || simboloPorcionFina === "MH") {
                    clasificacionSuelo = clasificacionSuelo + " con limo"
                    simboloSuelo = simboloSuelo + "-GM"
                } else if (simboloPorcionFina === "CL" || simboloPorcionFina === "CH" || simboloPorcionFina === "CL-ML") {
                    clasificacionSuelo = clasificacionSuelo + " con arcilla (o arcilla limosa)"
                    simboloSuelo = simboloSuelo + "-GC"
                }

            } else { // finos >12
                if (simboloPorcionFina === "ML" || simboloPorcionFina === "MH") {
                    clasificacionSuelo = "Grava limosa"
                    simboloSuelo = "GM"
                } else if (simboloPorcionFina === "CL" || simboloPorcionFina === "CH") {
                    clasificacionSuelo = "Grava arcillosa"
                    simboloSuelo = "GC"
                } else if (simboloPorcionFina === "CL-ML") {
                    clasificacionSuelo = "Grava arcillosa limosa"
                    simboloSuelo = "GC-GM"
                }
            }

            if (arenas >= 15) {
                clasificacionSuelo = clasificacionSuelo + " con arena"
                simboloSuelo = "(" + simboloSuelo + ")s"
            }

        } else { // arenas >= gravas

            if (finos < 5) {
                if (Cu >= 6 && Cc <= 3 && Cc >= 1) {
                    clasificacionSuelo = "Arena bien gradada"
                    simboloSuelo = "SW"
                } else {
                    clasificacionSuelo = "Arena mal gradada"
                    simboloSuelo = "SP"
                }
            } else if (finos >= 5 && finos <= 12) {
                if (Cu >= 6 && Cc <= 3 && Cc >= 1) {
                    clasificacionSuelo = "Arena bien gradada"
                    simboloSuelo = "SW"
                } else {
                    clasificacionSuelo = "Arena mal gradada"
                    simboloSuelo = "SP"
                }

                if (simboloPorcionFina === "ML" || simboloPorcionFina === "MH") {
                    clasificacionSuelo = clasificacionSuelo + " con limo"
                    simboloSuelo = simboloSuelo + "-SM"
                } else if (simboloPorcionFina === "CL" || simboloPorcionFina === "CH" || simboloPorcionFina === "CL-ML") {
                    clasificacionSuelo = clasificacionSuelo + " con arcilla (o arcilla limosa)"
                    simboloSuelo = simboloSuelo + "-SC"
                }

            } else { // finos >12
                if (simboloPorcionFina === "ML" || simboloPorcionFina === "MH") {
                    clasificacionSuelo = "Arena limosa"
                    simboloSuelo = "SM"
                } else if (simboloPorcionFina === "CL" || simboloPorcionFina === "CH") {
                    clasificacionSuelo = "Arena arcillosa"
                    simboloSuelo = "SC"
                } else if (simboloPorcionFina === "CL-ML") {
                    clasificacionSuelo = "Arena arcillosa limosa"
                    simboloSuelo = "SC-SM"
                }
            }

            if (gravas >= 15) {
                clasificacionSuelo = clasificacionSuelo + " con grava"
                simboloSuelo = "(" + simboloSuelo + ")g"
            }
        }
        resultados = [clasificacionSuelo, simboloSuelo, Cu, Cc]
    }
    return [gruesos, finos, gravas, arenas, IP, ...resultados];
}

function inicializarBotonCalcular() {
    const boton = document.getElementById("boton-calcular");
    boton.addEventListener("click", () => {
        // const datosEntradaLeidos = leerDatosEntrada();
        // console.log(datosEntradaLeidos)

        //                                       [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        const datosEntradaLeidos = [0, 0, 0, 0, 0, 0, 2, 0, 0, 6, 0, 40, 0, 0, 0, 26, 0, 0, 0, 0, 0, 16, 10]
        // console.log(datosEntradaLeidos)
        // const resultados = resolverGranulometria(...datosEntradaLeidos);
        const resultados = resolverGranulometria(datosEntradaLeidos, 28, 22);
        console.log(resultados)
    });
}

// INICIO DEL PROGRAMA
inicializarBotonCalcular();