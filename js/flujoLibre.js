const roundCifras = (num, cifras) => Math.round(num * 10 ** cifras) / 10 ** cifras

function calcular(caudal, cotaSup, cotaInf, longitud, tuberiaPVC) {
    // Primera parte-------------------------------------------------------------------------------------------

    //  Datos de entrada----------------------

    // caudal = 75. // L / s
    // cotaSup = 2015.52  // m
    // cotaInf = 2015.  // m
    // longitud = 250  // m
    // tuberiaPVC = True  // False para concreto

    const pesoEspAgua = 9810.0  // N / m3

    // Cálculos-----------------------------------

    const pendiente = (cotaSup - cotaInf) * 100 / longitud
    let tuberias = null
    let n = null
    let limiteSanitario = null
    // Aquí toca decidir si es de PVC o de concreto y seguir
    if (tuberiaPVC) {  // PVC
        n = 0.009
        tuberias = tuberiasS8.slice()
        limiteSanitario = 170
    } else {  // Concreto
        n = 0.013
        tuberias = tuberiasConc.slice()
        limiteSanitario = 140
    }

    const Dinicialm = 1.548 * (n * caudal / 1000 / (pendiente / 100) ** 0.5) ** 0.375  // Diámetro inicial en m
    const Dinicialmm = roundCifras(Dinicialm * 1000, 1)  // Diámetro inicial en mm

    // Filtrar los diámetros internos que son mayores o iguales a Dinicialmm
    const filtrados = tuberias
        .map(tuberia => tuberia[1])  // Obtener la segunda columna (diámetros)
        .filter(diametro => diametro >= Dinicialmm)  // Filtrar los diámetros mayores o iguales
    // Obtener el menor valor de los filtrados
    const Dinterno = Math.min(...filtrados)

    // Encontrar la fila donde está Dinterno en la matriz de tuberías
    const filaDnominal = tuberias.findIndex(t => t[1] === Dinterno)
    const Dnominal = tuberias[filaDnominal][0]

    // Salidas-------------------------------------------------

    // print('Material: ', 'PVC' if tuberiaPVC else 'Concreto')
    // print(f'Diámetro inicial: {Dinicialmm} mm\nDiámetro interno: {Dinterno} mm\nDiámetro nominal: {Dnominal}')
    // print('Para alcantarillado sanitario', 'sí' if Dinterno > limiteSanitario else 'no', 'cumple D interno')
    // print('Para alcantarillado pluvial/combinado', 'sí' if Dinterno > 260 else 'no', 'cumple D interno')

    // Segunda parte-----------------------------------------------------------------------------------------------------

    // Condiciones a tubo lleno
    const Qo = 0.312 * ((Dinterno / 1000) ** (8 / 3)) * ((pendiente / 100) ** (1 / 2)) / n * 1000  // L / s
    const Ao = np.pi * ((Dinterno / 1000) ** 2) / 4  // m2
    const Vo = Qo / 1000 / Ao  // m / s
    const Ro = Dinterno / 4000  // m
    // print(f'\nCondiciones a tubo lleno:\nQo: {round(Qo, 2)} L/s, '
    //       f'Ao: {round(Ao, 3)} m2, Vo: {round(Vo, 3)} m/s, Ro: {round(Ro, 5)} m')

    // Relaciones hidráulicas
    const QQo = roundCifras(caudal / Qo, 2)
    // Encontrar la columna donde está el Q / Qo en la matriz de relaciones hidráulicas
    const columnaQQo = relHid.findIndex(row => row.includes(QQo))
    const VVo = relHid[1][columnaQQo]
    const dDo = relHid[2][columnaQQo]
    const RRo = relHid[3][columnaQQo]
    // print(f'\nRelaciones hidráulicas:\nQ/Qo: {QQo},  V/Vo: {VVo}, D/Do: {dDo}, R/Ro: {RRo}')
    // print('Para alcantarillado sanitario', 'sí' if dDo <= 0.85 else 'no', 'cumple D/Do')
    // print('Para alcantarillado pluvial/combinado', 'sí' if dDo < 0.93 else 'no', 'cumple D/Do')

    // Condiciones reales
    const V = VVo * Vo  // m / s
    const d = dDo * Dinterno  // mm
    const Rh = RRo * Ro  // m
    // print(f'\nCondiciones reales:\nV: {round(V, 3)} m/s, d: {round(d, 3)} mm, Rh: {round(Rh, 3)}m')
    // print('Para alcantarillado sanitario/pluvial/combinado',
    //       'sí cumple velocidad' if V <= 5.0 else 'no cumple. Disminuir velocidad')

    // Fuerza tractiva
    const ft = pesoEspAgua * Rh * pendiente / 100  // Pa
    // print(f'\nFuerza tractiva: {round(ft, 2)} Pa')
    // print('Para alcantarillado sanitario', 'sí' if ft >= 1.0 else 'no', 'cumple fuerza tractiva')
    // print('Para alcantarillado pluvial/combinado', 'sí' if ft >= 2.0 else 'no', 'cumple fuerza tractiva')

    let texto = 'Material: ' + (tuberiaPVC ? 'PVC' : 'Concreto')
        + '\nDiámetro inicial: ' + Dinicialmm + ' mm'
        + '\nDiámetro interno: ' + Dinterno + ' mm'
        + '\nDiámetro nominal: ' + Dnominal
        + '\nPara alcantarillado sanitario ' + (Dinterno > limiteSanitario ? 'sí' : 'no') + ' cumple D interno'
        + '\nPara alcantarillado pluvial/combinado ' + (Dinterno > 260 ? 'sí' : 'no') + ' cumple D interno'
        + '\n\nCondiciones a tubo lleno:'
        + '\nQo: ' + Qo.toFixed(2) + ' L/s, Ao: ' + Ao.toFixed(3)
        + ' m², Vo: ' + Vo.toFixed(3) + ' m/s, Ro: ' + Ro.toFixed(5) + ' m'
        + '\n\nRelaciones hidráulicas:'
        + '\nQ/Qo: ' + QQo + ', V/Vo: ' + VVo + ', D/Do: ' + dDo + ', R/Ro: ' + RRo
        + '\nPara alcantarillado sanitario ' + (dDo <= 0.85 ? 'sí' : 'no') + ' cumple D/Do'
        + '\nPara alcantarillado pluvial/combinado ' + (dDo < 0.93 ? 'sí' : 'no') + ' cumple D/Do'
        + '\n\nCondiciones reales:\nV: ' + V.toFixed(3) + ' m/s, d: ' + d.toFixed(3) + ' mm, Rh: ' + Rh.toFixed(3) + ' m'
        + '\nPara alcantarillado sanitario/pluvial/combinado '
        + (V <= 5.0 ? 'sí cumple velocidad' : 'no cumple. Disminuir velocidad')
        + '\n\nFuerza tractiva: ' + ft.toFixed(2) + ' Pa'
        + '\nPara alcantarillado sanitario ' + (ft >= 1.0 ? 'sí' : 'no') + ' cumple fuerza tractiva'
        + '\nPara alcantarillado pluvial/combinado ' + (ft >= 2.0 ? 'sí' : 'no') + ' cumple fuerza tractiva';
    return texto
}


