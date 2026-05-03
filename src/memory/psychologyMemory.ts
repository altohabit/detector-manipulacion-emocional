export interface MemoryItem {

  userMessage: string;

  detection: string;

  timestamp: number;

}

const MEMORY_KEY =
  "psychology_memory";

export function saveMemory(
  item: MemoryItem
) {

  const currentMemory =
    getMemory();

  currentMemory.push(item);

  /*
    SOLO GUARDAR
    LOS ÚLTIMOS 5
  */

  const limitedMemory =
    currentMemory.slice(-5);

  localStorage.setItem(
    MEMORY_KEY,
    JSON.stringify(
      limitedMemory
    )
  );

}

export function getMemory():
  MemoryItem[] {

  if (
    typeof window ===
    "undefined"
  ) {

    return [];

  }

  const memory =
    localStorage.getItem(
      MEMORY_KEY
    );

  if (!memory) {

    return [];

  }

  try {

    return JSON.parse(memory);

  } catch {

    return [];

  }

}

export function clearMemory() {

  localStorage.removeItem(
    MEMORY_KEY
  );

}