import { AnalysisResponse }
  from "@/types/analysis";

export async function analyzeSituation(
  text: string
): Promise<AnalysisResponse> {

  try {

    const response =
      await fetch(
        "/api/analyze",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

          },

          body: JSON.stringify({

            message: text,

          }),

        }
      );

    /*
      ERROR HTTP
    */

    if (
      !response.ok
    ) {

      return {

        detection:
          "Error en análisis",

        explanation:
          "No se pudo procesar el análisis en este momento.",

        guidance:
          "Intenta nuevamente en unos segundos.",

      };

    }

    const data =
      await response.json();

    /*
      ERROR BACKEND
    */

    if (
      data.error
    ) {

      return {

        detection:
          "Error en análisis",

        explanation:
          data.error,

        guidance:
          "Intenta nuevamente más tarde.",

      };

    }

    return {

      detection:
        data.detection,

      explanation:
        data.explanation,

      guidance:
        data.guidance,

      usage:
        data.usage,

      country:
        data.country,

    };

  } catch {

    return {

      detection:
        "Error en análisis",

      explanation:
        "Ocurrió un problema inesperado durante el análisis.",

      guidance:
        "Verifica tu conexión e inténtalo nuevamente.",

    };

  }

}