const STORAGE_KEY =
  "request_cooldown";

const COOLDOWN_SECONDS = 15;

export function canMakeRequest() {

  const lastRequest =
    localStorage.getItem(
      STORAGE_KEY
    );

  if (!lastRequest) {

    return {
      allowed: true,
      remaining: 0,
    };

  }

  const now =
    Date.now();

  const diff =
    Math.floor(
      (now -
        Number(lastRequest)) /
        1000
    );

  if (
    diff <
    COOLDOWN_SECONDS
  ) {

    return {

      allowed: false,

      remaining:
        COOLDOWN_SECONDS -
        diff,

    };

  }

  return {

    allowed: true,

    remaining: 0,

  };

}

export function registerRequest() {

  localStorage.setItem(

    STORAGE_KEY,

    Date.now().toString()

  );

}