const VISITOR_KEY = "psychology_visitor_id";

const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const date = new Date();

  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

  const expires = "expires=" + date.toUTCString();

  document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name: string) {
  const cookieName = name + "=";

  const decodedCookie = decodeURIComponent(document.cookie);

  const cookies = decodedCookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];

    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }

    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }

  return null;
}

export function getVisitorId() {
  if (typeof window === "undefined") {
    return null;
  }

  /*
    BUSCAR EN
    LOCALSTORAGE
  */

  let visitorId = localStorage.getItem(VISITOR_KEY);

  /*
    SI NO EXISTE
    BUSCAR COOKIE
  */

  if (!visitorId) {
    visitorId = getCookie(VISITOR_KEY);

    /*
      SI COOKIE EXISTE
      RESTAURAR LOCALSTORAGE
    */

    if (visitorId) {
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
  }

  /*
    SI NO EXISTE
    EN NINGÚN LADO
  */

  if (!visitorId) {
    visitorId = crypto.randomUUID();

    /*
      GUARDAR EN
      LOCALSTORAGE
    */

    localStorage.setItem(VISITOR_KEY, visitorId);

    /*
      GUARDAR EN
      COOKIE
    */

    setCookie(VISITOR_KEY, visitorId, COOKIE_DAYS);
  }

  return visitorId;
}
