const flashcard = document.querySelector(".flashcard");
const flipBtn = document.getElementById("flip-card");
const newCardBtn = document.getElementById("new-card-btn");
const modalOverlay = document.getElementById("deck-modal-overlay");
const form = document.getElementById("deck-form");
const deckNameInput = document.getElementById("deck-name");
const cancelBtn = document.getElementById("cancel-modal");

let lastFocusedElement = null;

flipBtn.addEventListener("click", () => {
  flashcard.classList.toggle("flipped");
});

// ========================
// MODAL — OPEN & CLOSE
// ========================

// Open modal
function openDeckModal() {
  lastFocusedElement = document.activeElement;

  modalOverlay.classList.remove("hidden");
  modalOverlay.setAttribute("aria-hidden", "false");

  // Move focus inside modal
  deckNameInput.focus();

  trapFocus(modalOverlay);
}

// Close modal
function closeDeckModal() {
  modalOverlay.classList.add("hidden");
  modalOverlay.setAttribute("aria-hidden", "true");

  // Return focus to whatever opened the modal
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

// Open via button
newCardBtn.addEventListener("click", openDeckModal);

// Cancel button
cancelBtn.addEventListener("click", closeDeckModal);

// ESC close
modalOverlay.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDeckModal();
  }
});

// ========================
// FOCUS TRAP (keyboard-only safe)
// ========================
function trapFocus(container) {
  const focusable = container.querySelectorAll(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  );

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
// FORM SUBMIT (placeholder)
// ========================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  console.log("Deck name:", deckNameInput.value);

  // Add your CRUD logic next
  deckNameInput.value = "";
  closeDeckModal();
});
