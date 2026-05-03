import { supabase }
  from "@/lib/supabase";

const DAILY_LIMIT = 3;

function getTodayDate() {

  const now = new Date();

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "America/Bogota",
    }
  ).format(now);

}

export async function registerVisitor(
  visitorId: string
) {

  const {
    data,
    error,
  } = await supabase
    .from("visitors")
    .select("*")
    .eq(
      "visitor_id",
      visitorId
    )
    .maybeSingle();

  if (error) {

    console.error(
      "ERROR BUSCANDO VISITOR:",
      error
    );

    return;

  }

  /*
    SI NO EXISTE
  */

  if (!data) {

    const {
      error: insertError,
    } = await supabase
      .from("visitors")
      .insert([
        {
          visitor_id:
            visitorId,
        },
      ]);

    if (insertError) {

      console.error(
        "ERROR INSERTANDO VISITOR:",
        insertError
      );

    }

    return;

  }

  /*
    ACTUALIZAR
    ÚLTIMA VISITA
  */

  const {
    error: updateError,
  } = await supabase
    .from("visitors")
    .update({
      last_seen:
        new Date()
          .toISOString(),
    })
    .eq(
      "visitor_id",
      visitorId
    );

  if (updateError) {

    console.error(
      "ERROR ACTUALIZANDO VISITOR:",
      updateError
    );

  }

}

export async function getRemainingQueriesFromDB(
  visitorId: string
) {

  const today =
    getTodayDate();

  const {
    data,
    error,
  } = await supabase
    .from("daily_usage")
    .select("*")
    .eq(
      "visitor_id",
      visitorId
    )
    .eq(
      "usage_date",
      today
    )
    .maybeSingle();

  if (error) {

    console.error(
      "ERROR LEYENDO DAILY USAGE:",
      error
    );

    return 0;

  }

  /*
    SI NO EXISTE
  */

  if (!data) {

    const {
      error: insertError,
    } = await supabase
      .from("daily_usage")
      .insert([
        {
          visitor_id:
            visitorId,

          usage_date:
            today,

          queries_used: 0,
        },
      ]);

    if (insertError) {

      console.error(
        "ERROR INSERTANDO DAILY USAGE:",
        insertError
      );

      return 0;

    }

    return DAILY_LIMIT;

  }

  return Math.max(
    0,
    DAILY_LIMIT -
      data.queries_used
  );

}

export async function consumeQueryFromDB(
  visitorId: string
) {

  const today =
    getTodayDate();

  const {
    data,
    error,
  } = await supabase
    .from("daily_usage")
    .select("*")
    .eq(
      "visitor_id",
      visitorId
    )
    .eq(
      "usage_date",
      today
    )
    .maybeSingle();

  if (error) {

    console.error(
      "ERROR BUSCANDO DAILY USAGE:",
      error
    );

    return;

  }

  /*
    SI NO EXISTE
  */

  if (!data) {

    const {
      error: insertError,
    } = await supabase
      .from("daily_usage")
      .insert([
        {
          visitor_id:
            visitorId,

          usage_date:
            today,

          queries_used: 1,
        },
      ]);

    if (insertError) {

      console.error(
        "ERROR INSERTANDO CONSUMO:",
        insertError
      );

    }

    return;

  }

  /*
    ACTUALIZAR
    USO
  */

  const {
    error: updateError,
  } = await supabase
    .from("daily_usage")
    .update({
      queries_used:
        data.queries_used + 1,
    })
    .eq(
      "id",
      data.id
    );

  if (updateError) {

    console.error(
      "ERROR ACTUALIZANDO CONSUMO:",
      updateError
    );

  }

}