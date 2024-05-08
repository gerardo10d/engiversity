// CLASES
class CapaPavimento {
  constructor(moduloMpa, m = 1) {
    this.moduloPsi = moduloMpa * 145; // Módulo de elasticidad de la capa en MPa y lo convierte a psi
    this.m = m; // Coeficiente de drenaje
  }

  // Método para resolver una capa de pavimento asfáltico con el método AASHTO-93
  resolverCapa(
    nese,
    zr,
    perdidaServ,
    capa,
    moduloInfMpa,
    SNcorregidoAnterior = 0
  ) {
    // Método de cálculo del número estrutural (SN) para la capa
    let moduloInfPsi = moduloInfMpa * 145; // Módulo de elasticidad de la capa inferior en MPa y lo convierte a psi
    const tolerancia = 1; // se tolera 1% de error
    let error; // Error porcentual entre la aproximación calculada y la asumida
    let i = 0; // Conteo de iteraciones
    let semillaSN = 4.0; // SN semilla asumido para iniciar la iteración actual
    let calcSN; // SN calculado
    const s0 = 0.45; // Error estándar

    do {
      calcSN =
        -1 +
        10 **
        ((Math.log10(nese) +
          zr * s0 -
          2.32 * Math.log10(moduloInfPsi) +
          8.27 -
          Math.log10(perdidaServ / 2.7) /
          (0.4 + 1094 / (semillaSN + 1) ** 5.19)) /
          9.36);
      error = (Math.abs(calcSN - semillaSN) / calcSN) * 100;
      semillaSN = calcSN;
      i++;
    } while (error > tolerancia); // Las iteraciones terminan cuando el error no sea mayor que la tolerancia

    this.SNe = Math.round(calcSN * 100) / 100; // asigna SNe a calcSN redondeado a dos decimales

    // Calcular el coeficiente estructural de la capa (a)
    let a;
    switch (capa) {
      case 1:
        a = Math.round((0.184 * Math.log(this.moduloPsi) - 1.9547) * 100) / 100;
        break;
      case 2:
        a =
          Math.round((0.249 * Math.log10(this.moduloPsi) - 0.977) * 100) / 100;
        break;
      case 3:
        a =
          Math.round((0.227 * Math.log10(this.moduloPsi) - 0.839) * 100) / 100;
        break;
    }
    // Cálculo del espesor constructivo de la capa de pavimento
    let dCalcPulg = (this.SNe - SNcorregidoAnterior) / (a * this.m); // Espesor calculado en pulgadas
    let dCalcCm = dCalcPulg * 2.54; // Espesor calculado en centímetros
    this.dCorregidoCm = espesoresConstructivosCapas[capa - 1].find(
      (el) => el > dCalcCm
    ); // Espesor con redondeo constructivo en centímetros
    let dCorregidoPulg = Math.round((this.dCorregidoCm / 2.54) * 100) / 100; // Espesor anterior en pulgadas con dos decimales
    this.SNcorregido =
      Math.round((SNcorregidoAnterior + a * this.m * dCorregidoPulg) * 100) /
      100; // SN corregido
  }
}

// FUNCIONES

function leerDatosEntrada() {
  // Leer datos de entrada solicitados al usuario---------------------------------------------
  const nese = parseFloat(document.getElementById("nese").value) * 1e6
  const confiabilidad = parseFloat(document.getElementById("R").value) // Confiabilidad del cálculo (r)
  const perdidaServ = parseFloat(document.getElementById("perdidaServ").value) // Pérdida de serviciabilidad Pi-Pt
  // Módulos de las capas del pavimento
  const moduloCapa1 = parseFloat(document.getElementById("modulo1").value) //MPa
  const moduloCapa2 = parseFloat(document.getElementById("modulo2").value) //MPa
  const moduloCapa3 = parseFloat(document.getElementById("modulo3").value) //MPa
  const moduloCapa4 = parseFloat(document.getElementById("modulo4").value) //MPa
  // Coeficiente de drenaje para capas 2 y 3
  const m2 = parseFloat(document.getElementById("m2").value)
  const m3 = parseFloat(document.getElementById("m3").value)

  // Constantes del método------------------------------------------------------------
  // Obtener zr según la confiabilidad r
  const zr = desvNormalEstandar.find((el) => el.r === confiabilidad).zr

  return [moduloCapa1, moduloCapa2, moduloCapa3, moduloCapa4, m2, m3, nese, zr, perdidaServ, confiabilidad];
}

function crearYresolverCapas(moduloCapa1, moduloCapa2, moduloCapa3, moduloCapa4, m2, m3, nese, zr, perdidaServ) {
  // Crear capas-------------------------------------------------------------------------
  const capas = [
    new CapaPavimento(moduloCapa1),
    new CapaPavimento(moduloCapa2, m2),
    new CapaPavimento(moduloCapa3, m3)
  ]
  // Resolver capas----------------------------------------------------------------------
  capas[0].resolverCapa(nese, zr, perdidaServ, 1, moduloCapa2);
  capas[1].resolverCapa(nese, zr, perdidaServ, 2, moduloCapa3, capas[0].SNcorregido);
  capas[2].resolverCapa(nese, zr, perdidaServ, 3, moduloCapa4, capas[1].SNcorregido);

  return capas;
}

