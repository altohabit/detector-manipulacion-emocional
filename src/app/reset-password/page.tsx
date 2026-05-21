"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  async function handleReset() {
    if (!password) {
      setMessage("Escribe tu nueva contraseña.");
      return;
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    setLoading(true);

    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Contraseña actualizada correctamente.");
      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.12),transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md border border-cyan-500/30 bg-black/60 rounded-3xl p-8 backdrop-blur-md shadow-[0_0_40px_rgba(0,255,255,0.15)]">
        <h1 className="text-3xl font-bold text-cyan-300 text-center mb-6">
          Nueva Contraseña
        </h1>

        <p className="text-cyan-400/80 text-sm text-center mb-6">
          Escribe tu nueva contraseña.
        </p>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/50 border border-cyan-500/30 rounded-2xl p-3 text-cyan-100 outline-none focus:border-cyan-400"
          />

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-2xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Guardar nueva contraseña"}
          </button>

          {message && (
            <p className="text-center text-sm text-cyan-200">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}
