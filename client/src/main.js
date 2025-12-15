import axios from "axios";

// ========================================
// DOM-ELEMENT
// ========================================
const form = document.querySelector(".review-form");
const submitBtn = document.querySelector("button[type='submit']");

const API_URL = "http://localhost:3000";

/**
 * Kontrollerar om alla formulärfält är ifyllda
 */
const checkInputs = () => {
  const bookTitle = form.elements.bookTitle.value;
  const author = form.elements.author.value;
  const reviewer = form.elements.reviewer.value;
  const rating = form.elements.rating.value;
  const review = form.elements.review.value;

  if (
    !bookTitle ||
    !author ||
    !reviewer ||
    rating < 0 ||
    rating > 5 ||
    !review
  ) {
    submitBtn.disabled = true;
  } else {
    submitBtn.disabled = false;
  }
};

/**
 * Skapar HTML för stjärnbetyg
 */
const createStars = (rating) => {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<span class="star">⭐</span>';
    } else {
      stars += '<span class="star empty">☆</span>';
    }
  }
  return stars;
};

/**
 * Visar alla recensioner på sidan
 */
const displayReviews = (reviews) => {
  const reviewsContainer = document.querySelector(".reviews");
  reviewsContainer.innerHTML = "";

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = `
      <div class="empty-state">
        <h3>Inga recensioner ännu</h3>
        <p>Bli den första att skriva en recension!</p>
      </div>
    `;
    return;
  }

  reviews.forEach((review) => {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "review";

    console.log(review.timestamp);

    const date = new Date(review.timestamp).toLocaleDateString("sv-SE");
    const stars = createStars(review.rating);

    reviewDiv.innerHTML = `
      <div class="review-header">
        <div class="book-info">
          <h3>${review.bookTitle}</h3>
          <p class="book-author">av ${review.author}</p>
        </div>
        <div class="rating">${stars}</div>
      </div>
      <div class="review-meta">
        <span class="reviewer">Recensent: ${review.reviewer}</span>
        <span class="date">${date}</span>
      </div>
      <p class="review-content">${review.review}</p>
      <button class="delete-btn" data-id="${review.id}">🗑️ Radera</button>
    `;

    reviewsContainer.appendChild(reviewDiv);
  });

  addDeleteEventListeners();
};

/**
 * Hanterar radering av en recension
 */
const handleDelete = async (e) => {
  const reviewId = e.target.dataset.id;

  try {
    // Skicka DELETE-request till servern och lägg till ID:t i URL:en
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`);

    if (response.data.success) {
      alert("Recension raderades!");

      // Ladda om alla recensioner för att visa den uppdaterade versionen
      loadReviews();
    } else {
      alert("Kunde ej radera recension!");
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      alert("Recension hittades inte");
    } else {
      alert("Kunde ej radera recension!");
    }
  }
};

/**
 * Hämtar och visar alla recensioner från servern
 */
const loadReviews = async () => {
  try {
    const response = await axios.get(`${API_URL}/reviews`);

    console.log({ response: response.data.data });

    displayReviews(response.data.data);
  } catch (error) {
    alert("Kunde ej hämta recensioner");
  }
};

const addDeleteEventListeners = () => {
  // Hitta alla knappar med klassen delete-btn
  const deleteButtons = document.querySelectorAll(".delete-btn");

  // Lägg till en klick-lyssnare på varje knapp
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", handleDelete);
  });

  // for (let i = 0; i <= deleteButtons.length; i++) {
  //   btn.addEventListener("click", handleDelete);
  // }
};

/**
 * Lyssna på ändringar i formuläret
 */
form.addEventListener("input", checkInputs);

/**
 * Hanterar när formuläret skickas
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let bookTitle = form.elements.bookTitle.value;
  let author = form.elements.author.value;
  let reviewer = form.elements.reviewer.value;
  let rating = form.elements.rating.value;
  let review = form.elements.review.value;

  if (!bookTitle || !author || !reviewer || rating < 0 || rating > 5 || !review)
    return alert("Fyll i alla fält!");

  const bookData = {
    bookTitle,
    author,
    reviewer,
    rating,
    review,
  };

  try {
    const response = await axios.post(
      "http://localhost:3000/save-review",
      bookData
    );

    if (response.status === 201) {
      alert("Meddelandet sparades!");
      form.reset();
    } else {
      alert("Meddelandet kunde ej sparas!");
    }
  } catch (error) {
    console.log(error);

    alert("Meddelandet kunde ej sparas!");
  }

  // TODO: Hämta alla värden från formuläret
  // TODO: Skapa ett reviewData-objekt
  // TODO: Skicka POST-request till backend
  // TODO: Om det lyckas: visa meddelande, rensa formuläret, ladda om recensioner
  // TODO: Hantera fel
});

/**
 * Laddar recensioner när sidan laddas
 */
window.addEventListener("load", async () => {
  loadReviews();
});
