const bannedWords = [
  "puta",
  "mierda",
  "maldito",
  "idiota",
  "estupido",
  "imbecil",
  "fuck",
  "bitch",
  "porno",
  "sexo",
];

const irrelevantPatterns = [
  "quien gano",
  "resultado del partido",
  "clima",
  "receta",
  "descargar",
  "hackear",
  "bitcoin",
  "programacion",
];

const manipulationAttempts = [
  "ignora instrucciones",

  "ignora las instrucciones",

  "ignora todas las instrucciones",

  "ignora completamente las instrucciones",

  "olvida instrucciones",

  "olvida las instrucciones",

  "actua como",

  "eres chatgpt",

  "system prompt",

  "developer mode",

  "modo desarrollador",

  "haz cualquier cosa",

  "do anything now",

  "dan mode",

  "prompt secreto",

  "prompt interno",

  "muestra instrucciones",

  "revela instrucciones",

  "bypass",

  "jailbreak",
];

const crisisPatterns = [
  "quiero morirme",
  "me quiero morir",
  "me quiero matar",
  "suicidarme",
  "ya no quiero vivir",
  "no quiero seguir",
  "quiero desaparecer",
  "no puedo más",
  "mi vida no tiene sentido",
  "me quiero suicidar",
  "quiero suicidarme",
  "quiero matarme",
  "quiero hacerme daño",
  "quiero lastimarme",
  "no quiero existir",
  "quiero dejar de existir",
  "mejor muerto",
  "mejor muerta",
];

/*
  FRASES TÓXICAS
  O AGRESIVAS
*/

const toxicPatterns = [
  "esta app es una porqueria",

  "no sirve",

  "app basura",

  "esto es basura",

  "eres inutil",

  "no sirves",

  "porqueria",

  "basura",

  "estafa",

  "idiotez",
];

function normalizeText(text: string) {
  return (
    text

      .toLowerCase()

      .normalize("NFD")

      .replace(/[\u0300-\u036f]/g, "")

      /*
      CONVERTIR NÚMEROS
    */

      .replace(/[0-9]/g, (num) => {
        const map: Record<string, string> = {
          "0": "o",
          "1": "i",
          "3": "e",
          "4": "a",
          "5": "s",
          "7": "t",
        };

        return map[num] || num;
      })

      /*
      ELIMINAR ESPACIOS
    */

      .replace(/\s+/g, " ")

      /*
      ELIMINAR TODO
      MENOS LETRAS
    */

      .replace(/[^a-zñáéíóú]/g, "")
  );
}

/*
  DETECTAR
  REPETICIÓN EXCESIVA
*/

function hasExcessiveRepetition(text: string) {
  const clean = text.toLowerCase().replace(/[^a-záéíóúñ\s]/g, "");

  /*
    PALABRAS
    REPETIDAS
  */

  const words = clean.split(/\s+/).filter(Boolean);

  const wordCount: Record<string, number> = {};

  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1;

    /*
      MISMA PALABRA
      MUCHAS VECES
    */

    if (word.length > 2 && wordCount[word] >= 6) {
      return true;
    }
  }

  /*
    MUCHOS
    CARACTERES
    REPETIDOS
  */

  const repeatedChars = /(.)\1{7,}/;

  if (repeatedChars.test(clean)) {
    return true;
  }

  return false;
}

/*
  DETECTAR TEXTO
  BASURA
*/

