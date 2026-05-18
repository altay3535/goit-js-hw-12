import axios from "axios";
import "./styles.css";

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

// ELEMENTLER
const searchForm = document.querySelector("#search-form");
const gallery = document.querySelector(".gallery");
const loader = document.querySelector(".loader");
const loadMoreBtn = document.querySelector(".load-more");
const loadText = document.querySelector(".load-text");


// STATE
let page = 1;
let query = "";
let totalPages = 0;

// LIGHTBOX
const lightbox = new SimpleLightbox(".gallery a", {
  captionsData: "alt",
  captionDelay: 250,
  overlayOpacity: 0.8,
  showCounter: true,
});

// API
async function fetchImages(userInput, page = 1) {
  const API_KEY = "9502846-e36776c567c382242bf5ffcec";

  const response = await axios.get("https://pixabay.com/api/", {
    params: {
      key: API_KEY,
      q: userInput,
      image_type: "photo",
      orientation: "horizontal",
      safesearch: true,
      page,
      per_page: 40,
    },
  });

  return response.data;
}

// RENDER
function renderImages(images) {
  const markup = images
    .map(
      (image) => `
      <li class="gallery-item">
        <a class="gallery-link" href="${image.largeImageURL}">
          <img
            class="gallery-image"
            src="${image.webformatURL}"
            alt="${image.tags}"
          />
        </a>

        <div class="info">
          <p><b>Likes</b> ${image.likes}</p>
          <p><b>Views</b> ${image.views}</p>
          <p><b>Comments</b> ${image.comments}</p>
          <p><b>Downloads</b> ${image.downloads}</p>
        </div>
      </li>
    `
    )
    .join("");

  gallery.insertAdjacentHTML("beforeend", markup);
  lightbox.refresh();
}

// SUBMIT
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  query = event.target.elements.query.value.trim();
  page = 1;
  gallery.innerHTML = "";
  loadMoreBtn.classList.add("is-hidden");
  loadText.style.display = "none";

  if (!query) {
    iziToast.warning({
      message: "Please enter a search query.",
      position: "topRight",
    });
    return;
  }

  loader.classList.remove("is-hidden");

  try {
    const data = await fetchImages(query, page);

    if (data.hits.length === 0) {
      iziToast.error({
        message: "No images found!",
        position: "topRight",
      });
      return;
    }

    totalPages = Math.ceil(data.totalHits / 40);

    renderImages(data.hits);

    if (page < totalPages) {
      loadMoreBtn.classList.remove("is-hidden");
    }
  } catch (error) {
    console.log(error);
  } finally {
    loader.classList.add("is-hidden");
    searchForm.reset();
  }
});



// LOAD MORE
loadMoreBtn.addEventListener("click", async () => {

  if (page >= totalPages) {
    loadText.style.display = "block";
    loadMoreBtn.classList.add("is-hidden");

    iziToast.info({
      message: "We're sorry, but you've reached the end of search results",
      position: "topRight",
    });

    return;
  }

  loadText.classList.remove("is-hidden");
  loadMoreBtn.classList.add("is-hidden");

  page++;

  try {
    const data = await fetchImages(query, page);

    renderImages(data.hits);
    lightbox.refresh();

    const cards = document.querySelectorAll(".gallery-item");
    const cardHeight = cards[0].getBoundingClientRect().height;

    window.scrollBy({
      top: cardHeight * 2,
      behavior: "smooth",
    });

    if (page < totalPages) {
      loadMoreBtn.classList.remove("is-hidden");
    }

  } catch (error) {
    console.log(error);
  } finally {
    loadText.classList.add("is-hidden");
  }
});