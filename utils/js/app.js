// ========================
// DOM ELEMENTS — VARIABLES
// ========================
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

// ==============
// DATA MODEL
// ==============
// Simple in-memory array for now
let cards = [
  {
    id: Date.now(),
    front: "What is a variable?",
    back: "A container that stores a value.",
  },
];

let currentIndex = 0;
let editingCardId = null; // null = creating, not editing

// ========================
// HELPER: RENDER FUNCTIONS
// ========================
function showCard(index) {
  if (cards.length === 0) {
    cardElement.classList.remove("is-flipped");
    cardFrontEl.textContent = "No cards yet.";
    cardBackEl.textContent = "Use 'New Card' to add one.";
    currentIndex = 0;
    return;
  }

  // Clamp/wrap index
  if (index < 0) index = cards.length - 1;
  if (index >= cards.length) index = 0;

  currentIndex = index;

  // Reset flip state to avoid desync
  cardElement.classList.remove("is-flipped");

  const card = cards[currentIndex];
  cardFrontEl.textContent = card.front;
  cardBackEl.textContent = card.back;
}

// Render card list for editing/deleting (delegated events)
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

// ========================
// CARD FLIP LOGIC
// ========================
flipBtn.addEventListener("click", () => {
  // Flip current card
  cardElement.classList.toggle("is-flipped");
});

// Prev / Next navigation
prevBtn.addEventListener("click", () => {
  showCard(currentIndex - 1);
});

nextBtn.addEventListener("click", () => {
  showCard(currentIndex + 1);
});

// ========================
// MODAL — OPEN & CLOSE
// ========================
function openCardModal(mode = "create", cardId = null) {
  lastFocusedElement = document.activeElement;
  cardModalOverlay.classList.remove("hidden");
  cardModalOverlay.setAttribute("aria-hidden", "false");

  // Setup for create vs edit
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

// Open via header button
newCardBtn.addEventListener("click", () => openCardModal("create"));

// Cancel button
cancelCardModalBtn.addEventListener("click", closeCardModal);

// ESC close
cardModalOverlay.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCardModal();
  }
});

// ========================
// FOCUS TRAP (reusable)
// ========================
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
      // SHIFT + TAB
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // TAB
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// ========================
// CARD FORM SUBMIT (CREATE / EDIT)
// ========================
cardForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const front = cardFrontInput.value.trim();
  const back = cardBackInput.value.trim();
  if (!front || !back) return;

  if (editingCardId === null) {
    // CREATE
    const newCard = {
      id: Date.now() + Math.floor(Math.random() * 1000), // unique enough for demo
      front,
      back,
    };
    cards.push(newCard);
    currentIndex = cards.length - 1; // jump to new card
  } else {
    // EDIT
    const target = cards.find((c) => c.id === editingCardId);
    if (target) {
      target.front = front;
      target.back = back;
    }
  }

  renderCardList();
  showCard(currentIndex);
  closeCardModal();
});

// ========================
// CARD LIST — DELEGATED EVENTS
// ========================
if (cardListEl) {
  cardListEl.addEventListener("click", (e) => {
    const li = e.target.closest(".card-list-item");
    if (!li) return;

    const cardId = Number(li.dataset.cardId);
    if (!cardId) return;

    if (e.target.classList.contains("card-edit-btn")) {
      // EDIT
      openCardModal("edit", cardId);
    } else if (e.target.classList.contains("card-delete-btn")) {
      // DELETE
      const confirmDelete = confirm("Delete this card?");
      if (!confirmDelete) return;

      const idx = cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        cards.splice(idx, 1);
      }

      // Adjust currentIndex if needed
      if (currentIndex >= cards.length) {
        currentIndex = cards.length - 1;
      }
      if (currentIndex < 0) currentIndex = 0;

      renderCardList();
      showCard(currentIndex);
    } else if (e.target.classList.contains("card-preview-btn")) {
      // Jump to selected card in study mode
      const idx = cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        showCard(idx);
      }
    }
  });
}

// ========================
// INIT
// ========================
renderCardList();
showCard(currentIndex);