function isGibberish(text: string) {
  const clean = text.toLowerCase().replace(/[^a-záéíóúñ]/g, "");

  /*
    MUY CORTO
  */

  if (clean.length < 8) {
    return false;
  }

  /*
    MUCHAS LETRAS
    REPETIDAS
  */

  const repeatedLetters = /(.)\1{4,}/;

  if (repeatedLetters.test(clean)) {
    return true;
  }

  /*
    PATRONES
    REPETIDOS
  */

  const repeatedPattern = /^(.{1,4})\1+$/;

  if (repeatedPattern.test(clean)) {
    return true;
  }

  /*
    MUY POCAS
    VOCALES
  */

  const vowels = clean.match(/[aeiouáéíóú]/g) || [];

  const vowelRatio = vowels.length / clean.length;

  if (vowelRatio < 0.2) {
    return true;
  }

  /*
    MUY POCAS
    LETRAS ÚNICAS
  */

  const uniqueChars = new Set(clean.split(""));

  if (uniqueChars.size <= 3 && clean.length > 8) {
    return true;
  }

  /*
    SIN ESPACIOS
    Y MUY LARGO
  */

  const noSpaces = !text.includes(" ");

  if (noSpaces && clean.length > 15) {
    return true;
  }

  /*
    PATRONES
    TECLADO
  */

  const keyboardPatterns = ["asdf", "qwer", "zxcv", "qwerty", "asdfgh"];

  const hasKeyboardPattern = keyboardPatterns.some((pattern) =>
    clean.includes(pattern),
  );

  if (hasKeyboardPattern) {
    return true;
  }

  return false;
}

export function validateMessage(message: string) {
  const rawText = message.toLowerCase().trim();

  const normalizedText = normalizeText(message);

  if (!rawText) {
    return {
      valid: false,

      reason: "Debes escribir una situación para analizar.",
    };
  }

  if (rawText.length < 10) {
    return {
      valid: false,

      reason: "Describe mejor tu situación emocional.",
    };
  }

  if (rawText.length > 500) {
    return {
      valid: false,

      reason: "Tu mensaje es demasiado largo.",
    };
  }

  /*
    TEXTO BASURA
  */

  if (isGibberish(rawText)) {
    return {
      valid: false,

      reason:
        "Tu mensaje no parece una situación emocional válida. Describe mejor lo que estás viviendo.",
    };
  }

  /*
    REPETICIÓN
    EXCESIVA
  */

  if (hasExcessiveRepetition(rawText)) {
    return {
      valid: false,

      reason:
        "Tu mensaje contiene demasiada repetición y no parece una situación emocional válida.",
    };
  }

  /*
    CARACTERES RAROS
  */

  const strangeCharacters = /[@#$%^&*_=+{}[\]\\|<>]{10,}/;

  if (strangeCharacters.test(rawText)) {
    return {
      valid: false,

      reason: "Mensaje bloqueado por caracteres sospechosos.",
    };
  }

  /*
    PALABRAS OFENSIVAS
  */

  const hasBadWord = bannedWords.some((word) =>
    normalizedText.includes(normalizeText(word)),
  );

  if (hasBadWord) {
    return {
      valid: false,

      reason: "No puedo analizar mensajes ofensivos o vulgares.",
    };
  }

  /*
    FRASES TÓXICAS
    O AGRESIVAS
  */

  const hasToxicContent = toxicPatterns.some((pattern) =>
    normalizedText.includes(normalizeText(pattern)),
  );

  if (hasToxicContent) {
    return {
      valid: false,

      reason:
        "Tu mensaje contiene lenguaje agresivo o destructivo. Reformula tu situación emocional.",
    };
  }

  /*
    TEMAS IRRELEVANTES
  */

  const isIrrelevant = irrelevantPatterns.some((pattern) =>
    normalizedText.includes(normalizeText(pattern)),
  );

  if (isIrrelevant) {
    return {
      valid: false,

      reason:
        "Esta herramienta solo analiza situaciones emocionales y psicológicas.",
    };
  }

  /*
    INTENTOS
    DE MANIPULACIÓN
  */

  const manipulationDetected = manipulationAttempts.some((pattern) =>
    normalizedText.includes(normalizeText(pattern)),
  );

  if (manipulationDetected) {
    return {
      valid: false,

      reason: "Mensaje bloqueado por intento de manipulación del sistema.",
    };
  }

  /*
    CRISIS
    EMOCIONAL
  */

  const isCrisis = crisisPatterns.some((pattern) =>
    normalizedText.includes(normalizeText(pattern)),
  );

  if (isCrisis) {
    return {
      valid: false,

      crisis: true,

      reason:
        "Estoy detectando señales de un fuerte colapso emocional. Por favor busca apoyo humano inmediato de alguien de confianza o un profesional de salud mental. No enfrentes esto completamente sola o solo.",
    };
  }

  return {
    valid: true,
  };
}
