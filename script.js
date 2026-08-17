/* =========================================================
   CODEBRIEL MOVIES
   TMDB Movie Discovery Application
   ========================================================= */


/* =========================================================
   TMDB CONFIGURATION
   ========================================================= */

const TMDB_API_KEY = "9a06a5ac2182abb47831b0b366bdbe60";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const BACKDROP_BASE_URL =
    "https://image.tmdb.org/t/p/w1280";


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let currentPage = 1;

let currentQuery = "";

let currentGenre = null;

let currentMovies = [];

let isLoading = false;

let favorites =
    JSON.parse(localStorage.getItem("codebrielFavorites")) || [];


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const featuredMovies =
    document.getElementById("featured-movies");

const movieGrid =
    document.getElementById("movie-grid");

const loadingState =
    document.getElementById("loading-state");

const emptyState =
    document.getElementById("empty-state");

const searchToggle =
    document.getElementById("search-toggle");

const searchPanel =
    document.getElementById("search-panel");

const searchInput =
    document.getElementById("search-input");

const closeSearch =
    document.getElementById("close-search");

const menuButton =
    document.getElementById("menu-btn");

const navLinks =
    document.querySelector(".nav-links");

const randomMovieButton =
    document.getElementById("random-movie-btn");

const favoritesButton =
    document.getElementById("favorites-btn");

const favoritesSection =
    document.getElementById("favorites-section");

const favoritesGrid =
    document.getElementById("favorites-grid");

const favoritesEmpty =
    document.getElementById("favorites-empty");

const backToMovies =
    document.getElementById("back-to-movies");

/* =========================================================
   MODAL ELEMENTS
   ========================================================= */

const movieModal =
    document.getElementById("movie-modal");

const modalOverlay =
    document.getElementById("modal-overlay");

const modalClose =
    document.getElementById("modal-close");

const modalCloseButton =
    document.getElementById("modal-close-btn");

const modalBackdrop =
    document.getElementById("modal-backdrop");

const modalPoster =
    document.getElementById("modal-poster-image");

const modalTitle =
    document.getElementById("modal-title");

const modalGenre =
    document.getElementById("modal-genre");

const modalYear =
    document.getElementById("modal-year");

const modalRating =
    document.getElementById("modal-rating");

const modalOverview =
    document.getElementById("modal-overview");

const modalFavorite =
    document.getElementById("modal-favorite");

const modalWatch =
    document.getElementById("modal-watch");

/* =========================================================
   API ENDPOINTS
   ========================================================= */

function apiUrl(endpoint, parameters = {}) {

    const url =
        new URL(
            `${TMDB_BASE_URL}${endpoint}`
        );

    url.searchParams.set(
        "api_key",
        TMDB_API_KEY
    );

    url.searchParams.set(
        "language",
        "en-US"
    );


    Object.entries(parameters).forEach(
        ([key, value]) => {

            if (
                value !== null &&
                value !== undefined
            ) {

                url.searchParams.set(
                    key,
                    value
                );

            }

        }
    );


    return url.toString();

}


/* =========================================================
   FETCH API
   ========================================================= */

async function fetchData(url) {

    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `TMDB Error: ${response.status}`
            );

        }


        return await response.json();

    }

    catch (error) {

        console.error(
            "TMDB API Error:",
            error
        );

        return null;

    }

}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApplication();

    }
);


async function initializeApplication() {

    setupSearch();

    setupNavigation();

    setupModal();

    setupRandomMovie();

    setupGenreButtons();

    setupFilterButtons();

    setupFavorites();

    loadFeaturedMovies();

    loadPopularMovies();

    loadGenres();

    loadHeroMovies();

}


/* =========================================================
   FEATURED MOVIES
   ========================================================= */

async function loadFeaturedMovies() {

    if (!featuredMovies) {
        return;
    }


    const data =
        await fetchData(
            apiUrl(
                "/trending/movie/week"
            )
        );


    if (!data || !data.results) {
        return;
    }


    featuredMovies.innerHTML = "";


    data.results
        .slice(0, 8)
        .forEach(movie => {

            featuredMovies.appendChild(
                createMovieCard(movie)
            );

        });

}


