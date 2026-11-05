export type IndustrySeed = {
  code: string;
  name: string;
  lexicon: string[]; // palabras que la audiencia usa de verdad
  tensions: string[]; // conflictos típicos que generan atención
  taboos: string[]; // lo que suena falso, prohibido o riesgoso
};

export const INDUSTRIES: IndustrySeed[] = [
  {
    code: "rrhh",
    name: "Recursos Humanos",
    lexicon: ["rotación", "clima", "evaluación de desempeño", "renuncia", "jefe", "nómina", "onboarding", "entrevista", "salario emocional"],
    tensions: ["la gente no renuncia a la empresa, renuncia al jefe", "RR. HH. como policía vs. socio del negocio", "encuestas de clima que nadie cree", "bienestar de fachada", "promover al mejor técnico como jefe"],
    taboos: ["'capital humano' como muletilla", "'somos una familia'", "datos de rotación inventados"],
  },
  {
    code: "tecnologia",
    name: "Tecnología",
    lexicon: ["deploy", "MVP", "deuda técnica", "IA", "producto", "bug", "sprint", "stack"],
    tensions: ["la IA no te reemplaza, te reemplaza quien la usa (cliché: evitar)", "proyectos que nadie usa", "construir antes de validar", "reuniones que bloquean al equipo"],
    taboos: ["'disruptivo'", "'transformación digital' vacío", "promesas de productividad sin dato"],
  },
  {
    code: "finanzas",
    name: "Finanzas",
    lexicon: ["flujo de caja", "deuda", "tarjeta de crédito", "ahorro", "inversión", "margen", "cuota", "prima"],
    tensions: ["facturar mucho y no tener caja", "gastos hormiga", "invertir sin entender", "rentabilidad vs. crecimiento"],
    taboos: ["rendimientos garantizados", "consejos de inversión personalizados", "'hazte rico'"],
  },
  {
    code: "marketing",
    name: "Marketing",
    lexicon: ["alcance", "leads", "embudo", "contenido", "pauta", "CPA", "conversión", "marca"],
    tensions: ["likes que no pagan facturas", "contenido para el algoritmo vs. para el cliente", "pautar sin oferta clara", "copiar al competidor"],
    taboos: ["'el contenido es el rey'", "'engagement' como fin", "métricas de vanidad presentadas como éxito"],
  },
  {
    code: "ventas",
    name: "Ventas",
    lexicon: ["cierre", "objeción", "pipeline", "seguimiento", "propuesta", "descuento", "prospecto", "cuota"],
    tensions: ["el cliente dice 'lo pienso' y desaparece", "descuento como única táctica", "vender características y no problemas", "perseguir vs. atraer"],
    taboos: ["técnicas de presión", "'cierra en 3 pasos'", "manipulación"],
  },
  {
    code: "psicologia",
    name: "Psicología",
    lexicon: ["ansiedad", "culpa", "límites", "apego", "autoestima", "terapia", "patrón", "vínculo"],
    tensions: ["decir que sí cuando quieres decir que no", "la culpa de descansar", "repetir la historia de los padres", "funcionar bien por fuera y estar agotada por dentro"],
    taboos: ["diagnósticos por internet", "prometer curas", "romantizar el sufrimiento"],
  },
  {
    code: "bienestar",
    name: "Bienestar",
    lexicon: ["descanso", "energía", "rutina", "hábitos", "cansancio", "estrés", "pausa"],
    tensions: ["autocuidado como otra tarea más en la lista", "descansar con culpa", "rutinas imposibles de influencer"],
    taboos: ["positivismo tóxico", "'solo depende de ti'", "promesas médicas"],
  },
  {
    code: "salud",
    name: "Salud",
    lexicon: ["consulta", "síntoma", "chequeo", "EPS", "prevención", "tratamiento"],
    tensions: ["ir al médico solo cuando ya es tarde", "información contradictoria en redes", "el paciente que no sigue el tratamiento"],
    taboos: ["consejos médicos sin profesional", "cifras de salud sin fuente", "miedo como gancho"],
  },
  {
    code: "educacion",
    name: "Educación",
    lexicon: ["clase", "estudiante", "profesor", "título", "curso", "aprendizaje", "nota"],
    tensions: ["títulos vs. habilidades", "aprender de memoria vs. entender", "cursos que nadie termina"],
    taboos: ["'la universidad no sirve'", "promesas de empleo garantizado"],
  },
  {
    code: "emprendimiento",
    name: "Emprendimiento",
    lexicon: ["socio", "cliente", "caja", "idea", "validar", "facturar", "renunciar", "negocio"],
    tensions: ["renunciar al empleo para emprender", "trabajar más que cuando eras empleado", "el socio que no aporta", "vender antes de construir"],
    taboos: ["'sé tu propio jefe' romántico", "ingresos pasivos fáciles", "historias de éxito sin contexto"],
  },
  {
    code: "consultoria",
    name: "Consultoría",
    lexicon: ["diagnóstico", "propuesta", "honorarios", "entregable", "cliente", "proyecto", "junta directiva"],
    tensions: ["vender horas vs. resultados", "el informe que nadie lee", "el cliente que pide solución sin aceptar el diagnóstico", "competir por precio"],
    taboos: ["'soluciones integrales'", "'acompañamiento' vacío", "jerga de PowerPoint"],
  },
  {
    code: "servicios_profesionales",
    name: "Servicios profesionales",
    lexicon: ["cliente", "cotización", "tarifa", "referido", "agenda", "proyecto"],
    tensions: ["cobrar poco por miedo a perder clientes", "el cliente que pide rebaja", "trabajar por referidos sin sistema"],
    taboos: ["'calidad y compromiso'", "'excelencia' como argumento"],
  },
  {
    code: "derecho",
    name: "Derecho",
    lexicon: ["contrato", "demanda", "abogado", "cláusula", "firma", "proceso", "liquidación"],
    tensions: ["firmar sin leer", "llamar al abogado cuando ya hay problema", "el contrato copiado de internet"],
    taboos: ["asesoría legal específica sin caso", "interpretaciones categóricas sin norma", "miedo legal exagerado"],
  },
  {
    code: "real_estate",
    name: "Real Estate",
    lexicon: ["arriendo", "cuota inicial", "crédito hipotecario", "valorización", "metro cuadrado", "inmueble"],
    tensions: ["arrendar vs. comprar", "comprar sobre planos", "la 'inversión segura' que no lo es"],
    taboos: ["valorización garantizada", "urgencia falsa ('últimas unidades')"],
  },
  {
    code: "retail",
    name: "Retail",
    lexicon: ["tienda", "vitrina", "inventario", "cliente", "descuento", "rotación de producto", "caja"],
    tensions: ["el cliente que mira y compra en línea", "descuentos que destruyen margen", "inventario quieto"],
    taboos: ["'calidad al mejor precio'"],
  },
  {
    code: "gastronomia",
    name: "Gastronomía",
    lexicon: ["carta", "plato", "cocina", "domicilio", "mesa", "receta", "costo del plato"],
    tensions: ["restaurante lleno y sin utilidad", "las apps de domicilio que se comen el margen", "la receta de la abuela vs. el negocio"],
    taboos: ["'sabor único'", "'hecho con amor' genérico"],
  },
  {
    code: "industria",
    name: "Industria / manufactura",
    lexicon: ["planta", "operario", "turno", "producción", "calidad", "seguridad industrial", "mantenimiento"],
    tensions: ["producir más vs. accidentes", "el mantenimiento que se aplaza", "la experiencia del operario que nadie documenta"],
    taboos: ["'industria 4.0' vacío", "cifras de productividad sin fuente"],
  },
  {
    code: "turismo",
    name: "Turismo",
    lexicon: ["viaje", "destino", "temporada", "reserva", "hotel", "plan", "vacaciones"],
    tensions: ["viajar para la foto vs. para vivirlo", "temporada alta y precios", "destinos saturados"],
    taboos: ["'paraíso escondido'", "precios engañosos"],
  },
  {
    code: "maternidad",
    name: "Maternidad",
    lexicon: ["hijos", "crianza", "culpa", "pareja", "colegio", "tareas", "tiempo", "rutina"],
    tensions: ["la madre que trabaja y siente que no llega a todo", "la carga mental invisible", "tiempo de calidad vs. cantidad", "comparación con otras mamás"],
    taboos: ["juzgar a las madres", "'la madre perfecta'", "prometer hijos felices con un truco"],
  },
  {
    code: "marca_personal",
    name: "Marca personal",
    lexicon: ["LinkedIn", "perfil", "publicación", "seguidores", "autoridad", "clientes", "posicionamiento"],
    tensions: ["seguidores que no compran", "publicar por publicar", "miedo a exponerse", "parecer vendedor"],
    taboos: ["'construye tu marca personal' genérico", "métricas de vanidad", "'sé auténtico' sin más"],
  },
];
