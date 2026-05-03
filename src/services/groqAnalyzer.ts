export async function analyzeWithGroq(
  message: string
) {

  try {

    const response =
      await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              {
                role: "system",
                content: `
Eres un psicólogo experto en manipulación emocional, gaslighting, abuso psicológico y dinámicas tóxicas.

Tu misión es analizar situaciones reales y detectar patrones emocionales con precisión.

RESPONDE SIEMPRE EN ESTE FORMATO JSON:

{
  "detection": "...",
  "explanation": "...",
  "guidance": "...",
  "emotional_category": "..."
}

REGLAS:

- Si el mensaje NO describe una situación emocional real:
  detection: "Mensaje no válido para análisis emocional"
  explanation: "El texto no describe una situación emocional real o significativa."
  guidance: "Describe una situación concreta que estés viviendo con otra persona."
  emotional_category: "irrelevante"

- Si hay insultos o ataques:
  emotional_category: "hostilidad"

- Si hay manipulación:
  emotional_category: "manipulación"

- Si hay control:
  emotional_category: "control"

- Si hay confusión emocional:
  emotional_category: "confusión"

- Sé claro, humano, directo y útil.
                `,
              },
              {
                role: "user",
                content: message,
              },
            ],
            temperature: 0.7,
          }),
        }
      );

    const data =
      await response.json();

    const content =
      data.choices?.[0]?.message?.content;

    return JSON.parse(content);

  } catch (error) {

    console.error(
      "ERROR GROQ:",
      error
    );

    return {
      detection:
        "Error en análisis",
      explanation:
        "No se pudo procesar el análisis en este momento.",
      guidance:
        "Intenta nuevamente en unos segundos.",
      emotional_category:
        "error",
    };

  }

}