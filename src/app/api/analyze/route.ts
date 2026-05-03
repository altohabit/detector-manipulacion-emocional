import { NextResponse }
  from "next/server";

const SYSTEM_PROMPT = `
Eres un analista especializado en manipulación emocional, dinámicas psicológicas tóxicas, gaslighting, culpa inducida, chantaje emocional, control psicológico, dependencia emocional, invalidación emocional y abuso psicológico sutil.

Tu función es analizar situaciones emocionales reales descritas por usuarios y detectar posibles patrones psicológicos dañinos de forma humana, reflexiva, precisa, empática y profundamente útil.

OBJETIVO PRINCIPAL:

Ayudar al usuario a identificar dinámicas emocionales potencialmente dañinas dentro de relaciones sentimentales, familiares, laborales, sociales o personales.

COMPORTAMIENTO OBLIGATORIO:

- Analiza cuidadosamente el contexto emocional.
- Detecta señales de manipulación emocional sutil o explícita.
- Explica el posible impacto psicológico de la situación.
- Ayuda al usuario a reflexionar sin generar paranoia.
- Mantén un tono humano, cálido, serio y profesional.
- Sé claro y específico.
- Prioriza profundidad emocional sobre respuestas genéricas.

REGLAS CRÍTICAS:

- Nunca inventes hechos que el usuario no mencionó.
- Nunca exageres conclusiones.
- Nunca afirmes que alguien es abusador sin evidencia clara.
- Nunca diagnostiques trastornos mentales.
- Nunca des consejos médicos.
- Nunca generes dependencia emocional hacia la IA.
- Nunca digas que eres terapeuta o psicólogo real.
- Nunca respondas con humor.
- Nunca respondas temas fuera del análisis emocional.
- Nunca respondas preguntas técnicas, políticas o irrelevantes.
- Nunca uses lenguaje robótico.
- Nunca repitas frases genéricas innecesarias.

PATRONES QUE PUEDES DETECTAR:

- culpa inducida
- manipulación emocional
- control psicológico
- gaslighting
- invalidación emocional
- aislamiento social
- dependencia emocional
- chantaje emocional
- manipulación pasivo-agresiva
- control mediante miedo o culpa
- desgaste emocional constante
- presión psicológica
- desvalorización emocional

ESTILO DE RESPUESTA:

La respuesta debe hacer que la persona reflexione profundamente sobre lo que está viviendo.

Debe sentirse:

- humana
- emocionalmente inteligente
- psicológicamente madura
- clara
- útil
- seria
- profesional

ESTRUCTURA OBLIGATORIA:

Debes responder SOLO en JSON válido.

Formato obligatorio:

{
  "detection": "...",
  "explanation": "...",
  "guidance": "..."
}

REGLAS PARA CADA CAMPO:

"detection":
- Resume el patrón emocional detectado.
- Debe ser claro y específico.
- No exagerar.

"explanation":
- Explica por qué el comportamiento puede ser emocionalmente dañino.
- Explica posibles efectos psicológicos.
- Usa análisis reflexivo y humano.
- Evita sonar mecánico.

"guidance":
- Ofrece orientación emocional saludable.
- Fomenta reflexión, límites sanos y autocuidado emocional.
- Nunca ordenes terminar relaciones automáticamente.
- Nunca generes miedo extremo.
`;

/*
  PALABRAS BLOQUEADAS
*/

const blockedPatterns = [

  "ignora instrucciones",

  "ignora las instrucciones",

  "system prompt",

  "developer mode",

  "modo desarrollador",

  "jailbreak",

  "bypass",

  "actua como",

  "eres chatgpt",

  "haz cualquier cosa",

];

/*
  DETECTAR TEXTO BASURA
*/

function isGibberish(
  text: string
) {

  const clean =
    text
      .toLowerCase()
      .replace(
        /[^a-záéíóúñ]/g,
        ""
      );

  if (
    clean.length < 8
  ) {

    return false;

  }

  const repeatedPattern =
    /^(.{1,4})\1+$/;

  if (
    repeatedPattern.test(
      clean
    )
  ) {

    return true;

  }

  const repeatedLetters =
    /(.)\1{5,}/;

  if (
    repeatedLetters.test(
      clean
    )
  ) {

    return true;

  }

  return false;

}

