// FUNCIONES

const roundCifras = (num, cifras) => Math.round(num * 10 ** cifras) / 10 ** cifras

function leerDatosEntrada(esConMasas) {
    const LL = parseFloat(document.getElementById("LL").value)
    const LP = parseFloat(document.getElementById("LP").value)
    const datosGranulometria = document.getElementsByClassName("datos-granulom")
    if (esConMasas) {
        let pesosGtria = []
        for (let i = 0; i < datosGranulometria.length; i++) {
            pesosGtria.push(parseFloat(datosGranulometria[i].value) || 0)
        }
        return [pesosGtria, LL, LP]
    } else {
        let pasantesGtria = []
        let ultimoNoVacio = 100
        for (let i = 0; i < datosGranulometria.length; i++) {
            if (datosGranulometria[i].value) {
                pasantesGtria.push(parseFloat(datosGranulometria[i].value))
                ultimoNoVacio = parseFloat(datosGranulometria[i].value)
            } else {
                pasantesGtria.push(ultimoNoVacio)
            }
        }
        return [pasantesGtria, LL, LP]
    }
}

function resolverGranulometria(esConPesos, pesosOpasantesGtria, LL, LP) {
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

    let resultados = []
    const finos = pasanteGtria[ubicacionMalla200]
    const gruesos = 100 - finos
    const arenas = pasanteGtria[ubicacionMalla4] - finos
    const gravas = pasanteGtria[ubicacionMalla3in] - pasanteGtria[ubicacionMalla4]
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
            const Dsup60 = aberturaTamizmm[indexPasaSup60]
            const Dinf60 = aberturaTamizmm[indexPasaInf60]
            const D60 = Dinf60 * (Dsup60 / Dinf60) ** ((60 - pasaInf60) / (pasaSup60 - pasaInf60))

            const pasaInf30 = pasanteGtria.find((el) => el <= 30)
            const indexPasaInf30 = pasanteGtria.indexOf(pasaInf30)
            const indexPasaSup30 = indexPasaInf30 - 1
            const pasaSup30 = pasanteGtria[indexPasaSup30]
            const Dsup30 = aberturaTamizmm[indexPasaSup30]
            const Dinf30 = aberturaTamizmm[indexPasaInf30]
            const D30 = Dinf30 * (Dsup30 / Dinf30) ** ((30 - pasaInf30) / (pasaSup30 - pasaInf30))

            const pasaInf10 = pasanteGtria.find((el) => el <= 10)
            const indexPasaInf10 = pasanteGtria.indexOf(pasaInf10)
            const indexPasaSup10 = indexPasaInf10 - 1
            const pasaSup10 = pasanteGtria[indexPasaSup10]
            const Dsup10 = aberturaTamizmm[indexPasaSup10]
            const Dinf10 = aberturaTamizmm[indexPasaInf10]
            const D10 = Dinf10 * (Dsup10 / Dinf10) ** ((10 - pasaInf10) / (pasaSup10 - pasaInf10))

            Cu = Math.round(D60 / D10 * 100) / 100
            Cc = Math.round((D30 ** 2) / (D60 * D10) * 100) / 100
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

    return [roundCifras(gruesos, 2), roundCifras(finos, 2), roundCifras(gravas, 2), roundCifras(arenas, 2), roundCifras(IP, 2), ...resultados, pasanteGtria]
}

function renderizarResultados(resultados, datosGraficar) {
    const contenedorResultados = document.querySelector(".contenedor-resultados")

    contenedorResultados.innerHTML = ""
    // Colocar divs con títulos----------------------------------------------------------------------
    const titulos = ["%Gruesos:", "%Finos:", "%Gravas:", "%Arenas:", "IP:", "Clasificación:", "Símbolo:"]

    for (let i = 0; i < 7; i++) {
        const divTitulo = document.createElement("div")
        divTitulo.className = "grid-item"
        divTitulo.innerText = titulos[i]
        contenedorResultados.append(divTitulo)
        const spanResult = document.createElement("span")
        spanResult.innerText = resultados[i]
        contenedorResultados.append(spanResult)

    }

    gCharts(datosGraficar, "Curva granulométrica", "curva-granulometria")
}

function ordenarResultadosParaGraficar(resultados) {

    const pasantes = resultados.at(-1) // último elemento del array resultados, que corresponde al array de los pasantes
    pasantes.pop() // con este método se elimina el último elemento que es el fondo y no se requiere
    let mayor = Math.max(...pasantes) // se esperaría que el mayor sea 100
    let elementoGraficar = pasantes.find((elemento) => elemento < mayor) // encuentra el primer elemento menor al mayor
    let indiceGraficar = pasantes.indexOf(elementoGraficar) // determina el índice de ese elemento
    const aberturaTamizmmGraficar = []
    const pasantesGraficar = []
    aberturaTamizmmGraficar.push(aberturaTamizmm[indiceGraficar - 1]) // escoge el tamiz que corresponde al anterior al elemento, que sería el 100
    pasantesGraficar.push(pasantes[indiceGraficar - 1])
    do {
        indiceGraficar = pasantes.indexOf(elementoGraficar) // determina el índice de ese elemento
        aberturaTamizmmGraficar.push(aberturaTamizmm[indiceGraficar])
        pasantesGraficar.push(pasantes[indiceGraficar])
        mayor = elementoGraficar
        elementoGraficar = pasantes.find((elemento) => elemento < mayor) // encuentra el primer elemento menor al mayor
    } while (elementoGraficar !== undefined)

    const datosGraficar = []
    for (let i = 0; i < pasantesGraficar.length; i++) {
        datosGraficar.push([aberturaTamizmmGraficar[i], pasantesGraficar[i]])
    }
    return datosGraficar

}

function inicializarBotonCalcular() {
    const botonCalcular = document.getElementById("boton-calcular")
    botonCalcular.addEventListener("click", () => {
        let tipoCalculo = document.querySelector('input[name="tipo-calculo"]:checked').value
        tipoCalculo = tipoCalculo === 'masa' ? true : false
        const datosEntradaLeidos = leerDatosEntrada(tipoCalculo)
        const resultados = resolverGranulometria(tipoCalculo, ...datosEntradaLeidos)
        const datosGraficar = ordenarResultadosParaGraficar(resultados)
        renderizarResultados(resultados, datosGraficar)
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
const ubicacionMalla200 = 21 // Modificar según la ubicación en la lista de tamices
const ubicacionMalla4 = 9 // Modificar según la ubicación en la lista de tamices
const ubicacionMalla3in = 0 // Modificar según la ubicación en la lista de tamices

renderizarInputsGranulometria()
inicializarBotonCalcular()
