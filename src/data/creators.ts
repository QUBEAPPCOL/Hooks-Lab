// Base de conocimiento inicial (Fase 1). Solo datos con fuente. Ver docs/01 y docs/03.
type CreatorSeed = {
  slug: string;
  name: string;
  handle: string;
  country: string;
  platforms: string[];
  category: string;
  style: string;
  mechanismsObserved: string[];
  notes: string;
  showName: boolean;
  status: "perfil" | "propuesto" | "analizado";
  confidence: "alta" | "media" | "baja";
  sources: { label: string; url: string }[];
};

export const CREATORS: CreatorSeed[] = [
  { slug: "beth-cast", name: "Beth Cast", handle: "@bethcast", country: "MX", platforms: ["TikTok", "Instagram", "YouTube"], category: "Entretenimiento / datos curiosos",
    style: "Datos curiosos y sketches de humor.", mechanismsObserved: [], notes: "Hipótesis: curiosidad + especificidad (dato inesperado). Pendiente: transcribir 10 videos.",
    showName: true, status: "perfil", confidence: "media", sources: [{ label: "ClickAnalytic", url: "https://www.clickanalytic.com/es/who-is-beth-cast/" }] },
  { slug: "el-borrego", name: "El Borrego (La Granja del Borrego)", handle: "@lagranjadelborrego", country: "CO", platforms: ["TikTok", "YouTube", "Instagram", "X"], category: "Humor rural / conocimiento",
    style: "Vida rural y sketches; TikTok Awards 2023 a mejor creador de conocimiento.", mechanismsObserved: [], notes: "Hipótesis: dato del campo + humor cotidiano. Pendiente: transcripciones.",
    showName: true, status: "perfil", confidence: "alta", sources: [{ label: "Forbes Colombia 2025", url: "https://forbes.co/2025/12/10/editors-picks/top-creators-2025-carlos-diaz-la-granja-del-borrego/" }] },
  { slug: "chabe", name: "Chabe (Isabela Rivera)", handle: "@isabelariverav", country: "CO", platforms: ["TikTok", "Instagram"], category: "Humor cotidiano / pareja",
    style: "Historias personales, humor de pareja, colaboraciones de marca.", mechanismsObserved: [], notes: "Hipótesis: identificación cotidiana. Referente para Serena. Pendiente: transcripciones.",
    showName: true, status: "perfil", confidence: "media", sources: [{ label: "Instagram", url: "https://www.instagram.com/isabelariverav/" }, { label: "Infobae 2025", url: "https://www.infobae.com/colombia/2025/02/26/asi-fue-como-influencer-bogotana-evito-que-ladron-le-rompiera-los-vidrios-del-carro-en-un-cambio-de-semaforo-el-debia-tener-miedo-de-mi/" }] },
  { slug: "juan-felipe-londono", name: "Juan Felipe Londoño", handle: "@jf.lv", country: "CO", platforms: ["TikTok"], category: "Humor de pareja",
    style: "Humor de pareja y cotidianidad (contenido cruzado con Chabe).", mechanismsObserved: [], notes: "Pendiente: transcripciones.",
    showName: true, status: "perfil", confidence: "media", sources: [{ label: "TikTok", url: "https://www.tiktok.com/@jf.lv" }] },
  { slug: "juanda", name: "JuanDa (Juan David Morales)", handle: "", country: "CO", platforms: ["TikTok", "Instagram", "YouTube"], category: "Humor costumbrista",
    style: "Humor de clase media bogotana.", mechanismsObserved: [], notes: "Confirmado por el usuario: Juan David Morales (no Juanda Caribe). Pendiente: transcripciones.",
    showName: true, status: "perfil", confidence: "media", sources: [{ label: "Publimetro 2022", url: "https://www.publimetro.co/entretenimiento/2022/10/26/quien-es-juanda-el-influencer-que-reaparecio-en-redes-despues-de-varios-meses-de-ausencia/" }] },
  { slug: "ami-rodriguez", name: "Ami Rodríguez", handle: "", country: "CO", platforms: ["YouTube", "TikTok"], category: "Humor / sketches",
    style: "Sketches de humor familiar; primer Botón de Diamante de YouTube en Colombia.", mechanismsObserved: [], notes: "Tiene Shorts en YouTube (vía API oficial en Fase 4).",
    showName: true, status: "perfil", confidence: "alta", sources: [{ label: "Las2orillas", url: "https://www.las2orillas.co/ami-rodriguez-el-youtuber-que-con-sus-mas-de-60-millones-de-seguidores-supera-a-shakira/" }] },
  { slug: "aida-victoria-merlano", name: "Aida Victoria Merlano", handle: "", country: "CO", platforms: ["Instagram", "TikTok"], category: "Entretenimiento",
    style: "Entretenimiento y opinión.", mechanismsObserved: [], notes: "Riesgo reputacional: se usan solo sus mecanismos, sin mostrar el nombre en la generación.",
    showName: false, status: "perfil", confidence: "baja", sources: [] },
  { slug: "felipe-saruma", name: "Felipe Saruma", handle: "@sarumaoficial", country: "CO", platforms: ["TikTok", "Instagram", "YouTube"], category: "Comedia / parodia",
    style: "Comedia y parodia; ganó 'Fav de la Comedia' en los TikTok Awards.", mechanismsObserved: [], notes: "Pendiente: transcripciones.",
    showName: true, status: "perfil", confidence: "media", sources: [{ label: "colombia.com", url: "https://www.colombia.com/entretenimiento/entretenimiento-y-farandula/felipe-saruma-influencer-colombiano-ganador-tiktok-awards-335514" }] },
  { slug: "carlos-munoz", name: "Carlos 'Máster' Muñoz", handle: "@mastermunozoficial", country: "MX", platforms: ["TikTok", "YouTube"], category: "Emprendimiento",
    style: "Emprendimiento y 'mentalidad'.", mechanismsObserved: [], notes: "Riesgo reputacional (polémica pública): solo mecanismos, sin nombre en la generación.",
    showName: false, status: "perfil", confidence: "media", sources: [{ label: "UnoTV", url: "https://www.unotv.com/virales/quien-es-carlos-munoz-coach-que-humillo-a-mesero/" }] },
  { slug: "vilma-nunez", name: "Vilma Núñez", handle: "vilmanunezvillanueva", country: "ES/RD", platforms: ["LinkedIn", "Instagram", "YouTube"], category: "Marketing",
    style: "Marketing y marca personal; mezcla escenas narrativas con anuncios.", mechanismsObserved: ["storytelling", "especificidad", "confesion"], notes: "Tiene hooks fuertes (fecha + escena) y débiles ('Hoy quiero compartirles').",
    showName: true, status: "analizado", confidence: "media", sources: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/vilmanunezvillanueva/en" }] },
  { slug: "euge-oller", name: "Euge Oller", handle: "@TechEuge", country: "ES", platforms: ["X", "YouTube", "Instagram"], category: "Negocios online",
    style: "Paradojas, experimentos con restricción y aforismos cortos.", mechanismsObserved: ["contradiccion", "curiosidad", "especificidad", "aspiracion"], notes: "Cinco hooks observados en X (2024–2025).",
    showName: true, status: "analizado", confidence: "media", sources: [{ label: "X", url: "https://x.com/TechEuge" }] },
  { slug: "isra-bravo", name: "Isra Bravo", handle: "@motivante_isra", country: "ES", platforms: ["Email", "X", "Libros"], category: "Copywriting",
    style: "Email diario de unas 300 palabras; descarado, sencillo, directo; storytelling.", mechanismsObserved: ["controversia", "contradiccion"], notes: "Advertencia: imitar su estilo sin ser tu voz se percibe falso (observación de terceros en X).",
    showName: true, status: "analizado", confidence: "alta", sources: [{ label: "Que.es", url: "https://www.que.es/2022/02/16/ruina-riqueza-entrevista-isra-bravo-copywriter/" }, { label: "X", url: "https://twitter.com/motivante_isra/status/1232615673995632641" }] },
  { slug: "joan-boluda", name: "Joan Boluda", handle: "joanboluda", country: "ES", platforms: ["Podcast", "LinkedIn", "YouTube"], category: "Marketing online",
    style: "Didáctico; en LinkedIn publica sobre todo anuncios de cursos (hooks débiles).", mechanismsObserved: [], notes: "Poco útil para hooks escritos; revisar el podcast en Fase 4.",
    showName: true, status: "perfil", confidence: "media", sources: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/joanboluda/" }] },
  { slug: "jurgen-klaric", name: "Jürgen Klarić", handle: "jurgenklaric-neurociencias", country: "BO/MX", platforms: ["LinkedIn", "YouTube", "Instagram"], category: "Ventas",
    style: "Casos contados a mitad de camino, apodos cortados, franqueza oral.", mechanismsObserved: ["intriga", "storytelling", "curiosidad"], notes: "Advertencia: varias de sus afirmaciones 'neuro' son discutidas; se usa solo la estructura.",
    showName: true, status: "analizado", confidence: "media", sources: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/jurgenklaric-neurociencias/" }] },
];

export const OBSERVED_HOOKS: {
  creator: string; platform: string; publishedAt: string; text: string; url: string;
  mechanisms: string[]; structureCode?: string; construction: string; isCounterExample?: boolean;
}[] = [
  { creator: "euge-oller", platform: "X", publishedAt: "2025-05-27", url: "https://x.com/TechEuge/status/1927436143437775315",
    text: "¿Quieres saber por qué hay millonarios que no impresionan a nadie… y hippies sin un duro que lideran multitudes? El estatus no es lo que tú crees. Y jugarlo mal te puede arruinar la vida.",
    mechanisms: ["contradiccion", "curiosidad", "miedo_perder"], structureCode: "CON-07", construction: "Dos extremos que rompen la regla → corrección de creencia → consecuencia personal." },
  { creator: "euge-oller", platform: "X", publishedAt: "2025-05-16", url: "https://x.com/TechEuge/status/1923338117018239061",
    text: "Los mejores pensadores no repiten eslóganes. Pueden defender la idea opuesta mejor que sus rivales. Y luego desmontarla.",
    mechanisms: ["aspiracion", "contradiccion"], structureCode: "CON-06", construction: "Define a un grupo admirado por lo que no hace y luego por una conducta concreta." },
  { creator: "euge-oller", platform: "X", publishedAt: "2024-07-22", url: "https://x.com/TechEuge/status/1815303655165194491",
    text: "En enero de este año decidí hacer un experimento: Quería comprobar si podía monetizar un hobby sin usar mi marca personal. En poco tiempo conseguí generar $1.000…",
    mechanisms: ["intriga", "especificidad", "curiosidad"], structureCode: "TRA-03", construction: "Fecha + reto con restricción autoimpuesta + resultado concreto." },
  { creator: "euge-oller", platform: "X", publishedAt: "2024-07-06", url: "https://x.com/TechEuge/status/1809647637240639498",
    text: "El conocimiento sin motivación no entra.", mechanisms: ["contradiccion"], construction: "Aforismo corto con verbo coloquial." },
  { creator: "euge-oller", platform: "X", publishedAt: "2025-08-24", url: "https://x.com/TechEuge/status/1959617967060029943",
    text: "¿Era más fácil emprender antes… o lo es ahora?", mechanisms: ["controversia", "identificacion"], structureCode: "POL-10", construction: "Dilema de dos verdades: busca comentarios." },
  { creator: "jurgen-klaric", platform: "LinkedIn", publishedAt: "2021-11-01", url: "https://www.linkedin.com/posts/jurgenklaric-neurociencias_una-empresa-quería-vender-más-relojes-para-activity-6860924336220487680-ZCst",
    text: "Una empresa quería vender más relojes. Para esto, contrató un famoso…", mechanisms: ["intriga", "storytelling"], structureCode: "ESC-02", construction: "Caso ajeno in medias res; decisión que intuimos errada." },
  { creator: "jurgen-klaric", platform: "LinkedIn", publishedAt: "2021-10-12", url: "https://www.linkedin.com/posts/jurgenklaric-neurociencias_he-sido-vendedor-desde-que-era-ni%C3%B1o-por-activity-6853676419545907200-vfS5",
    text: "He sido vendedor desde que era niño. Por algo me llamaban “El niño…", mechanisms: ["curiosidad", "storytelling"], structureCode: "ESC-05", construction: "Apodo cortado antes del 'ver más'." },
  { creator: "jurgen-klaric", platform: "LinkedIn", publishedAt: "2021-11-03", url: "https://www.linkedin.com/posts/jurgenklaric-neurociencias_qu%C3%A9-pasar%C3%ADa-si-perdieras-el-miedo-a-vender-activity-6861650958531784704-tvG8",
    text: "¿Qué pasaría si perdieras el miedo a vender?", mechanisms: ["aspiracion"], construction: "Hipotético que nombra un miedo concreto." },
  { creator: "jurgen-klaric", platform: "LinkedIn", publishedAt: "2019-11-25", url: "https://www.linkedin.com/posts/jurgenklaric-neurociencias_la-verdad-es-que-latinoam%C3%A9rica-esta-pasando-activity-6604748881513205760-I4uF",
    text: "La verdad es que Latinoamérica está pasando por un periodo económico y…", mechanisms: ["autoridad"], construction: "Muletilla oral de franqueza." },
  { creator: "jurgen-klaric", platform: "LinkedIn", publishedAt: "2022-08-30", url: "https://es.linkedin.com/posts/jurgenklaric-neurociencias_el-marketing-digital-es-mucho-m%C3%A1s-sencillo-activity-6970391752222351361-bVTd",
    text: "El Marketing Digital es mucho más sencillo de lo que la mayoría de la…", mechanisms: ["contradiccion"], construction: "Minimiza la complejidad y crea un exogrupo ('la mayoría')." },
  { creator: "vilma-nunez", platform: "LinkedIn", publishedAt: "2023-09-02", url: "https://es.linkedin.com/posts/vilmanunezvillanueva_el-1-de-septiembre-de-2015-estaba-entrando-activity-7103791501922422784-orAi",
    text: "El 1 de septiembre de 2015, estaba entrando a Miami, Estados Unidos, con…", mechanisms: ["storytelling", "especificidad"], structureCode: "ESC-01", construction: "Fecha exacta + lugar + acción en curso." },
  { creator: "vilma-nunez", platform: "LinkedIn", publishedAt: "", url: "",
    text: "Lo confieso, soy una Growth Marketer", mechanisms: ["confesion", "ironia"], structureCode: "CNF-02", construction: "Confesión aplicada a algo que no es vergonzoso." },
  { creator: "vilma-nunez", platform: "LinkedIn", publishedAt: "2021-08-09", url: "https://www.linkedin.com/posts/vilmanunezvillanueva_hoy-quiero-compartirles-un-poco-mi-proceso-activity-6830496162995310592-NrmO",
    text: "Hoy quiero compartirles un poco mi proceso de ejecutora…", mechanisms: [], construction: "Contraejemplo: anuncio sin tensión.", isCounterExample: true },
  { creator: "vilma-nunez", platform: "LinkedIn", publishedAt: "2021-07-26", url: "https://www.linkedin.com/posts/vilmanunezvillanueva_tienes-un-conocimiento-que-quisieras-compartir-activity-6825420307382210560-l2CP",
    text: "¿Tienes un conocimiento que quisieras compartir y así mismo…", mechanisms: [], construction: "Contraejemplo: pregunta de folleto.", isCounterExample: true },
  { creator: "isra-bravo", platform: "X", publishedAt: "2020-02-26", url: "https://twitter.com/motivante_isra/status/1232615673995632641",
    text: "No me gustan las RRSS y apenas entro. No me mandes mensajes, pueden pasar meses hasta que vuelva a entrar.", mechanisms: ["controversia", "contradiccion"], structureCode: "POL-07", construction: "Anti-marketing: rechaza lo que todos persiguen." },
];
