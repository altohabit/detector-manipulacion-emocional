"use client";

import Image from "next/image";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

import { analyzeSituation } from "@/services/psychologyAnalyzer";

import { AnalysisResponse } from "@/types/analysis";

import { useTypewriter } from "@/hooks/useTypewriter";

import { validateMessage } from "@/filters/messageFilter";

import { detectSpam } from "@/security/antiSpam";

import { canMakeRequest, registerRequest } from "@/security/requestCooldown";

import { saveMemory, getMemory, MemoryItem } from "@/memory/psychologyMemory";

import { getVisitorId } from "@/utils/visitorId";

import {
  registerVisitor,
  getRemainingQueriesFromDB,
  consumeQueryFromDB,
} from "@/services/visitorService";

import { logAnalysis } from "@/services/analysisLogger";

export default function MainInterface() {
  const router = useRouter();

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [response, setResponse] = useState<AnalysisResponse | null>(null);

  const [showExplanation, setShowExplanation] = useState(false);

  const [showGuidance, setShowGuidance] = useState(false);

  const [remainingQueries, setRemainingQueries] = useState(3);

  const [initialized, setInitialized] = useState(false);

  /*
    MEMORIA INTERNA
    NO VISIBLE
  */

  const [memory, setMemory] = useState<MemoryItem[]>([]);

  /*
    VISITOR ID
  */

  const [visitorId, setVisitorId] = useState("");

  /*
    USER AUTH
  */

  const [userId, setUserId] = useState("");

  const detectionText = useTypewriter(response?.detection || "", !!response);

  const explanationText = useTypewriter(
    response?.explanation || "",
    showExplanation,
  );

  const guidanceText = useTypewriter(response?.guidance || "", showGuidance);

  useEffect(() => {
    async function initialize() {
      /*
        VALIDAR SESIÓN
      */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      /*
        SI NO HAY LOGIN
      */

      if (!session?.user) {
        router.push("/auth");
        return;
      }

      /*
        USER AUTH
      */

      const user = session.user;

      setUserId(user.id);

      /*
        CARGAR MEMORIA
      */

      const savedMemory = getMemory();

      setMemory(savedMemory);

      /*
        OBTENER VISITOR ID
      */

      const id = getVisitorId();

      /*
        VALIDAR
      */

      if (!id) {
        return;
      }

      setVisitorId(id);

      /*
        REGISTRAR VISITANTE
      */

      await registerVisitor(id);

      /*
        CONSULTAS RESTANTES
      */

      const remaining = await getRemainingQueriesFromDB(id, user.id);

      if (typeof remaining === "number" && remaining >= 0) {
        setRemainingQueries(remaining);
      } else {
        setRemainingQueries(3);
      }

      setInitialized(true);
    }

    initialize();
  }, [router]);

  async function handleAnalyze() {
    if (!message.trim()) {
      return;
    }

    if (initialized && remainingQueries <= 0) {
      return;
    }

    if (!visitorId) {
      return;
    }

    /*
      COOLDOWN
      ANTI FLOOD
    */

    const cooldown = canMakeRequest();

    if (!cooldown.allowed) {
      setResponse({
        detection: "Demasiadas solicitudes",

        explanation: `Debes esperar ${cooldown.remaining} segundos antes de realizar otro análisis.`,

        guidance:
          "Esto ayuda a proteger el sistema contra abuso y spam automático.",
      });

      setShowExplanation(true);

      setShowGuidance(true);

      return;
    }

    const spamCheck = detectSpam(message);

    if (spamCheck.spam) {
      setResponse({
        detection: "Mensaje bloqueado",

        explanation: spamCheck.reason || "",

        guidance: "Espera unos segundos antes de volver a intentarlo.",
      });

      setShowExplanation(true);

      setShowGuidance(true);

      return;
    }

    const validation = validateMessage(message);

    if (!validation.valid) {
      if (validation.crisis) {
        setResponse({
          detection: "Estado emocional crítico detectado",

          explanation: validation.reason || "",

          guidance:
            "Busca apoyo humano inmediato. Contacta a alguien de confianza, un profesional de salud mental o servicios de emergencia emocionales de tu país. No enfrentes este momento completamente sola o solo.",
        });

        setShowExplanation(true);

        setShowGuidance(true);

        return;
      }

      setResponse({
        detection: "Mensaje bloqueado",

        explanation: validation.reason || "",

        guidance: "Modifica tu mensaje e inténtalo nuevamente.",
      });

      setShowExplanation(true);

      setShowGuidance(true);

      return;
    }

    setLoading(true);

    setShowExplanation(false);

    setShowGuidance(false);

    /*
      ANALIZAR
    */

    const apiResponse = await fetch("/api/analyze", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message,
      }),
    });

    const result = await apiResponse.json();

    /*
      REGISTRAR REQUEST
    */

    registerRequest();

    setResponse(result);

    /*
      TOKENS
    */

    const inputTokens = result?.usage?.prompt_tokens || 0;

    const outputTokens = result?.usage?.completion_tokens || 0;

    const totalTokens = result?.usage?.total_tokens || 0;

    /*
      GUARDAR ANALYSIS LOG
    */

    await logAnalysis({
      visitorId: visitorId,

      userMessage: message,

      detection: result.detection,

      emotionalCategory: result.detection,

      inputTokens: inputTokens,

      outputTokens: outputTokens,

      totalTokens: totalTokens,
    });

    /*
      GUARDAR MEMORIA
    */

    saveMemory({
      userMessage: message,

      detection: result.detection,

      timestamp: Date.now(),
    });

    /*
      ACTUALIZAR MEMORIA
    */

    const updatedMemory = getMemory();

    setMemory(updatedMemory);

    /*
      RESPUESTA UI
    */

    setResponse(result);

    /*
      CONSUMIR CONSULTA
    */

    await consumeQueryFromDB(visitorId, userId);

    /*
      ACTUALIZAR CONSULTAS
    */

    const updatedRemaining = await getRemainingQueriesFromDB(visitorId, userId);

    setRemainingQueries(updatedRemaining);

    setTimeout(() => {
      setShowExplanation(true);
    }, 2500);

    setTimeout(() => {
      setShowGuidance(true);
    }, 5000);

    setLoading(false);
  }

  function handleClear() {
    setMessage("");

    setResponse(null);

    setShowExplanation(false);

    setShowGuidance(false);
  }

  if (!initialized && !userId) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.12),transparent_70%)]" />
        <p className="text-cyan-400 text-xl animate-pulse relative z-10">
          Cargando...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-cyan-400 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.12),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-3xl border border-cyan-500/30 bg-black/60 backdrop-blur-md rounded-3xl p-8 shadow-[0_0_40px_rgba(0,255,255,0.15)]">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-pulse shadow-[0_0_40px_rgba(0,255,255,0.9)]" />

            <div className="absolute w-32 h-32 rounded-full bg-cyan-400/10 blur-2xl animate-pulse" />

            <div className="relative w-36 h-36 animate-[float_3s_ease-in-out_infinite]">
              <Image
                src="/characters/stickman.png"
                alt="Stickman psicológico"
                fill
                sizes="144px"
                className="object-contain drop-shadow-[0_0_25px_rgba(0,255,255,0.9)]"
                priority
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 text-center text-cyan-300 drop-shadow-[0_0_25px_rgba(0,255,255,0.7)] tracking-wide">
            AltoHábit
          </h1>

          <h2 className="text-2xl md:text-3xl font-bold mt-2 text-center text-cyan-400">
            Detector de Manipulación Emocional
          </h2>

          <p className="text-cyan-300/80 mt-4 text-center max-w-xl">
            Analiza patrones emocionales manipulativos, gaslighting y control
            psicológico.
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            maxLength={300}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe aquí tu situación..."
            className="w-full h-40 bg-black/50 border border-cyan-500/30 rounded-2xl p-4 text-cyan-200 placeholder:text-cyan-700 resize-none outline-none focus:border-cyan-400"
          />

          <div className="flex items-center justify-between text-sm text-cyan-500">
            <span>{message.length}/300 caracteres</span>

            <span>{remainingQueries} consultas disponibles hoy</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || (initialized && remainingQueries <= 0)}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-2xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Analizando..." : "Analizar"}
            </button>

            <button
              onClick={handleClear}
              className="flex-1 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 py-3 rounded-2xl transition-all duration-300"
            >
              Limpiar
            </button>
          </div>
        </div>

        {remainingQueries <= 0 && (
          <div className="mt-6 border border-red-500/40 bg-red-500/10 rounded-2xl p-4 text-center">
            <p className="text-red-400 font-bold">
              Has agotado tus 3 consultas diarias.
            </p>

            <p className="text-red-300 text-sm mt-2">
              Tus consultas se restaurarán automáticamente a medianoche hora
              Colombia.
            </p>
          </div>
        )}

        {response && (
          <div className="mt-8 border border-cyan-500/20 rounded-2xl p-6 bg-black/40 space-y-4">
            <div>
              <h2 className="text-cyan-300 font-bold mb-2">
                {response?.detection === "Estado emocional crítico detectado"
                  ? "Alerta Emocional Crítica"
                  : response?.detection === "Mensaje bloqueado"
                    ? "Mensaje Bloqueado"
                    : "Patrón Detectado"}
              </h2>

              <p className="text-cyan-100">
                {detectionText ||
                  "No se detectó un patrón claro en este mensaje."}
              </p>
            </div>

            {showExplanation && (
              <div>
                <h2 className="text-cyan-300 font-bold mb-2">Explicación</h2>

                <p className="text-cyan-100">
                  {explanationText ||
                    "No hay suficiente información para generar una explicación."}
                </p>
              </div>
            )}

            {showGuidance && (
              <div>
                <h2 className="text-cyan-300 font-bold mb-2">Orientación</h2>

                <p className="text-cyan-100">
                  {guidanceText ||
                    "Intenta dar más contexto para recibir una orientación más precisa."}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 border-t border-cyan-500/20 pt-6">
          <p className="text-xs text-cyan-700 text-center">
            Esta herramienta no reemplaza ayuda psicológica profesional.
          </p>
        </div>
      </div>
    </main>
  );
}