/* =========================================================
   POPULAR MOVIES
   ========================================================= */

async function loadPopularMovies(
    append = false
) {

    if (isLoading) {
        return;
    }


    isLoading = true;


    if (!append) {

        currentPage = 1;

        currentMovies = [];

        showLoading();

    }


    let endpoint =
        "/movie/popular";


    let parameters = {

        page: currentPage

    };


    /* SEARCH */

    if (currentQuery) {

        endpoint = "/search/movie";

        parameters.query =
            currentQuery;

        parameters.page =
            currentPage;

        parameters.include_adult =
            false;

    }


    /* GENRE */

    else if (currentGenre) {

        endpoint =
            "/discover/movie";

        parameters.with_genres =
            currentGenre;

        parameters.sort_by =
            "popularity.desc";

        parameters.page =
            currentPage;

    }


    const data =
        await fetchData(
            apiUrl(
                endpoint,
                parameters
            )
        );


    hideLoading();


    if (
        !data ||
        !data.results
    ) {

        showEmptyState();

        isLoading = false;

        return;

    }


    if (!append) {

        movieGrid.innerHTML = "";

    }


    const movies =
        data.results;


    currentMovies =
        currentMovies.concat(
            movies
        );


    if (movies.length === 0) {

        showEmptyState();

        isLoading = false;

        return;

    }


    hideEmptyState();


    movies.forEach(movie => {

        movieGrid.appendChild(
            createMovieCard(movie)
        );

    });


    currentPage++;


    isLoading = false;


    addLoadMoreButton(
        data.page,
        data.total_pages
    );

}


/* =========================================================
   MOVIE CARD
   ========================================================= */

function createMovieCard(movie) {

    const card =
        document.createElement("article");


    card.className =
        "movie-card";


    const poster =
        movie.poster_path
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : "";


    const year =
        movie.release_date
            ? movie.release_date.substring(
                0,
                4
            )
            : "N/A";


    const rating =
        movie.vote_average
            ? movie.vote_average.toFixed(
                1
            )
            : "N/A";


    const isFavorite =
        favorites.includes(
            movie.id
        );


    card.innerHTML = `

        <div class="movie-poster">

            <img
                src="${poster || "https://placehold.co/500x750/0e1a2a/94a3b8?text=No+Poster"}"
                alt="${escapeHTML(movie.title)}"
                loading="lazy"
                onerror="this.onerror=null; this.src='https://placehold.co/500x750/0e1a2a/94a3b8?text=No+Poster';"
            >

            <button
                class="card-favorite ${isFavorite ? "active" : ""}"
                aria-label="Add ${escapeHTML(movie.title)} to favorites"
            >

                <i data-lucide="heart"></i>

            </button>

        </div>


        <div class="movie-info">

            <h3 class="movie-title">

                ${escapeHTML(movie.title)}

            </h3>


            <div class="movie-meta">

                <span>

                    ${year}

                </span>


                <span class="movie-rating">

                    <i data-lucide="star"></i>

                    ${rating}

                </span>

            </div>

        </div>

    `;


    const favoriteButton =
        card.querySelector(
            ".card-favorite"
        );


    favoriteButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleFavorite(
                movie,
                favoriteButton
            );

        }
    );


    card.addEventListener(
        "click",
        () => {

            openMovieDetails(
                movie
            );

        }
    );


    setTimeout(
        () => {

            if (
                typeof lucide !==
                "undefined"
            ) {

                lucide.createIcons();

            }

        },
        0
    );


    return card;

}


/* =========================================================
   MOVIE DETAILS
   ========================================================= */