function renderizarResultados(capas) {

  // ------------------------------------------------------------------------------------
  const mensajeError = "Error"
  const spanh1 = document.getElementById("h1")
  spanh1.innerText = capas[0].dCorregidoCm || mensajeError
  const spanh2 = document.getElementById("h2")
  spanh2.innerText = capas[1].dCorregidoCm || mensajeError
  const spanh3 = document.getElementById("h3")
  spanh3.innerText = capas[2].dCorregidoCm || mensajeError

  const spanSNe1 = document.getElementById("SNe1")
  spanSNe1.innerText = capas[0].SNe || mensajeError
  const spanSNe2 = document.getElementById("SNe2")
  spanSNe2.innerText = capas[1].SNe || mensajeError
  const spanSNe3 = document.getElementById("SNe3")
  spanSNe3.innerText = capas[2].SNe || mensajeError

  const spanSNc1 = document.getElementById("SN*1")
  spanSNc1.innerText = capas[0].SNcorregido || mensajeError
  const spanSNc2 = document.getElementById("SN*2")
  spanSNc2.innerText = capas[1].SNcorregido || mensajeError
  const spanSNc3 = document.getElementById("SN*3")
  spanSNc3.innerText = capas[2].SNcorregido || mensajeError
  // ------------------------------------------------------------------------------------

}

function guardarResultadosEnStorage(moduloCapa1, moduloCapa2, moduloCapa3, moduloCapa4, m2, m3, nese, zr, perdidaServ, confiabilidad) {
  // Guardar en storage los datos de entrada y los resultados
  const datosEntrada = {
    nese: nese,
    confiabilidad: confiabilidad,
    zr: zr,
    perdidaServ: perdidaServ,
    m2: m2,
    m3: m3,
    moduloCapa1: moduloCapa1,
    moduloCapa2: moduloCapa2,
    moduloCapa3: moduloCapa3,
    moduloCapa4: moduloCapa4
  }
  localStorage.setItem("datosEntrada", JSON.stringify(datosEntrada));
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
  const boton = document.getElementById("boton-calcular")
  boton.addEventListener("click", () => {
    // Lee los datos de entrada con la función y los guarda en un array
    const datosEntradaLeidos = leerDatosEntrada()
    // Obtiene las capas resueltas a partir de los datos leídos y las guarda en un array
    const capas = crearYresolverCapas(...datosEntradaLeidos)
    // el operador ... (spread) entrega los datos por separado del array de datos leídos
    renderizarResultados(capas)
    if (isNaN(capas[2].SNcorregido)) {
      mostrarNotificacion("Ocurrió un error", "#FF4D4D")
    } else {
      guardarResultadosEnStorage(...datosEntradaLeidos)
      mostrarNotificacion("Cálculo exitoso", "#4CAF50")
    }
  });
}

function inicializarBotonRecuperar() {
  const botonRecuperar = document.getElementById("boton-recuperar");
  botonRecuperar.addEventListener("click", () => {
    const datosEntrada = JSON.parse(localStorage.getItem("datosEntrada"));
    document.getElementById("nese").value = datosEntrada.nese / 1e6 || "";
    document.getElementById("R").value = datosEntrada.confiabilidad || "";
    document.getElementById("perdidaServ").value = datosEntrada.perdidaServ || "";
    document.getElementById("m2").value = datosEntrada.m2 || "";
    document.getElementById("m3").value = datosEntrada.m3 || "";
    document.getElementById("modulo1").value = datosEntrada.moduloCapa1 || "";
    document.getElementById("modulo2").value = datosEntrada.moduloCapa2 || "";
    document.getElementById("modulo3").value = datosEntrada.moduloCapa3 || "";
    document.getElementById("modulo4").value = datosEntrada.moduloCapa4 || "";

  });
}

function obtenerEspesores() {

  return new Promise((resolve, reject) => {

    fetch('../espesoresCapas.json').then((response) => {
      return response.json();
    }).then((responseJson) => {
      espesoresConstructivosCapas = responseJson;
      resolve();
    });
  });

}
// INICIO DEL PROGRAMA------------------------------------
const desvNormalEstandar = [
  { r: 50.0, zr: 0.0 },
  { r: 60.0, zr: 0.253 },
  { r: 70.0, zr: 0.524 },
  { r: 75.0, zr: 0.674 },
  { r: 80.0, zr: 0.841 },
  { r: 85.0, zr: 1.037 },
  { r: 90.0, zr: 1.282 },
  { r: 95.0, zr: 1.645 },
  { r: 98.0, zr: 2.054 },
  { r: 99.0, zr: 2.327 },
  { r: 99.9, zr: 3.09 },
  { r: 99.99, zr: 3.75 },
];
let espesoresConstructivosCapas = [];
obtenerEspesores().then(() => {
  inicializarBotonCalcular();
})
inicializarBotonRecuperar();