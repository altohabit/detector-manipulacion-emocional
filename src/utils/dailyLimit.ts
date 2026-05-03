const STORAGE_KEY = "daily_usage_data";

const DAILY_LIMIT = 3;

function getTodayDate() {

  const now = new Date();

  const colombiaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
  }).format(now);

  return colombiaDate;
}

export function getRemainingQueries() {

  const rawData = localStorage.getItem(STORAGE_KEY);

  if (!rawData) {

    const initialData = {
      date: getTodayDate(),
      used: 0,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialData)
    );

    return DAILY_LIMIT;
  }

  const parsedData = JSON.parse(rawData);

  const today = getTodayDate();

  if (parsedData.date !== today) {

    const resetData = {
      date: today,
      used: 0,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(resetData)
    );

    return DAILY_LIMIT;
  }

  return DAILY_LIMIT - parsedData.used;
}

export function consumeQuery() {

  const rawData = localStorage.getItem(STORAGE_KEY);

  if (!rawData) return;

  const parsedData = JSON.parse(rawData);

  parsedData.used += 1;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(parsedData)
  );
}