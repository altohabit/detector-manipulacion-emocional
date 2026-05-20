import { supabase } from "@/lib/supabase";

const DAILY_LIMIT = 3;

function getTodayDate() {
  const now = new Date();

  /*
    FECHA SEGURA
    YYYY-MM-DD
  */

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export async function registerVisitor(visitorId: string) {
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (error) {
    console.error("ERROR BUSCANDO VISITOR:", error);
    return;
  }

  /*
    SI NO EXISTE
  */

  if (!data) {
    const { error: insertError } = await supabase.from("visitors").insert([
      {
        visitor_id: visitorId,
      },
    ]);

    /*
      IGNORAR DUPLICADOS
    */

    if (insertError && insertError.code !== "23505") {
      console.error("ERROR INSERTANDO VISITOR:", insertError);
    }

    return;
  }

  /*
    ACTUALIZAR
    ÚLTIMA VISITA
  */

  const { error: updateError } = await supabase
    .from("visitors")
    .update({
      last_seen: new Date().toISOString(),
    })
    .eq("visitor_id", visitorId);

  if (updateError) {
    console.error("ERROR ACTUALIZANDO VISITOR:", updateError);
  }
}

/*
  OBTENER CONSULTAS RESTANTES
*/

export async function getRemainingQueriesFromDB(
  visitorId: string,
  userId?: string,
) {
  const today = getTodayDate();

  console.log("TODAY DATE:", today);

  let query = supabase.from("daily_usage").select("*").eq("usage_date", today);

  /*
    PRIORIDAD:
    USER AUTH
  */

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq("visitor_id", visitorId);
  }

  const { data, error } = await query.maybeSingle();

  /*
    ERROR DE LECTURA
    → NO REGALAR CONSULTAS
  */

  if (error) {
    console.error("ERROR LEYENDO DAILY USAGE:", error);
    return 0;
  }

  /*
    SI NO EXISTE
  */

  if (!data) {
    const insertPayload: {
      visitor_id?: string;
      user_id?: string;
      usage_date: string;
      queries_used: number;
    } = {
      usage_date: today,
      queries_used: 0,
    };

    /*
      USER AUTH
    */

    if (userId) {
      insertPayload.user_id = userId;
    } else {
      insertPayload.visitor_id = visitorId;
    }

    const { error: insertError } = await supabase
      .from("daily_usage")
      .insert([insertPayload]);

    /*
      SI FALLA EL INSERT
      → NO DAR ACCESO
    */

    if (insertError) {
      console.error("ERROR INSERTANDO DAILY USAGE:", insertError);

      return 0;
    }

    return DAILY_LIMIT;
  }

  /*
    PROTECCIÓN
  */

  if (typeof data.queries_used !== "number" || data.queries_used < 0) {
    return DAILY_LIMIT;
  }

  return Math.max(0, DAILY_LIMIT - data.queries_used);
}

/*
  CONSUMIR CONSULTA
*/

export async function consumeQueryFromDB(visitorId: string, userId?: string) {
  const today = getTodayDate();

  let query = supabase.from("daily_usage").select("*").eq("usage_date", today);

  /*
    PRIORIDAD:
    USER AUTH
  */

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.eq("visitor_id", visitorId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("ERROR BUSCANDO DAILY USAGE:", error);

    return;
  }

  /*
    SI NO EXISTE
  */

  if (!data) {
    const insertPayload: {
      visitor_id?: string;
      user_id?: string;
      usage_date: string;
      queries_used: number;
    } = {
      usage_date: today,
      queries_used: 1,
    };

    /*
      USER AUTH
    */

    if (userId) {
      insertPayload.user_id = userId;
    } else {
      insertPayload.visitor_id = visitorId;
    }

    const { error: insertError } = await supabase
      .from("daily_usage")
      .insert([insertPayload]);

    if (insertError) {
      console.error("ERROR INSERTANDO CONSUMO:", insertError);
    }

    return;
  }

  /*
    EVITAR EXCEDER
  */

  if (data.queries_used >= DAILY_LIMIT) {
    console.log("LÍMITE YA ALCANZADO");

    return;
  }

  /*
    ACTUALIZAR USO
  */

  const { error: updateError } = await supabase
    .from("daily_usage")
    .update({
      queries_used: data.queries_used + 1,
    })
    .eq("id", data.id);

  if (updateError) {
    console.error("ERROR ACTUALIZANDO CONSUMO:", updateError);
  }
}
