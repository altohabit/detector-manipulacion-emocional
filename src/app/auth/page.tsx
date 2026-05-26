"use client";

import Image from "next/image";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      setMessage("Completa todos los campos.");
      return;
    }

    setLoading(true);

    setMessage("");

    try {
      /*
        LOGIN
      */

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(
            error.message === "Invalid login credentials"
              ? "Correo o contraseña incorrectos"
              : error.message,
          );

          setLoading(false);
          return;
        }

        router.push("/");

        return;
      }

      /*
        REGISTRO
      */

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setMessage("Registro exitoso. Ya puedes iniciar sesión.");
    } catch {
      setMessage("Ocurrió un error inesperado.");
    }

    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setMessage("Escribe tu correo electrónico.");
      return;
    }
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        "https://detector-manipulacion-emocional.vercel.app/reset-password",
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Revisa tu correo para restablecer tu contraseña.");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Fondo glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.12),transparent_70%)]" />

      {/* TÍTULOS */}
      <div className="relative z-10 text-center mb-0">
        <h1 className="text-5xl md:text-6xl font-extrabold text-cyan-300 tracking-wide drop-shadow-[0_0_25px_rgba(0,255,255,0.7)]">
          AltoHábit
        </h1>
        <p className="mt-2 text-cyan-400 text-xl font-medium tracking-wide">
          Detector de Manipulación Emocional
        </p>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-0 items-center">
        {/* PERSONAJE */}
        <div className="flex justify-center">
          <div className="relative w-[200px] h-[350px] md:w-[430px] md:h-[760px] animate-[float_3s_ease-in-out_infinite]">
            {/* Glow */}
            <div className="absolute inset-0 bg-cyan-400/30 blur-[120px] rounded-full animate-pulse" />

            <Image
              src="/characters/altohabit-full.png"
              alt="AltoHabit"
              fill
              sizes="430px"
              priority
              className="object-contain drop-shadow-[0_0_60px_rgba(0,255,255,0.7)]"
            />
          </div>
        </div>

        {/* PANEL AUTH */}
        <div className="border border-cyan-500/20 bg-black/60 backdrop-blur-xl rounded-3xl p-10 shadow-[0_0_50px_rgba(0,255,255,0.08)]">
          <h1 className="text-4xl font-bold text-cyan-300 mb-4">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </h1>

          <p className="text-cyan-500 mb-8">
            Accede al Detector de Manipulación Emocional.
          </p>

          <div className="space-y-5">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-cyan-500/20 rounded-2xl p-4 text-cyan-100 outline-none focus:border-cyan-400"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-cyan-500/20 rounded-2xl p-4 text-cyan-100 outline-none focus:border-cyan-400"
            />

            <button
              onClick={isForgotPassword ? handleForgotPassword : handleAuth}
              disabled={loading}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Procesando..." : isLogin ? "Entrar" : "Registrarme"}
            </button>
          </div>

          {message && (
            <div className="mt-6 border border-cyan-500/20 bg-cyan-500/10 rounded-2xl p-4 text-cyan-200">
              {message}
            </div>
          )}

          {!isForgotPassword && (
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
              className="mt-8 text-cyan-400 hover:text-cyan-300 transition-all"
            >
              {isLogin
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          )}

          {isLogin && !isForgotPassword && (
            <button
              onClick={() => {
                setIsForgotPassword(true);
                setMessage("");
              }}
              className="mt-4 block text-cyan-600 hover:text-cyan-400 transition-all text-sm"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {isForgotPassword && (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setMessage("");
              }}
              className="mt-8 text-cyan-400 hover:text-cyan-300 transition-all"
            >
              Volver al inicio de sesión
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
