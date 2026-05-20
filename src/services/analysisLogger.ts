import { supabase } from "@/lib/supabase";

interface LogAnalysisParams {
  userId: string;

  visitorId: string;

  userMessage: string;

  detection: string;

  emotionalCategory: string;

  inputTokens: number;

  outputTokens: number;

  totalTokens: number;
}

export async function logAnalysis({
  visitorId,

  userId,

  userMessage,

  detection,

  emotionalCategory,

  inputTokens,

  outputTokens,

  totalTokens,
}: LogAnalysisParams) {
  /*
    COSTO ESTIMADO
    GROQ
  */

  const estimatedCost = (totalTokens / 1000000) * 0.59;

  const { error } = await supabase.from("analysis_logs").insert([
    {
      visitor_id: visitorId,

      user_id: userId,

      user_message: userMessage,

      detection: detection,

      emotional_category: emotionalCategory,

      input_tokens: inputTokens,

      output_tokens: outputTokens,

      total_tokens: totalTokens,

      estimated_cost: estimatedCost,

      country: null,
    },
  ]);

  if (error) {
    console.error(
      "ERROR GUARDANDO ANALYSIS LOG:",

      error,
    );
  }
}
