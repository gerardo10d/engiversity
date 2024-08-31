// FUNCIONES

const roundCifras = (num, cifras) => Math.round(num * 10 ** cifras) / 10 ** cifras

function leerDatosEntrada() {
    const LL = parseFloat(document.getElementById("LL").value) || 0
    const LP = parseFloat(document.getElementById("LP").value) || 0
    const datosGranulometria = document.getElementsByClassName("datos-granulom")
    let indiceMallaN4
    let indiceMallaN200
    const arrayGtria = []
    const arrayAberturaTamizmm = []
    for (let i = 0; i < datosGranulometria.length; i++) {
        if (datosGranulometria[i].value) {
            arrayGtria.push(parseFloat(datosGranulometria[i].value))
            arrayAberturaTamizmm.push(aberturaTamizmm[i])
        }
        if (i == 9) {
            indiceMallaN4 = arrayGtria.length - 1
        }
        if (i == 21) {
            indiceMallaN200 = arrayGtria.length - 1
        }
    }
    return [arrayGtria, LL, LP, indiceMallaN4, indiceMallaN200, arrayAberturaTamizmm]

}

function resolverGranulometria(esConPesos, pesosOpasantesGtria, LL, LP, indiceMallaN4, indiceMallaN200, arrayAberturaTamizmm) {
    let pasanteGtria = []
    if (esConPesos) {
        const totalPesos = pesosOpasantesGtria.reduce((acumulador, elemento) => acumulador + elemento, 0)
        let retParcial = []
        let retParcialAcum = []
        for (let i = 0; i < pesosOpasantesGtria.length; i++) {
            retParcial[i] = pesosOpasantesGtria[i] / totalPesos * 100;
            retParcialAcum[i] = retParcial[i] + (retParcialAcum[i - 1] || 0);
            pasanteGtria.push(Math.round((100 - retParcialAcum[i]) * 100) / 100);
        }
    } else {
        pasanteGtria = pesosOpasantesGtria.slice() //crear copia
    }
    // console.log(pasanteGtria)

    let resultados = []
    const finos = pasanteGtria[indiceMallaN200]
    const gruesos = 100 - finos
    const arenas = pasanteGtria[indiceMallaN4] - finos
    const gravas = 100 - pasanteGtria[indiceMallaN4]
    const IP = LL - LP
    let clasificacionSuelo = null
    let simboloSuelo = null
    let Cu = null
    let Cc = null


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
        return [clasificacionSuelo, simboloSuelo]
    }

    if (finos >= 50) { // Suelos finos

        [clasificacionSuelo, simboloSuelo] = resolverFinos(clasificacionSuelo, simboloSuelo, LL, IP)

        resultados = resolverSufijosYprefijos(clasificacionSuelo, simboloSuelo, gruesos, arenas, gravas)


    } else { // Suelos gruesos
        function resolverCuCc() {
            const pasaInf60 = pasanteGtria.find((el) => el <= 60)
            const indexPasaInf60 = pasanteGtria.indexOf(pasaInf60)
            const indexPasaSup60 = indexPasaInf60 - 1
            const pasaSup60 = pasanteGtria[indexPasaSup60]
            const Dsup60 = arrayAberturaTamizmm[indexPasaSup60]
            const Dinf60 = arrayAberturaTamizmm[indexPasaInf60]
            const D60 = Dinf60 * (Dsup60 / Dinf60) ** ((60 - pasaInf60) / (pasaSup60 - pasaInf60))

            const pasaInf30 = pasanteGtria.find((el) => el <= 30)
            const indexPasaInf30 = pasanteGtria.indexOf(pasaInf30)
            const indexPasaSup30 = indexPasaInf30 - 1
            const pasaSup30 = pasanteGtria[indexPasaSup30]
            const Dsup30 = arrayAberturaTamizmm[indexPasaSup30]
            const Dinf30 = arrayAberturaTamizmm[indexPasaInf30]
            const D30 = Dinf30 * (Dsup30 / Dinf30) ** ((30 - pasaInf30) / (pasaSup30 - pasaInf30))

            const pasaInf10 = pasanteGtria.find((el) => el <= 10)
            const indexPasaInf10 = pasanteGtria.indexOf(pasaInf10)
            const indexPasaSup10 = indexPasaInf10 - 1
            const pasaSup10 = pasanteGtria[indexPasaSup10]
            const Dsup10 = arrayAberturaTamizmm[indexPasaSup10]
            const Dinf10 = arrayAberturaTamizmm[indexPasaInf10]
            const D10 = Dinf10 * (Dsup10 / Dinf10) ** ((10 - pasaInf10) / (pasaSup10 - pasaInf10))

            Cu = roundCifras(D60 / D10, 2)
            Cc = roundCifras((D30 ** 2) / (D60 * D10), 2)
            // console.log(D60, D30, D10)
            // console.log(Cu, Cc)
            return [Cu, Cc]

        }

        const [, simboloPorcionFina] = resolverFinos(clasificacionSuelo, simboloSuelo, LL, IP)

        if (gravas > arenas) {
            if (finos < 5) {
                const [Cu, Cc] = resolverCuCc()
                if (Cu >= 4 && Cc <= 3 && Cc >= 1) {
                    clasificacionSuelo = "Grava bien graduada"
                    simboloSuelo = "GW"
                } else {
                    clasificacionSuelo = "Grava mal graduada"
                    simboloSuelo = "GP"
                }
            } else if (finos >= 5 && finos <= 12) {
                const [Cu, Cc] = resolverCuCc()
                if (Cu >= 4 && Cc <= 3 && Cc >= 1) {
                    clasificacionSuelo = "Grava bien graduada"
                    simboloSuelo = "GW"
                } else {
                    clasificacionSuelo = "Grava mal graduada"
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
                const [Cu, Cc] = resolverCuCc()
                if (Cu >= 6 && Cc <= 3 && Cc >= 1) {
                    clasificacionSuelo = "Arena bien graduada"
                    simboloSuelo = "SW"
                } else {
                    clasificacionSuelo = "Arena mal graduada"
                    simboloSuelo = "SP"
                }
            } else if (finos >= 5 && finos <= 12) {
                const [Cu, Cc] = resolverCuCc()
                if (Cu >= 6 && Cc <= 3 && Cc >= 1) {
                    clasificacionSuelo = "Arena bien graduada"
                    simboloSuelo = "SW"
                } else {
                    clasificacionSuelo = "Arena mal graduada"
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

    return [roundCifras(gruesos, 2), roundCifras(finos, 2), roundCifras(gravas, 2), roundCifras(arenas, 2), roundCifras(IP, 2), ...resultados, arrayAberturaTamizmm, pasanteGtria]
}

function renderizarResultados(resultados, datosGraficar) {
    const seccionResultados = document.querySelector(".resultados")
    seccionResultados.innerHTML = ""
    const h2Resultados = document.createElement("h2")
    h2Resultados.innerText = "Resultados"
    seccionResultados.append(h2Resultados)
    const contenedorResultados = document.createElement("div")
    contenedorResultados.className = "contenedor-resultados"
    seccionResultados.append(contenedorResultados)

    // const contenedorResultados = document.querySelector(".contenedor-resultados")

    contenedorResultados.innerHTML = ""
    // Colocar divs con títulos----------------------------------------------------------------------
    const titulos = ["% Gruesos:", "% Finos:", "% Gravas:", "% Arenas:", "IP:", "Clasificación:", "Símbolo:", "Cu:", "Cc:"]

    for (let i = 0; i < titulos.length; i++) {
        const spanTitulo = document.createElement("span")
        spanTitulo.className = "titulos"
        spanTitulo.innerText = titulos[i]
        contenedorResultados.append(spanTitulo)
        const spanResult = document.createElement("span")
        spanResult.className = "resultados"
        spanResult.innerText = resultados[i]
        contenedorResultados.append(spanResult)

    }

    const contenedorCurva = document.createElement("div")
    contenedorCurva.id = "curva-granulometria"
    seccionResultados.append(contenedorCurva)

    gCharts(datosGraficar, "Curva granulométrica", "curva-granulometria")
}

function ordenarResultadosParaGraficar(arrayAberturaTamizmm, pasanteGtria) {
    const datosGraficar = []
    for (let i = 0; i < arrayAberturaTamizmm.length; i++) {
        if (arrayAberturaTamizmm[i] && pasanteGtria[i]) {
            datosGraficar.push([arrayAberturaTamizmm[i], pasanteGtria[i]])
        }
    }
    // console.log(datosGraficar)
    return datosGraficar
}

function mostrarNotificacion(mensaje, color) {
    Toastify({
        text: mensaje,
        duration: 1500,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: color,
        },
        onClick: function () { } // Callback after click
    }).showToast()
}

function inicializarBotonCalcular() {
    const botonCalcular = document.getElementById("boton-calcular")
    botonCalcular.addEventListener("click", () => {
        let tipoCalculo = document.querySelector('input[name="tipo-calculo"]:checked').value
        tipoCalculo = tipoCalculo === 'masa' ? true : false
        const datosEntradaLeidos = leerDatosEntrada()
        // console.log(datosEntradaLeidos)
        const resultados = resolverGranulometria(tipoCalculo, ...datosEntradaLeidos)
        if (isNaN(resultados[0]) || isNaN(resultados[1]) || isNaN(resultados[2]) || isNaN(resultados[3])) {
            mostrarNotificacion("Ocurrió un error", "#FF4D4D")
        } else {
            mostrarNotificacion("Cálculo exitoso", "#4CAF50")
            const datosGraficar = ordenarResultadosParaGraficar(resultados.at(-2), resultados.at(-1))
            renderizarResultados(resultados, datosGraficar)
        }
    })
}

function renderizarInputsGranulometria() {
    document.body.onload = () => {

        const formGranulometria = document.querySelector(".granulometria")
        for (let i = 0; i < tamices[0].length; i++) {
            const tamiz = tamices[0][i]
            const abertura = tamices[1][i]
            const idInputTamiz = tamiz.replace(/\s/g, "")
            formGranulometria.innerHTML += `
            <label for=${idInputTamiz}>${tamiz}</label>
            <label class="etiqueta-mm" for=${idInputTamiz}>${abertura}</label>
            <input
            type="number"
            id=${idInputTamiz}
            class="datos-granulom"
            min="0.00"
            step="0.01"
            />
            `
        }
    }
}

function gCharts(datosGraficar, titulo, idElementoDom) {
    google.charts.load("current", { packages: ["corechart", "line"] })
    google.charts.setOnLoadCallback(drawChart)
    function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'X');
        data.addColumn('number', '% Pasa');

        data.addRows(datosGraficar);
        var options = {
            title: titulo,
            legend: { position: 'none' },
            hAxis: {
                title: 'Tamaño (mm)',
                logScale: true // para que sea logarítimica
            },
            vAxis: {
                title: '% Pasa'
            },
            // backgroundColor: '#f1f8e9'
            chartArea: {
                width: '70%',
                height: '70%'
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById(idElementoDom));
        chart.draw(data, options);
    }
}

// INICIO DEL PROGRAMA
const tamices = [
    // 0       1      2
    ["3 in", "2.5 in", "2 in", "1.5 in", "1 in", "3/4 in", "1/2 in", "3/8 in", "1/4 in", "#4", "#8", "#10", "#16", "#20", "#30", "#40", "#50", "#60", "#80", "#100", "#140", "#200", "Fondo"],
    ["75", "63", "50", "37.5", "25", "19", "12.5", "9.5", "6.3", "4.75", "2.36", "2.0", "1.10", "0.850", "0.600", "0.425", "0.300", "0.250", "0.180", "0.150", "0.106", "0.075", "-"]
]
const aberturaTamizmm = [75, 63, 50, 37.5, 25, 19, 12.5, 9.5, 6.3, 4.75, 2.36, 2.0, 1.1, 0.85, 0.6, 0.425, 0.3, 0.25, 0.18, 0.15, 0.106, 0.075]

renderizarInputsGranulometria()
inicializarBotonCalcular()
