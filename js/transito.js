// FUNCIONES

const roundCifras = (num, cifras) => Math.round(num * 10 ** cifras) / 10 ** cifras


function leerDatosEntrada() {
    // const vel = document.getElementsByClassName("velocidades")
    // const frec = document.getElementsByClassName("frecuencia-observada")
    // const velocidades = []
    // const frecuencias = []
    // for (let i = 0; i < vel.length; i++) {
    //     velocidades.push(parseFloat(vel[i].value) || 0)
    //     frecuencias.push(parseFloat(frec[i].value) || 0)
    // }

    const velocidades =
        [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80]
    const frecuencias =
        [1, 0, 0, 0, 1, 2, 0, 2, 4, 0, 4, 0, 6, 8, 0, 13, 0, 14, 15, 0, 15, 16, 0, 17, 0, 15, 15, 0, 10, 9, 0, 8, 0, 7, 6, 0, 3, 2, 0, 2, 0, 2, 1, 0, 1, 1]

    const velocidadesRepetidas = [['Velocidad']];

    for (let i = 0; i < velocidades.length; i++) {
        for (let j = 0; j < frecuencias[i]; j++) {
            velocidadesRepetidas.push([velocidades[i]])
        }
    }

    return [velocidades, frecuencias, velocidadesRepetidas]
}

function crearTablaFrecuencias(datos, frecuencias) {
    const n = frecuencias.reduce((acum, elem) => acum + elem, 0)
    const min = Math.min(...datos)
    const max = Math.max(...datos)
    const m = Math.ceil(1 + 3.3 * Math.log10(n)) // número de intervalos
    const intAncho = Math.round((max - min) / m)
    const intNum = Math.ceil((max - min) / intAncho) + 1
    // console.log(n, m, min, max, intAncho, intNum)

    const tablaFrecuencias = [[], [], [], [], [], [], [], [], [], []]

    let datosIndice = 0
    let intMarcaClase = 0
    let frecAcumAbs = 0
    let frecAcumRel = 0
    let marcaClaseCuadrado = 0
    let frecPorMarcaClase = 0
    let frecPorMarcaClaseCuad = 0

    for (let i = 0; i < intNum; i++) {
        intMarcaClase = min + i * intAncho
        tablaFrecuencias[2].push(intMarcaClase)
        const intLimInf = intMarcaClase - intAncho / 2
        tablaFrecuencias[0].push(intLimInf)
        const intLimSup = intMarcaClase + intAncho / 2
        tablaFrecuencias[1].push(intLimSup)
        let frecAbs = 0
        let frecRel = 0

        while (datosIndice < datos.length && datos[datosIndice] < intLimSup) {
            if (datos[datosIndice] >= intLimInf) {
                frecAbs += frecuencias[datosIndice]
                frecRel = roundCifras(frecAbs / n * 100, 2)
            }
            datosIndice++
        }
        frecAcumAbs = frecAcumAbs + frecAbs
        frecAcumRel = roundCifras(frecAcumAbs / n * 100, 2)
        marcaClaseCuadrado = intMarcaClase ** 2
        frecPorMarcaClase = frecAbs * intMarcaClase
        frecPorMarcaClaseCuad = frecAbs * marcaClaseCuadrado

        tablaFrecuencias[3].push(frecAbs)
        tablaFrecuencias[4].push(frecRel)
        tablaFrecuencias[5].push(frecAcumAbs)
        tablaFrecuencias[6].push(frecAcumRel)
        tablaFrecuencias[7].push(marcaClaseCuadrado)
        tablaFrecuencias[8].push(frecPorMarcaClase)
        tablaFrecuencias[9].push(frecPorMarcaClaseCuad)
    }
    const media = roundCifras(tablaFrecuencias[8].reduce((acum, elem) => acum + elem, 0) / n, 1)
    tablaFrecuencias.push(media)
    const desvEstM = roundCifras(Math.sqrt((tablaFrecuencias[9].reduce((acum, elem) => acum + elem, 0) - 1 / n * (tablaFrecuencias[8].reduce((acum, elem) => acum + elem, 0)) ** 2) / (n - 1)), 2)
    tablaFrecuencias.push(desvEstM)
    const errorEst = roundCifras(desvEstM / Math.sqrt(n), 3)
    tablaFrecuencias.push(errorEst)
    return tablaFrecuencias
}

