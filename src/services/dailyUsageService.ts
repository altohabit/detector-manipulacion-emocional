import { supabase }
  from "@/lib/supabase";

export async function getDailyUsage(
  visitorId: string
) {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const { data } =
    await supabase
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
      .single();

  return data;

}

export async function incrementDailyUsage(
  visitorId: string
) {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const existing =
    await getDailyUsage(
      visitorId
    );

  /*
    SI NO EXISTE
  */

  if (!existing) {

    await supabase
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

    return 1;

  }

  /*
    SI EXISTE
  */

  const updatedCount =
    existing.queries_used + 1;

  await supabase
    .from("daily_usage")
    .update({
      queries_used:
        updatedCount,
    })
    .eq(
      "id",
      existing.id
    );

  return updatedCount;

}