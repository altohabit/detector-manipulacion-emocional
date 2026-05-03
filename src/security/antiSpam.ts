let lastMessageTime = 0;

let lastMessage = "";

let repeatedAttempts = 0;

export function detectSpam(
  message: string
) {

  const now = Date.now();

  const cleanMessage =
    message
      .toLowerCase()
      .trim();

  /*
    BLOQUEO FLOOD
  */

  if (
    now - lastMessageTime < 4000
  ) {

    repeatedAttempts++;

    return {
      spam: true,

      reason:
        "Estás enviando mensajes demasiado rápido. Espera unos segundos.",
    };

  }

  /*
    MENSAJES REPETIDOS
  */

  if (
    cleanMessage ===
    lastMessage
  ) {

    repeatedAttempts++;

    return {
      spam: true,

      reason:
        "No repitas el mismo mensaje continuamente.",
    };

  }

  /*
    MUCHOS INTENTOS
  */

  if (
    repeatedAttempts >= 5
  ) {

    return {
      spam: true,

      reason:
        "Demasiados intentos detectados. Espera un momento antes de continuar.",
    };

  }

  /*
    SPAM BASURA
  */

  const repeatedChars =
    /(.)\1{7,}/;

  if (
    repeatedChars.test(
      cleanMessage
    )
  ) {

    repeatedAttempts++;

    return {
      spam: true,

      reason:
        "Tu mensaje parece spam o texto sin sentido.",
    };

  }

  /*
    MUCHOS XD
  */

  const xdSpam =
    /(xd\s*){5,}/i;

  if (
    xdSpam.test(
      cleanMessage
    )
  ) {

    repeatedAttempts++;

    return {
      spam: true,

      reason:
        "Mensaje detectado como spam.",
    };

  }

  /*
    BLOQUEO TEXTO GIGANTE
  */

  if (
    cleanMessage.length > 500
  ) {

    return {
      spam: true,

      reason:
        "El mensaje es demasiado largo.",
    };

  }

  /*
    BLOQUEO CARACTERES RAROS
  */

  const weirdChars =
    /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ.,?!()"'¿¡\s]/g;

  const weirdMatches =
    cleanMessage.match(
      weirdChars
    );

  if (
    weirdMatches &&
    weirdMatches.length > 20
  ) {

    return {
      spam: true,

      reason:
        "Demasiados caracteres sospechosos detectados.",
    };

  }

  /*
    TODO BIEN
  */

  repeatedAttempts = 0;

  lastMessageTime = now;

  lastMessage =
    cleanMessage;

  return {
    spam: false,
  };

}