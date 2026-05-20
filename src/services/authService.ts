import { supabase } from "@/lib/supabase";

/*
  REGISTRO
*/

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

/*
  LOGIN
*/

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/*
  LOGOUT
*/

export async function signOut() {
  return await supabase.auth.signOut();
}

/*
  OBTENER SESIÓN
*/

export async function getCurrentSession() {
  return await supabase.auth.getSession();
}

/*
  OBTENER USUARIO
*/

export async function getCurrentUser() {
  return await supabase.auth.getUser();
}
