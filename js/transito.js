// FUNCIONES

const roundCifras = (num, cifras) => Math.round(num * 10 ** cifras) / 10 ** cifras


function leerDatosEntrada() {
    const vel = document.getElementsByClassName("velocidades")
    const frec = document.getElementsByClassName("frecuencia-observada")
    const velocidades = []
    const frecuencias = []
    for (let i = 0; i < vel.length; i++) {
        velocidades.push(parseFloat(vel[i].value) || 0)
        frecuencias.push(parseFloat(frec[i].value) || 0)
    }

    const confiabilidad = parseFloat(document.getElementById("R").value)
    const errorPermitido = parseFloat(document.getElementById("error-permitido").value)

    // Datos de prueba
    // const velocidades =
    //     [30, 35, 36, 42, 45, 48, 50, 52, 62, 63, 65, 68, 70, 72, 85, 89]
    // const frecuencias =
    //     [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2]

    // const velocidades = [20, 25, 30, 35, 36, 37, 42, 45, 50, 55, 61, 66, 69, 71, 75, 77, 78, 80, 82, 85]
    // const frecuencias = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

    // const confiabilidad = 95.0
    // const errorPermitido = 2.0


    // // Datos de prueba
    // const velocidades =
    //     [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80]
    // const frecuencias =
    //     [1, 0, 0, 0, 1, 2, 0, 2, 4, 0, 4, 0, 6, 8, 0, 13, 0, 14, 15, 0, 15, 16, 0, 17, 0, 15, 15, 0, 10, 9, 0, 8, 0, 7, 6, 0, 3, 2, 0, 2, 0, 2, 1, 0, 1, 1]


    // // Datos de prueba
    // const velocidades =
    //     [30, 35, 36, 42, 45, 48, 50, 52, 62, 63, 65, 68, 70, 72, 85, 89]
    // const frecuencias =
    //     [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2]

    // // Datos de prueba
    // const velocidades =
    //     [25, 27, 35, 36, 39, 40, 42, 55, 60, 63, 65, 68, 70, 73, 75, 80, 85]
    // const frecuencias =
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1]

    const velocidadesRepetidas = [['Velocidad']];

    for (let i = 0; i < velocidades.length; i++) {
        for (let j = 0; j < frecuencias[i]; j++) {
            velocidadesRepetidas.push([velocidades[i]])
        }
    }


    return [velocidades, frecuencias, velocidadesRepetidas, confiabilidad, errorPermitido]
}

function definirNumeroIntervalos(n) {
    let m
    if (n >= 50 && n < 1e2) {
        m = 8
    } else if (n >= 1e2 && n < 1e3) {
        m = 10
    } else if (n >= 1e3 && n < 1e4) {
        m = 14
    } else if (n >= 1e4 && n < 1e5) {
        m = 17
    } else {
        m = Math.round(1 + 3.3 * Math.log10(n))
    }
    return m
}

function crearTablaFrecuencias(datos, frecuencias, confiabilidad, errorPermitido) {
    const n = frecuencias.reduce((acum, elem) => acum + elem, 0) // Tamaño de la muestra
    const min = Math.min(...datos) // Velocidad menor
    const max = Math.max(...datos) // Velocidad mayor
    const frecMax = frecuencias[datos.indexOf(max)] // Encontrar la frecuencia del dato mayor para aumentarla en el último intervalo, ya que no lo considera en el conteo normal por contar los datos menores al límite superior del intervalo, entonces el máximo valor queda por fuera del conteo
    const m = definirNumeroIntervalos(n)
    const intAncho = Math.round((max - min) / m) // Ancho del intervalo

    // console.log("Tamaño de la muestra: ", n, "Núm. intervalos: ", m, "Mínimo: ", min, "Máximo: ", max, "Ancho del intervalo: ", intAncho)
    // console.log(datos)
    // console.log(frecuencias)

    const tablaFrecuencias = [[], [], [], [], [], [], [], [], [], []]

    let datosIndice = 0
    let intMarcaClase = 0
    let frecAcumAbs = 0
    let frecAcumRel = 0
    let marcaClaseCuadrado = 0
    let frecPorMarcaClase = 0
    let frecPorMarcaClaseCuad = 0

    for (let i = 1; i <= m; i++) {
        const intLimInf = min + (i - 1) * intAncho
        tablaFrecuencias[0].push(intLimInf)
        const intLimSup = intLimInf + intAncho
        tablaFrecuencias[1].push(intLimSup)
        intMarcaClase = (intLimInf + intLimSup) / 2
        tablaFrecuencias[2].push(intMarcaClase)
        let frecAbs = 0
        let frecRel = 0

        while (datosIndice < datos.length && datos[datosIndice] < intLimSup) {
            if (datos[datosIndice] >= intLimInf) {
                frecAbs += frecuencias[datosIndice]
                frecRel = roundCifras(frecAbs / n * 100, 2)
            }
            datosIndice++
        }

        if (i == m && max == intLimSup) {
            frecAbs += frecMax // hay que agregar la frecuencia del dato mayor, porque en el while anterior no la considera
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

    const media = roundCifras(tablaFrecuencias[8].reduce((acum, elem) => acum + elem, 0) / n, 2)
    tablaFrecuencias.push(media)
    const desvEstM = roundCifras(Math.sqrt((tablaFrecuencias[9].reduce((acum, elem) => acum + elem, 0) - 1 / n * (tablaFrecuencias[8].reduce((acum, elem) => acum + elem, 0)) ** 2) / (n - 1)), 2)
    tablaFrecuencias.push(desvEstM)
    const errorEst = roundCifras(desvEstM / Math.sqrt(n), 2)
    tablaFrecuencias.push(errorEst)
    const K = constanteKconfiabilidad.find((el) => el.R === confiabilidad).K
    const tamanoMinMuestra = roundCifras((K * desvEstM / errorPermitido) ** 2, 0)
    tablaFrecuencias.push(tamanoMinMuestra)
    // console.log(tablaFrecuencias)
    return tablaFrecuencias
}


function gChartsHist(datos, titulo, idElementoDom) {
    google.charts.load("current", { packages: ["corechart"] })
    google.charts.setOnLoadCallback(drawChart)
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datos)
        var options = {
            title: titulo,
            legend: { position: 'none' },
            histogram: {
                hideBucketItems: true,
                // bucketSize: 5,
                numBucketsRule: 'sturges',
            },
            // isStacked: 'relative',
            hAxis: {
                title: 'Velocidades (km/h)',
            },
            vAxis: {
                title: 'Frecuencia observada',
            },
            chartArea: {
                width: '70%',
                height: '70%'
            }
        }

        var chart = new google.visualization.Histogram(document.getElementById(idElementoDom))
        chart.draw(data, options)
    }
}

