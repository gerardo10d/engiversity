// FUNCIONES

const roundCifras = (num, cifras) => Math.round(num * 10 ** cifras) / 10 ** cifras


function tablaBloqComp(fin, paso, nBarrash, nBarrasb, b, h, fc, Ec, fy, Es, ABarra, dc, estribos){
    filasTabla = Int(fin / paso)
    M, P, es, fi = np.zeros(filasTabla), np.zeros(filasTabla), np.zeros(filasTabla), np.zeros(filasTabla)
    i = 0
    for c in range(paso, fin + paso, paso):
        P[i], M[i], es[i] = tablaFibras(c, nBarrash, nBarrasb, b, h, fc, Ec, fy, Es, ABarra, dc)
        if estribos:  // Estribos
            if es[i] >= 5e-3:
                fi[i] = 0.9
            elif es[i] <= 2e-3:
                fi[i] = 0.65
            else:
                fi[i] = 0.65 + (es[i] - 2e-3) * 250 / 3
        else:  // Espiral
            if es[i] >= 5e-3:
                fi[i] = 0.9
            elif es[i] <= 2e-3:
                fi[i] = 0.75
            else:
                fi[i] = 0.75 + (es[i] - 2e-3) * 50
        i += 1

    fiMn = fi * M
    fiPn = fi * P
    M = np.append(M, 0)  // Agrega 0 y el último elemento en P para completar con línea horizontal
    P = np.append(P, P[-1])  // Último elemento en P

    // Crear un vector de distancias entre los valores del vector fiPn y 0.75*el último valor de fiPn
    distancias = np.abs(fiPn - 0.75 * fiPn[-1])
    // Encontrar la posición de la menor de esas distancias
    // Los [0][0] al final son para devolver el número de la posición,
    // porque inicialmente es una tupla y luego es un array,
    // entonces se debe extraer dos veces.
    // La función np.where devuelve una tupla
    posMinDif = np.where(min(distancias) == distancias)[0][0]
    // Línea horizontal en 0.75 * fiPn
    hztalFiX = np.array([0., fiMn[posMinDif]])
    hztalFiY = np.array([0.75 * fiPn[-1], 0.75 * fiPn[-1]])

    return M, P, fiMn, fiPn, hztalFiX, hztalFiY
}

function principal(fc, dBarra, ABarra, nBarrasb, nBarrash, estribos, b, h) {
    // Materiales-----------------------

    // Concreto
    // fc = 21  // MPa
    const Ec = 3900 * Math.sqrt(fc)  // MPa  (variar la ecuacion)
    const ec = fc / Ec

    // Acero
    // dBarra = 15.9  // mm diámetro de 5/8"
    // ABarra = 199  // mm2 área de 5/8"
    // nBarrasb = 3  // número de barras en el lado b
    // nBarrash = 4  // número de barras en el lado h
    const fy = 420  // MPa
    const Es = 200e3  // MPa
    const ey = fy / Es
    const esu = 0.1
    // estribos = True  // Estribos (True) o espiral (False)
    const dEstribo = 9.5  // mm siempre es de 3/8" el estribo en cols

    // Sección columna-------------------
    // b = 300  // mm
    // h = 700  // mm
    const recubrimiento = 40  // mm
    let dc = recubrimiento + dEstribo + dBarra / 2  // mm
    dc = 5 * Math.ceil(dc / 5)  // Aplica un redondeo al múltiplo de 5 superior
    const d = h - dc  // mm
    // print(f'd: {d} mm. dc: {dc} ¿Redondear?')

    // Puntos de P-M para verificar en el diagrama----------
    // Mx = np.array([30.0, 0])
    // Py = np.array([822.0, 0])

    // Bloque de compresión
    const paso = 1  // Cada cuántos milímetros se modifica el bloque de compresión
    fin = Int(h)  // Se analiza el bloque hasta el valor de h
    M, P, fiMn, fiPn, hztalFiX, hztalFiY = tablaBloqComp(fin, paso, nBarrash, nBarrasb, b, h, fc, Ec, fy, Es, ABarra, dc, estribos)
    // print(M, P, fiMn, fiPn)
    graficar(M, P, fiMn, fiPn, hztalFiX, hztalFiY, Mx, Py)
}