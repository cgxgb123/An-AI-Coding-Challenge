const cardElement = document.getElementById("study-card");
const cardFrontEl = document.querySelector(".card-front");
const cardBackEl = document.querySelector(".card-back");
const flipBtn = document.getElementById("flip-card");
const prevBtn = document.getElementById("prev-card");
const nextBtn = document.getElementById("next-card");
const newCardBtn = document.getElementById("new-card-btn");
const cardModalOverlay = document.getElementById("card-modal-overlay");
const cardForm = document.getElementById("card-form");
const cardFrontInput = document.getElementById("card-front-input");
const cardBackInput = document.getElementById("card-back-input");
const cancelCardModalBtn = document.getElementById("cancel-card-modal");
const cardModalTitle = document.getElementById("card-modal-title");
const cardListEl = document.getElementById("card-list");

let lastFocusedElement = null;

let cards = [
  {
    id: Date.now(),
    front: "What is a variable?",
    back: "A container that stores a value.",
  },
];

let currentIndex = 0;
let editingCardId = null;

function renderCurrentCard() {
  if (cards.length === 0) {
    cardElement.classList.remove("is-flipped");
    cardFrontEl.textContent = "No cards yet.";
    cardBackEl.textContent = "Use 'New Card' to add one.";
    return;
  }

  if (currentIndex < 0) currentIndex = cards.length - 1;
  if (currentIndex >= cards.length) currentIndex = 0;

  cardElement.classList.remove("is-flipped");

  const card = cards[currentIndex];
  cardFrontEl.textContent = card.front;
  cardBackEl.textContent = card.back;
}

function renderCardList() {
  if (!cardListEl) return;
  cardListEl.innerHTML = cards
    .map(
      (card) => `
      <li class="card-list-item" data-card-id="${card.id}">
        <button class="card-preview-btn" type="button">
          ${
            card.front.length > 40
              ? card.front.slice(0, 37) + "..."
              : card.front
          }
        </button>
        <button class="btn card-edit-btn" type="button">Edit</button>
        <button class="btn card-delete-btn" type="button">Delete</button>
      </li>
    `
    )
    .join("");
}

function openCardModal(mode = "create", cardId = null) {
  lastFocusedElement = document.activeElement;
  cardModalOverlay.classList.remove("hidden");
  cardModalOverlay.setAttribute("aria-hidden", "false");

  if (mode === "edit" && cardId != null) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    editingCardId = card.id;
    cardModalTitle.textContent = "Edit Card";
    cardFrontInput.value = card.front;
    cardBackInput.value = card.back;
  } else {
    editingCardId = null;
    cardModalTitle.textContent = "New Card";
    cardFrontInput.value = "";
    cardBackInput.value = "";
  }

  cardFrontInput.focus();
  trapFocus(cardModalOverlay);
}

function closeCardModal() {
  cardModalOverlay.classList.add("hidden");
  cardModalOverlay.setAttribute("aria-hidden", "true");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function trapFocus(container) {
  const focusable = container.querySelectorAll(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  );
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  container.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

flipBtn.addEventListener("click", () => {
  cardElement.classList.toggle("is-flipped");
});

prevBtn.addEventListener("click", () => {
  if (cards.length === 0) return;
  currentIndex -= 1;
  renderCurrentCard();
});

nextBtn.addEventListener("click", () => {
  if (cards.length === 0) return;
  currentIndex += 1;
  renderCurrentCard();
});

newCardBtn.addEventListener("click", () => openCardModal("create"));

cancelCardModalBtn.addEventListener("click", closeCardModal);

cardModalOverlay.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCardModal();
  }
});

cardForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const front = cardFrontInput.value.trim();
  const back = cardBackInput.value.trim();
  if (!front || !back) return;

  if (editingCardId === null) {
    const newCard = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      front,
      back,
    };
    cards.push(newCard);
    currentIndex = cards.length - 1;
  } else {
    const target = cards.find((c) => c.id === editingCardId);
    if (target) {
      target.front = front;
      target.back = back;
    }
  }

  renderCardList();
  renderCurrentCard();
  closeCardModal();
});

if (cardListEl) {
  cardListEl.addEventListener("click", (e) => {
    const li = e.target.closest(".card-list-item");
    if (!li) return;

    const cardId = Number(li.dataset.cardId);
    if (!cardId) return;

    if (e.target.classList.contains("card-edit-btn")) {
      openCardModal("edit", cardId);
    } else if (e.target.classList.contains("card-delete-btn")) {
      const confirmDelete = confirm("Delete this card?");
      if (!confirmDelete) return;

      const idx = cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        cards.splice(idx, 1);
      }

      if (currentIndex >= cards.length) {
        currentIndex = cards.length - 1;
      }
      if (currentIndex < 0) currentIndex = 0;

      renderCardList();
      renderCurrentCard();
    } else if (e.target.classList.contains("card-preview-btn")) {
      const idx = cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        currentIndex = idx;
        renderCurrentCard();
      }
    }
  });
}

document.addEventListener("keydown", (e) => {
  const modalOpen = !cardModalOverlay.classList.contains("hidden");

  if (modalOpen) return;

  if (e.key === " ") {
    e.preventDefault();
    cardElement.classList.toggle("is-flipped");
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    nextBtn.click();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    prevBtn.click();
  }
});

//
// =============================
// STUDY MODE — SINGLE DECK VERSION
// =============================
//

const studySession = {
  active: false,
  index: 0,
  keyHandler: null,
  order: [],
};

function enterStudyMode(deckId = null) {
  exitStudyMode(); // important — prevents duplicate listeners

  studySession.active = true;

  // build a randomized order of card indices
  studySession.order = shuffleArray([...Array(cards.length).keys()]);
  studySession.index = 0;

  renderStudyCard(0);

  studySession.keyHandler = handleStudyKeys;
  document.addEventListener("keydown", studySession.keyHandler);
}

function exitStudyMode() {
  if (!studySession.active) return;

  studySession.active = false;
  studySession.index = 0;
  studySession.order = [];

  if (studySession.keyHandler) {
    document.removeEventListener("keydown", studySession.keyHandler);
    studySession.keyHandler = null;
  }

  cardElement.classList.remove("is-flipped");
}

function renderStudyCard(index) {
  if (!studySession.active || cards.length === 0) return;

  if (index < 0) index = studySession.order.length - 1;
  if (index >= studySession.order.length) index = 0;

  studySession.index = index;

  cardElement.classList.remove("is-flipped");

  const cardIndex = studySession.order[studySession.index];
  const card = cards[cardIndex];

  cardFrontEl.textContent = card.front;
  cardBackEl.textContent = card.back;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function handleStudyKeys(e) {
  if (!studySession.active) return;

  switch (e.key) {
    case " ":
      e.preventDefault();
      cardElement.classList.toggle("is-flipped");
      break;

    case "ArrowRight":
      e.preventDefault();
      renderStudyCard(studySession.index + 1);
      break;

    case "ArrowLeft":
      e.preventDefault();
      renderStudyCard(studySession.index - 1);
      break;

    case "s":
    case "S":
      e.preventDefault();
      studySession.order = shuffleArray(studySession.order);
      studySession.index = 0;
      renderStudyCard(0);
      break;

    case "Escape":
      e.preventDefault();
      exitStudyMode();
      break;
  }
}

document.querySelectorAll(".deck-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    enterStudyMode();
  });
});

renderCardList();
renderCurrentCard();