function gChartsLinea(x, y, titulo, idElementoDom) {
    const datos = [['Velocidades (km/h)', 'Frec. ac. rel.']]
    for (let i = 0; i < x.length; i++) {
        datos.push([x[i], y[i]])
    }

    google.charts.load("current", { packages: ["corechart"] })
    google.charts.setOnLoadCallback(drawChart)
    function drawChart() {
        var data = google.visualization.arrayToDataTable(datos)
        var options = {
            title: titulo,
            curveType: 'function',
            legend: { position: 'none' },
            hAxis: {
                title: 'Velocidades (km/h)',

            },
            vAxis: {
                title: 'Frecuencia acumulada relativa (%)',
                gridlines: {
                    count: 25,
                },
            },
            chartArea: {
                width: '70%',
                height: '70%'
            }
        }

        var chart = new google.visualization.LineChart(document.getElementById(idElementoDom))
        chart.draw(data, options)
    }
}

function modificarFilasFormVel() {
    // Función para que al cambiar el input de la cantidad de filas efectivamente se agreguen
    const inputFilas = document.getElementById("filas-velocidad")
    inputFilas.addEventListener("input", colocarFilasFormVel)
}

function colocarFilasFormVel() {
    const formVelocidades = document.querySelector(".formulario-velocidades")
    formVelocidades.innerHTML = `
    <div style="min-width: 11rem;">
        <span>Velocidades:</span>
        <span>Frecuencia observada:</span>
    </div>
    ` // Colocar siempre los encabezados del formulario
    const numFilas = parseInt(document.getElementById("filas-velocidad").value) // Obtener el número de filas deseado
    // Crear y agregar filas al formulario
    for (let i = 0; i < numFilas; i++) {
        formVelocidades.innerHTML += `
        <div>
            <input type="number" name="vel" class="velocidades" min="0" max="250" step="1" />
            <input type="number" name="frec" class="frecuencia-observada" min="0" step="1" />
        </div>
          `
    }

}

function renderizarResultados(datosGraficar, resultados) {
    const seccionResultados = document.querySelector(".resultados")
    seccionResultados.innerHTML = ""
    const h2Resultados = document.createElement("h2")
    h2Resultados.innerText = "Resultados"
    seccionResultados.append(h2Resultados)
    const contenedorResultados = document.createElement("div")
    contenedorResultados.className = "valores-representativos"
    seccionResultados.append(contenedorResultados)

    contenedorResultados.innerHTML = ""
    // Colocar divs con títulos----------------------------------------------------------------------
    const titulos = ['Velocidad media de punto:', 'Desviación estándar:', 'Error estándar de la media:', 'Tamaño apropiado de la muestra:']

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

    const contenedorHistograma = document.createElement("div")
    contenedorHistograma.id = "histog-vel"
    contenedorHistograma.className = "grafica"
    seccionResultados.append(contenedorHistograma)

    const contenedorCurva = document.createElement("div")
    contenedorCurva.id = "ojiva"
    contenedorCurva.className = "grafica"
    seccionResultados.append(contenedorCurva)

    gChartsHist(datosGraficar[0], 'Velocidades en km/h', "histog-vel")
    gChartsLinea(datosGraficar[1], datosGraficar[2], 'Ojiva Porcentual', "ojiva")
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
    const boton = document.getElementById("calcular")
    boton.addEventListener("click", () => {
        const [velocidades, frecuencias, velocidadesRepetidas, confiabilidad, errorPermitido] = leerDatosEntrada()
        const resultados = crearTablaFrecuencias(velocidades, frecuencias, confiabilidad, errorPermitido)

        if (isNaN(resultados[10]) || isNaN(resultados[11]) || isNaN(resultados[12]) || isNaN(resultados[13])) {
            mostrarNotificacion("Ocurrió un error", "#FF4D4D")
            renderizarResultados([velocidadesRepetidas, resultados[1], resultados[6]], [resultados[10], resultados[11], resultados[12], resultados[13]], null)
        }
        else {
            mostrarNotificacion("Cálculo exitoso", "#4CAF50")
            renderizarResultados([velocidadesRepetidas, resultados[1], resultados[6]], [resultados[10], resultados[11], resultados[12], resultados[13]], null)

        }
    })
}


const constanteKconfiabilidad = [
    { R: 68.3, K: 1.00 },
    { R: 89.6, K: 1.50 },
    { R: 90.0, K: 1.64 },
    { R: 95.0, K: 1.96 },
    { R: 95.5, K: 2.00 },
    { R: 98.8, K: 2.50 },
    { R: 99.0, K: 2.58 },
    { R: 99.7, K: 3.00 },
];

colocarFilasFormVel()
modificarFilasFormVel()
inicializarBotonCalcular()