function openMovieDetails(movie) {

    if (!movieModal) {
        return;
    }


    /* POSTER */

    if (movie.poster_path) {

        modalPoster.src =
            `${IMAGE_BASE_URL}${movie.poster_path}`;

    }

    else {

        modalPoster.src =
            "https://via.placeholder.com/500x750?text=No+Poster";

    }


    modalPoster.alt =
        `${movie.title} poster`;


    /* BACKDROP */

    if (movie.backdrop_path) {

        modalBackdrop.style.backgroundImage =
            `linear-gradient(
                to bottom,
                rgba(15,23,42,0.1),
                rgba(15,23,42,0.95)
            ),
            url("${BACKDROP_BASE_URL}${movie.backdrop_path}")`;

    }

    else {

        modalBackdrop.style.backgroundImage =
            "none";

    }


    /* TITLE */

    modalTitle.textContent =
        movie.title ||
        "Untitled Movie";


    /* YEAR */

    modalYear.textContent =
        movie.release_date
            ? movie.release_date.substring(
                0,
                4
            )
            : "N/A";


    /* RATING */

    modalRating.textContent =
        movie.vote_average
            ? movie.vote_average.toFixed(
                1
            )
            : "N/A";


    /* OVERVIEW */

    modalOverview.textContent =
        movie.overview ||
        "No overview is available for this movie.";


    /* GENRES */

    if (
        movie.genre_ids &&
        movie.genre_ids.length
    ) {

        modalGenre.textContent =
            getGenreNames(
                movie.genre_ids
            ).join(" • ");

    }

    else {

        modalGenre.textContent =
            "Movie";

    }


    updateFavoriteButton(
        movie
    );


    movieModal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "no-scroll"
    );


    if (
        typeof lucide !==
        "undefined"
    ) {

        lucide.createIcons();

    }

    if (modalWatch) {

    const searchTitle =
        encodeURIComponent(
            movie.title || ""
        );

    modalWatch.href =
        `https://www.google.com/search?q=${searchTitle}+where+to+watch`;

    }
    
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeMovieModal() {

    movieModal.classList.add(
        "hidden"
    );

    document.body.classList.remove(
        "no-scroll"
    );

}


function setupModal() {

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeMovieModal
        );

    }


    if (modalCloseButton) {

        modalCloseButton.addEventListener(
            "click",
            closeMovieModal
        );

    }


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeMovieModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !movieModal.classList.contains(
                    "hidden"
                )
            ) {

                closeMovieModal();

            }

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    if (!searchToggle) {
        return;
    }


    searchToggle.addEventListener(
        "click",
        () => {

            searchPanel.classList.toggle(
                "open"
            );


            if (
                searchPanel.classList.contains(
                    "open"
                )
            ) {

                searchInput.focus();

            }

        }
    );


    if (closeSearch) {

        closeSearch.addEventListener(
            "click",
            () => {

                searchPanel.classList.remove(
                    "open"
                );

                searchInput.value = "";

                currentQuery = "";

                loadPopularMovies();

            }
        );

    }


    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                const query =
                    searchInput.value.trim();


                if (query) {

                    currentQuery =
                        query;

                    currentGenre =
                        null;

                    loadPopularMovies();

                    document
                        .getElementById(
                            "all-movies"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }

            }

        }
    );

}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function setupNavigation() {

    if (!menuButton) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "mobile-open"
            );

        }
    );


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    navLinks.classList.remove(
                        "mobile-open"
                    );

                }
            );

        });

}


/* =========================================================
   RANDOM MOVIE
   ========================================================= */

function setupRandomMovie() {

    if (!randomMovieButton) {
        return;
    }


    randomMovieButton.addEventListener(
        "click",
        async () => {

            randomMovieButton.disabled =
                true;


            const randomPage =
                Math.floor(
                    Math.random() * 5
                ) + 1;


            const data =
                await fetchData(
                    apiUrl(
                        "/movie/popular",
                        {
                            page:
                                randomPage
                        }
                    )
                );


            randomMovieButton.disabled =
                false;


            if (
                data &&
                data.results &&
                data.results.length
            ) {

                const randomMovie =
                    data.results[
                        Math.floor(
                            Math.random() *
                            data.results.length
                        )
                    ];


                openMovieDetails(
                    randomMovie
                );

            }

        }
    );

}


/* =========================================================
   GENRES
   ========================================================= */

let genreMap = {};


async function loadGenres() {

    const data =
        await fetchData(
            apiUrl(
                "/genre/movie/list"
            )
        );


    if (
        !data ||
        !data.genres
    ) {

        return;

    }


    genreMap = {};


    data.genres.forEach(
        genre => {

            genreMap[
                genre.id
            ] = genre.name;

        }
    );


    createGenreButtons(
        data.genres
    );

}