const tuberiasS8 = [[110, 99], [160, 145], [200, 182], [250, 227], [315, 284], [355, 327], [400, 362], [450, 407], [500, 452]]

const tuberiasConc = [[6, 152], [8, 203], [10, 254], [12, 305], [15, 381], [18, 457], [24, 610]]

const relHid = [[0.000, 0.010, 0.020, 0.030, 0.040, 0.050, 0.060, 0.070, 0.080, 0.090, 0.100, 0.110, 0.120, 0.130, 0.140, 0.150, 0.160, 0.170, 0.180, 0.190, 0.200, 0.210, 0.220, 0.230, 0.240, 0.250, 0.260, 0.270, 0.280, 0.290, 0.300, 0.310, 0.320, 0.330, 0.340, 0.350, 0.360, 0.370, 0.380, 0.390, 0.400, 0.410, 0.420, 0.430, 0.440, 0.450, 0.460, 0.470, 0.480, 0.490, 0.500, 0.510, 0.520, 0.530, 0.540, 0.550, 0.560, 0.570, 0.580, 0.590, 0.600, 0.610, 0.620, 0.630, 0.640, 0.650, 0.660, 0.670, 0.680, 0.690, 0.700, 0.710, 0.720, 0.730, 0.740, 0.750, 0.760, 0.770, 0.780, 0.790, 0.800, 0.810, 0.820, 0.830, 0.840, 0.850, 0.860, 0.870, 0.880, 0.890, 0.900, 0.910, 0.920, 0.930, 0.940, 0.950, 0.960, 0.970, 0.980, 0.990, 1.000, 1.010, 1.020, 1.030],
[0.000, 0.292, 0.362, 0.400, 0.427, 0.453, 0.473, 0.492, 0.505, 0.520, 0.540, 0.553, 0.570, 0.580, 0.590, 0.600, 0.613, 0.624, 0.634, 0.645, 0.656, 0.664, 0.672, 0.680, 0.687, 0.695, 0.700, 0.706, 0.713, 0.720, 0.729, 0.732, 0.740, 0.750, 0.755, 0.760, 0.768, 0.776, 0.781, 0.787, 0.796, 0.802, 0.806, 0.810, 0.816, 0.822, 0.830, 0.834, 0.840, 0.845, 0.850, 0.855, 0.860, 0.865, 0.870, 0.875, 0.880, 0.885, 0.890, 0.895, 0.900, 0.903, 0.908, 0.913, 0.918, 0.922, 0.927, 0.931, 0.936, 0.941, 0.945, 0.951, 0.955, 0.958, 0.961, 0.965, 0.969, 0.972, 0.975, 0.980, 0.984, 0.987, 0.990, 0.993, 0.997, 1.001, 1.005, 1.007, 1.011, 1.015, 1.018, 1.021, 1.024, 1.027, 1.030, 1.033, 1.036, 1.038, 1.039, 1.040, 1.041, 1.042, 1.042, 1.042],
[0.000, 0.092, 0.124, 0.148, 0.165, 0.182, 0.196, 0.210, 0.220, 0.232, 0.248, 0.258, 0.270, 0.280, 0.289, 0.298, 0.308, 0.315, 0.323, 0.334, 0.346, 0.353, 0.362, 0.370, 0.379, 0.386, 0.393, 0.400, 0.409, 0.417, 0.424, 0.431, 0.439, 0.447, 0.452, 0.460, 0.468, 0.476, 0.482, 0.488, 0.498, 0.504, 0.510, 0.516, 0.523, 0.530, 0.536, 0.542, 0.550, 0.557, 0.563, 0.570, 0.576, 0.582, 0.588, 0.594, 0.601, 0.608, 0.615, 0.620, 0.626, 0.632, 0.639, 0.645, 0.651, 0.658, 0.666, 0.672, 0.678, 0.686, 0.692, 0.699, 0.705, 0.710, 0.719, 0.724, 0.732, 0.738, 0.743, 0.750, 0.756, 0.763, 0.770, 0.778, 0.785, 0.791, 0.798, 0.804, 0.813, 0.820, 0.826, 0.835, 0.843, 0.852, 0.860, 0.868, 0.876, 0.884, 0.892, 0.900, 0.914, 0.920, 0.931, 0.942],
[0.000, 0.239, 0.315, 0.370, 0.410, 0.449, 0.481, 0.510, 0.530, 0.554, 0.586, 0.606, 0.630, 0.650, 0.668, 0.686, 0.704, 0.716, 0.729, 0.748, 0.768, 0.780, 0.795, 0.809, 0.824, 0.836, 0.848, 0.860, 0.874, 0.886, 0.896, 0.907, 0.919, 0.931, 0.938, 0.950, 0.962, 0.974, 0.983, 0.992, 1.007, 1.014, 1.021, 1.028, 1.035, 1.043, 1.050, 1.056, 1.065, 1.073, 1.079, 1.087, 1.094, 1.100, 1.107, 1.113, 1.121, 1.125, 1.129, 1.132, 1.136, 1.139, 1.143, 1.147, 1.151, 1.155, 1.160, 1.163, 1.167, 1.172, 1.175, 1.179, 1.182, 1.184, 1.188, 1.190, 1.193, 1.195, 1.197, 1.200, 1.202, 1.205, 1.208, 1.211, 1.214, 1.216, 1.219, 1.219, 1.215, 1.214, 1.212, 1.210, 1.207, 1.204, 1.202, 1.200, 1.197, 1.195, 1.192, 1.190, 1.172, 1.164, 1.150, 1.136]]