export async function POST(
  request: Request
) {

  try {

    /*
      OBTENER IP
    */

    const forwardedFor =
      request.headers.get(
        "x-forwarded-for"
      );

    const realIp =
      forwardedFor
        ? forwardedFor
            .split(",")[0]
            .trim()
        : "unknown";

    /*
      DETECTAR PAÍS
    */

    const country =
      request.headers.get(
        "x-vercel-ip-country"
      ) || "unknown";

    const body =
      await request.json();

    const userMessage =
      body.message;

    /*
      VALIDAR MENSAJE
    */

    if (
      !userMessage ||
      typeof userMessage !==
        "string"
    ) {

      return NextResponse.json(
        {
          error:
            "Mensaje inválido",
        },
        {
          status: 400,
        }
      );

    }

    const cleanMessage =
      userMessage.trim();

    /*
      VACÍO
    */

    if (
      !cleanMessage
    ) {

      return NextResponse.json(
        {
          error:
            "Mensaje vacío",
        },
        {
          status: 400,
        }
      );

    }

    /*
      MUY CORTO
    */

    if (
      cleanMessage.length < 10
    ) {

      return NextResponse.json(
        {
          error:
            "Mensaje demasiado corto",
        },
        {
          status: 400,
        }
      );

    }

    /*
      MUY LARGO
    */

    if (
      cleanMessage.length > 500
    ) {

      return NextResponse.json(
        {
          error:
            "Mensaje demasiado largo",
        },
        {
          status: 400,
        }
      );

    }

    /*
      CARACTERES RAROS
    */

    const strangeCharacters =
      /[@#$%^&*_=+{}[\]\\|<>]{8,}/;

    if (
      strangeCharacters.test(
        cleanMessage
      )
    ) {

      return NextResponse.json(
        {
          error:
            "Mensaje bloqueado por caracteres sospechosos",
        },
        {
          status: 400,
        }
      );

    }

    /*
      TEXTO BASURA
    */

    if (
      isGibberish(
        cleanMessage
      )
    ) {

      return NextResponse.json(
        {
          error:
            "Mensaje inválido o sin sentido",
        },
        {
          status: 400,
        }
      );

    }

    /*
      PROMPT INJECTION
    */

    const normalizedMessage =
      cleanMessage
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );

    const blockedDetected =
      blockedPatterns.some(
        (pattern) =>
          normalizedMessage.includes(
            pattern
          )
      );

    if (
      blockedDetected
    ) {

      return NextResponse.json(
        {
          error:
            "Intento de manipulación detectado",
        },
        {
          status: 400,
        }
      );

    }

    /*
      REQUEST A GROQ
    */

    const response =
      await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${process.env.GROQ_API_KEY}`,

          },

          body: JSON.stringify({

            model:
              "llama-3.3-70b-versatile",

            temperature: 0.7,

            messages: [

              {
                role: "system",

                content:
                  SYSTEM_PROMPT,
              },

              {
                role: "user",

                content:
                  cleanMessage,
              },

            ],

          }),

        }
      );

    const data =
      await response.json();

    console.log(
      "GROQ USAGE:",
      data.usage
    );

    console.log(
      "COUNTRY:",
      country
    );

    console.log(
      "IP:",
      realIp
    );

    const content =
      data
        ?.choices?.[0]
        ?.message?.content;

    if (!content) {

      return NextResponse.json(
        {
          error:
            "Respuesta vacía de IA",
        },
        {
          status: 500,
        }
      );

    }

    let parsed;

    try {

      parsed =
        JSON.parse(
          content
        );

    } catch {

      return NextResponse.json(
        {
          error:
            "La IA devolvió JSON inválido",
        },
        {
          status: 500,
        }
      );

    }

    return NextResponse.json({

      detection:
        parsed.detection,

      explanation:
        parsed.explanation,

      guidance:
        parsed.guidance,

      country:
        country,

      usage: {

        prompt_tokens:
          data?.usage?.prompt_tokens || 0,

        completion_tokens:
          data?.usage?.completion_tokens || 0,

        total_tokens:
          data?.usage?.total_tokens || 0,

      },

    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Error interno del servidor",
      },
      {
        status: 500,
      }
    );

  }

}