function createGenreButtons(
    genres
) {

    const genreGrid =
        document.querySelector(
            ".genre-grid"
        );


    if (!genreGrid) {
        return;
    }


    genreGrid.innerHTML = "";


    genres.forEach(
        genre => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "genre-card";


            button.dataset.genreId =
                genre.id;


            button.innerHTML = `

                <span class="genre-icon">

                    <i data-lucide="film"></i>

                </span>


                <span>

                    ${escapeHTML(
                        genre.name
                    )}

                </span>


                <i data-lucide="arrow-up-right"></i>

            `;


            button.addEventListener(
                "click",
                () => {

                    currentGenre =
                        genre.id;

                    currentQuery =
                        "";

                    searchInput.value =
                        "";

                    loadPopularMovies();


                    document
                        .getElementById(
                            "all-movies"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                }
            );


            genreGrid.appendChild(
                button
            );

        }
    );


    if (
        typeof lucide !==
        "undefined"
    ) {

        lucide.createIcons();

    }

}


/* =========================================================
   GENRE NAME HELPER
   ========================================================= */

function getGenreNames(
    genreIds
) {

    return genreIds
        .map(
            id =>
                genreMap[id]
        )
        .filter(Boolean);

}


/* =========================================================
   OLD MANUAL GENRE BUTTONS
   ========================================================= */

function setupGenreButtons() {

    /*
       The genre buttons are now generated
       dynamically from TMDB.

       This function remains intentionally
       lightweight for compatibility.
    */

}


/* =========================================================
   FILTER BUTTONS
   ========================================================= */

function setupFilterButtons() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );


    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filterButtons
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    const filter =
                        button.dataset.filter;


                    if (
                        filter ===
                        "all"
                    ) {

                        currentGenre =
                            null;

                        currentQuery =
                            "";

                        loadPopularMovies();

                        return;

                    }


                    const genreId =
                        findGenreId(
                            filter
                        );


                    if (genreId) {

                        currentGenre =
                            genreId;

                        currentQuery =
                            "";

                        loadPopularMovies();

                    }

                }
            );

        }
    );

}


function findGenreId(
    name
) {

    const normalized =
        name.toLowerCase();


    for (
        const id in genreMap
    ) {

        if (
            genreMap[id]
                .toLowerCase() ===
            normalized
        ) {

            return id;

        }

    }


    return null;

}


/* =========================================================
   FAVORITES
   ========================================================= */

function setupFavorites() {

    if (favoritesButton) {

        favoritesButton.addEventListener(
            "click",
            () => {

                showFavorites();

            }
        );

    }


    if (modalFavorite) {

        modalFavorite.addEventListener(
            "click",
            () => {

                const movieId =
                    Number(
                        modalFavorite.dataset.movieId
                    );

                const movie =
                    currentMovies.find(
                        item =>
                            item.id === movieId
                    );

                if (movie) {

                    toggleFavorite(movie);

                }

            }
        );

    }


    const footerFavorites =
        document.querySelector(
            '.footer-links a[href="#favorites"]'
        );

    if (footerFavorites) {

        footerFavorites.addEventListener(
            "click",
            event => {

                event.preventDefault();

                showFavorites();

            }
        );

    }

}

function showFavorites() {

    if (!favoritesSection) {
        return;
    }

    document
        .querySelectorAll("main > section")
        .forEach(section => {

            if (
                section.id !==
                "favorites-section"
            ) {

                section.classList.add("hidden");

            }

        });


    favoritesSection.classList.remove(
        "hidden"
    );


    renderFavorites();


    favoritesSection.scrollIntoView({
        behavior: "smooth"
    });

}

function renderFavorites() {

    if (!favoritesGrid) {
        return;
    }

    favoritesGrid.innerHTML = "";


    const favoriteMovies =
        currentMovies.filter(
            movie =>
                favorites.includes(movie.id)
        );


    if (favoriteMovies.length === 0) {

        favoritesEmpty?.classList.remove(
            "hidden"
        );

        return;

    }


    favoritesEmpty?.classList.add(
        "hidden"
    );


    favoriteMovies.forEach(movie => {

        favoritesGrid.appendChild(
            createMovieCard(movie)
        );

    });


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }

}


