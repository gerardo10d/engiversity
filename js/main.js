// Clases
class CapaPavimento {
  constructor(moduloMpa, m = 1) {
    this.moduloPsi = moduloMpa * 145; // Módulo de elasticidad de la capa en MPa y lo convierte a psi
    this.m = m; // Coeficiente de drenaje
  }

  // Método para resolver una capa de pavimento asfáltico con el método AASHTO-93
  resolverCapa(
    nese,
    zr,
    carreteraGrande,
    capa,
    moduloInfMpa,
    SNcorregidoAnterior = 0
  ) {
    // Método de cálculo del número estrutural (SN) para la capa
    let moduloInfPsi = moduloInfMpa * 145; // Módulo de elasticidad de la capa inferior en MPa y lo convierte a psi
    const tolerancia = 1; // se tolera 1% de error
    let error; // Error porcentual entre la aproximación calculada y la asumida
    let perdidaServ = carreteraGrande ? 1.7 : 2.2; // Pérdida de serviciabilidad del pavimento
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

// Funciones
function inicializarBoton() {
  const boton = document.getElementById("boton-calcular");
  boton.addEventListener("click", () => {
    // Datos de entrada solicitados al usuario---------------------------------------------
    const nese = parseFloat(document.getElementById("nese").value) * 1e6;
    // const n = tpd <= 5000 ? 10 : 15; // Periodo de diseño de 10 años con TPD menor o igual a 5000, o 15 años en caso contrario
    // const n = parseFloat(document.getElementById("n").value);
    const confiabilidad = parseFloat(document.getElementById("R").value); // Confiabilidad del cálculo (r)
    const carreteraGrande =
      document.getElementById("tipoCarretera").value === "grande"; // ¿Es carretera grande o pequeña?
    // Módulos de las capas del pavimento
    const moduloCapa1 = parseFloat(document.getElementById("modulo1").value); //MPa
    const moduloCapa2 = parseFloat(document.getElementById("modulo2").value); //MPa
    const moduloCapa3 = parseFloat(document.getElementById("modulo3").value); //MPa
    const moduloCapa4 = parseFloat(document.getElementById("modulo4").value); //MPa
    // Coeficiente de drenaje para capas 2 y 3
    const m = parseFloat(document.getElementById("m").value);

    // Constantes del método------------------------------------------------------------
    // const fd = 0.5; // Factor direccional
    // const fca = 1.0; // Factor carril (por ahora fijo)
    // const pvp = 31 / 100; // Porcentaje de vehículos pesados (por ahora fijo)
    // const fc = 4.53; // Factor camión (por ahora fijo)

    // Obtener zr según la confiabilidad r
    const zr = desvNormalEstandar.find((el) => el.r === confiabilidad).zr;

    // Cálculos del método-----------------------------------------------------------------
    // Número de ejes simples equivalentes (redondeado a múltiplos de 10000)
    // const nese =
    //   Math.round(
    //     (((tpd * pvp * 365 * fd * fca * (-1 + (1 + r) ** n)) / r) * fc) / 1e4
    //   ) * 1e4;

    // Resultados-----------------------------------------------------------------------
    const capas = [
      new CapaPavimento(moduloCapa1),
      new CapaPavimento(moduloCapa2, m),
      new CapaPavimento(moduloCapa3, m)
    ]

    capas[0].resolverCapa(nese, zr, carreteraGrande, 1, moduloCapa2);
    capas[1].resolverCapa(nese, zr, carreteraGrande, 2, moduloCapa3, capas[0].SNcorregido);
    capas[2].resolverCapa(nese, zr, carreteraGrande, 3, moduloCapa4, capas[1].SNcorregido);

    const contenedorResultados = document.querySelector(".grid-container");
    contenedorResultados.innerHTML = "";
    // Divs con títulos----------------------------------------------------------------------
    const titulos = ["Capa", "SNe", "Espesor (cm)", "SNcorregido"];
    for (const titulo of titulos) {
      const divTitulo = document.createElement("div");
      divTitulo.className = "grid-item titulo-result";
      divTitulo.innerText = titulo;
      contenedorResultados.append(divTitulo);
    }

    // Recorrer array con las capas ya resueltas y mostrar resultados------------------------------------------
    const mensajeError = "Error";
    for (const capa of capas) {
      // Div con el número de la capa--------------------
      const divCapa = document.createElement("div");
      divCapa.className = "grid-item";
      divCapa.innerText = capas.indexOf(capa) + 1;
      contenedorResultados.append(divCapa);

      // Div con el SNe de la capa------------------------
      const divSNe = document.createElement("div");
      divSNe.className = "grid-item";
      divSNe.innerText = (capa.SNe || mensajeError);
      contenedorResultados.append(divSNe);

      // Div con el espesor de la capa--------------------
      const divEspesor = document.createElement("div");
      divEspesor.className = "grid-item";
      divEspesor.innerText = (capa.dCorregidoCm || mensajeError);
      contenedorResultados.append(divEspesor);

      // Div con el SNcorregido de la capa----------------
      const divSNcorregido = document.createElement("div");
      divSNcorregido.className = "grid-item";
      divSNcorregido.innerText = (capa.SNcorregido || mensajeError);
      contenedorResultados.append(divSNcorregido);
    }

    // document.getElementById("resultado").innerText = `Primera capa: SNe: ${capa1.SNe} - Espesor ${capa1.dCorregidoCm} cm - SNcorregido: ${capa1.SNcorregido}\nSegunda capa: SNe: ${capa2.SNe} - Espesor ${capa2.dCorregidoCm} cm - SNcorregido: ${capa2.SNcorregido}\nTercera capa: SNe: ${capa3.SNe} - Espesor ${capa3.dCorregidoCm} cm - SNcorregido: ${capa3.SNcorregido}`;
  });
}

// Inicio del programa
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
const espesoresConstructivosCapas = [
  [5, 7.5, 10, 12.5, 13, 14, 15, 16, 17, 18, 19, 20],
  [15, 20, 25, 30],
  [15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
];
inicializarBoton();
