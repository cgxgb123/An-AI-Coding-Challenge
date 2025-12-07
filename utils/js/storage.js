const STORAGE_KEY = "flashcards_app_state";
const STORAGE_VERSION = 1;

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();

    const parsed = JSON.parse(raw);

    if (!parsed.version || parsed.version !== STORAGE_VERSION) {
      return getInitialState();
    }

    return parsed.data;
  } catch (err) {
    return getInitialState();
  }
}

export function saveState(state) {
  try {
    const payload = {
      version: STORAGE_VERSION,
      data: state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {}
}

function getInitialState() {
  return {
    cards: [
      {
        id: Date.now(),
        front: "What is a variable?",
        back: "A container that stores a value.",
      },
    ],
  };
}
