"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn, signUp } from "@/services/authService";

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAuth() {
    if (!email || !password) {
      setMessage("Completa todos los campos.");
      return;
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Inicio de sesión exitoso.");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Revisa tu correo y confirma tu cuenta.");
        }
      }
    } catch {
      setMessage("Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center px-6 relative overflow-hidden pt-16">
      {/* Glow de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.12),transparent_70%)]" />

      {/* TÍTULOS SUPERIORES */}
      <div className="relative z-20 text-center mb-16 w-full">
        <h1 className="text-5xl md:text-6xl font-extrabold text-cyan-300 tracking-wide drop-shadow-[0_0_25px_rgba(0,255,255,0.7)]">
          AltoHábit
        </h1>
        <p className="mt-2 text-cyan-400/90 text-lg md:text-xl font-medium tracking-wide">
          Detector de Manipulación Emocional
        </p>
      </div>

      {/* FILA: PERSONAJE + CARD */}
      <div className="relative z-10 flex flex-row items-center justify-center gap-10 w-full max-w-4xl">
        {/* PERSONAJE - izquierda */}
        <div className="hidden md:flex flex-shrink-0 items-center justify-center">
          <div className="relative w-64 h-64 animate-[float_4s_ease-in-out_infinite]">
            <Image
              src="/characters/altohabit-full.png"
              alt="AltoHábit"
              fill
              sizes="256px"
              priority
              className="object-contain drop-shadow-[0_0_35px_rgba(0,255,255,0.9)]"
            />
          </div>
        </div>

        {/* CARD LOGIN - derecha */}
        <div className="w-full max-w-md border border-cyan-500/30 bg-black/60 rounded-3xl p-8 backdrop-blur-md shadow-[0_0_40px_rgba(0,255,255,0.15)]">
          <h2 className="text-2xl font-bold text-cyan-300 text-center mb-6">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>

          <p className="text-cyan-400/80 text-sm text-center mb-6">
            Accede al Detector de Manipulación Emocional.
          </p>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-cyan-500/30 rounded-2xl p-3 text-cyan-100 outline-none focus:border-cyan-400"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-cyan-500/30 rounded-2xl p-3 text-cyan-100 outline-none focus:border-cyan-400"
            />

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-2xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Procesando..." : isLogin ? "Entrar" : "Registrarme"}
            </button>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-cyan-400 text-sm"
            >
              {isLogin
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>

            {message && (
              <p className="text-center text-sm text-cyan-200">{message}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
