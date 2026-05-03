const VISITOR_KEY =
  "psychology_visitor_id";

export function getVisitorId() {

  if (
    typeof window ===
    "undefined"
  ) {

    return null;

  }

  let visitorId =
    localStorage.getItem(
      VISITOR_KEY
    );

  if (!visitorId) {

    visitorId =
      crypto.randomUUID();

    localStorage.setItem(
      VISITOR_KEY,
      visitorId
    );

  }

  return visitorId;

}