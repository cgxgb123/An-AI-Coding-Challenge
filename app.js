const flashcard = document.querySelector(".flashcard");
const flipBtn = document.getElementById("flip-card");
const newCardBtn = document.getElementById("new-card-btn");

flipBtn.addEventListener("click", () => {
  flashcard.classList.toggle("flipped");
});