function toggleFavorite(
    movie,
    button = null
) {

    const exists =
        favorites.includes(
            movie.id
        );


    if (exists) {

        favorites =
            favorites.filter(
                id =>
                    id !== movie.id
            );

    }

    else {

        favorites.push(
            movie.id
        );

    }


    localStorage.setItem(
        "codebrielFavorites",
        JSON.stringify(
            favorites
        )
    );


    if (button) {

        button.classList.toggle(
            "active",
            !exists
        );

    }


    updateFavoriteButton(
        movie
    );

}


function updateFavoriteButton(
    movie
) {

    if (!modalFavorite) {
        return;
    }


    modalFavorite.dataset.movieId =
        movie.id;


    const isFavorite =
        favorites.includes(
            movie.id
        );


    modalFavorite.innerHTML =
        isFavorite
            ? `
                <i data-lucide="heart-off"></i>
                Remove from Favorites
              `
            : `
                <i data-lucide="heart"></i>
                Add to Favorites
              `;


    if (
        typeof lucide !==
        "undefined"
    ) {

        lucide.createIcons();

    }

}

if (backToMovies) {

    backToMovies.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll("main > section")
                .forEach(section => {

                    section.classList.remove(
                        "hidden"
                    );

                });


            document
                .getElementById("movies")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}

/* =========================================================
   LOAD MORE
   ========================================================= */

function addLoadMoreButton(
    currentPageNumber,
    totalPages
) {

    let loadMore =
        document.getElementById(
            "load-more-btn"
        );


    if (
        currentPageNumber >=
        totalPages
    ) {

        if (loadMore) {

            loadMore.remove();

        }

        return;

    }


    if (!loadMore) {

        loadMore =
            document.createElement(
                "button"
            );


        loadMore.id =
            "load-more-btn";


        loadMore.className =
            "primary-btn load-more-btn";


        loadMore.innerHTML = `

            <i data-lucide="plus"></i>

            Load More Movies

        `;


        loadMore.addEventListener(
            "click",
            () => {

                loadPopularMovies(
                    true
                );

            }
        );


        movieGrid.parentElement
            .appendChild(
                loadMore
            );

    }


    if (
        typeof lucide !==
        "undefined"
    ) {

        lucide.createIcons();

    }

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    if (loadingState) {

        loadingState.classList.remove(
            "hidden"
        );

    }

}


function hideLoading() {

    if (loadingState) {

        loadingState.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showEmptyState() {

    if (emptyState) {

        emptyState.classList.remove(
            "hidden"
        );

    }

}


function hideEmptyState() {

    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   HTML SECURITY
   ========================================================= */

function escapeHTML(
    value
) {

    if (!value) {
        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

/* =========================================================
   HERO MOVIES
   ========================================================= */

async function loadHeroMovies() {

    const data = await fetchData(
        apiUrl("/trending/movie/week")
    );

    if (!data || !data.results) {
        return;
    }

    const movies = data.results
        .filter(movie => movie.poster_path)
        .slice(0, 3);

    const heroPosters = [
        document.getElementById("hero-poster-one"),
        document.getElementById("hero-poster-two"),
        document.getElementById("hero-poster-three")
    ];

    heroPosters.forEach((posterElement, index) => {

        const movie = movies[index];

        if (!posterElement || !movie) {
            return;
        }

        posterElement.innerHTML = `
            <img
                src="${IMAGE_BASE_URL}${movie.poster_path}"
                alt="${escapeHTML(movie.title)}"
                loading="lazy"
                onerror="this.onerror=null; this.src='https://placehold.co/500x750/0e1a2a/94a3b8?text=No+Poster';"
            >
        `;

        posterElement.setAttribute(
            "aria-label",
            `Open ${movie.title}`
        );

        posterElement.addEventListener(
            "click",
            () => openMovieDetails(movie)
        );

    });

}