function graficar(valoresX, valoresY, tipo, idElementoDom) {
    const data = valoresX.map((k, i) => ({ x: k, y: valoresY[i] }));
    const ctx = document.getElementById(idElementoDom).getContext("2d");
    const myChart = new Chart(ctx, {
        type: tipo,
        data: {
            datasets: [
                {
                    label: "Frecuencia Relativa",
                    data: data,
                    // backgroundColor: backgroundColor,
                    // borderColor: ,
                    borderWidth: 1,
                    barPercentage: 1,
                    categoryPercentage: 1,
                    borderRadius: 5,
                },
            ],
        },
        options: {
            scales: {
                x: {
                    type: "linear",
                    offset: false,
                    grid: {
                        offset: false,
                    },
                    ticks: {
                        stepSize: 5,// aquí está el ancho de las barras
                    },
                    title: {
                        display: true,
                        text: "Velocidad",
                        font: {
                            size: 14,
                        },
                    },
                },
                y: {
                    // beginAtZero: true,
                    title: {
                        display: true,
                        text: "Velocidad",
                        font: {
                            size: 14,
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            if (!items.length) {
                                return "";
                            }
                            const item = items[0];
                            const x = item.parsed.x;
                            const min = x - 2.5; // Puede significar la mitad de la amplitud
                            const max = x + 2.5; // Puede significar la mitad de la amplitud
                            return `Velocidad: ${min} - ${max}`;
                        },
                    },
                },
            },
        },
    });
}

function gCharts(datos, titulo, idElementoDom) {
    google.charts.load("current", { packages: ["corechart"] })
    google.charts.setOnLoadCallback(drawChart)
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datos)
        var options = {
            title: titulo,
            legend: { position: 'none' },
        }

        var chart = new google.visualization.Histogram(document.getElementById(idElementoDom))
        chart.draw(data, options)
    }
}

function modificarFilasFormVel() {
    const inputFilas = document.getElementById("filas-velocidad")
    inputFilas.addEventListener("input", colocarFilasFormVel)
}

function colocarFilasFormVel() {
    const inputFilas = document.getElementById("filas-velocidad")
    const formVelocidades = document.querySelector(".formulario-velocidades")
    formVelocidades.innerHTML = `
    <span>Velocidades (km/h)</span>
    <span>Frecuencia observada</span>
    ` // Colocar siempre los encabezados del formulario
    const numFilas = parseInt(inputFilas.value) // Obtener el número de filas deseado
    // Crear y agregar filas al formulario
    for (let i = 0; i < numFilas; i++) {
        formVelocidades.innerHTML += `
            <input type="number" name="vel" class="velocidades" min="0" max="250" step="1" />
            <input type="number" name="frec" class="frecuencia-observada" min="0" step="1" />
          `
    }

}

function inicializarBotonCalcular() {
    const boton = document.getElementById("calcular")
    boton.addEventListener("click", () => {
        const [velocidades, frecuencias, velocidadesRepetidas] = leerDatosEntrada()
        // const resultados = crearTablaFrecuencias(velocidades, frecuencias)
        // console.log(resultados)
        // console.log(velocidadesRepetidas)
        gCharts(velocidadesRepetidas,'Velocidades en km/h', "histog-vel")

        // graficar(resultados[2], resultados[4], "bar", "myChart")
    })
}


// EJECUCIÓN DEL PROGRAMA
// const velocidades =
//     [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80]
// const frecuenciaObservada =
//     [1, 0, 0, 0, 1, 2, 0, 2, 4, 0, 4, 0, 6, 8, 0, 13, 0, 14, 15, 0, 15, 16, 0, 17, 0, 15, 15, 0, 10, 9, 0, 8, 0, 7, 6, 0, 3, 2, 0, 2, 0, 2, 1, 0, 1, 1]



// console.log(resultados)
colocarFilasFormVel()
modificarFilasFormVel()
inicializarBotonCalcular()


