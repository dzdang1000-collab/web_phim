const movieGrid = document.getElementById("movieGrid");
const cinemaGrid = document.getElementById("cinemaGrid");
const seriesGrid = document.getElementById("seriesGrid");
const recommendStrip = document.getElementById("recommendStrip");
const hotList = document.getElementById("hotList");
const ratedList = document.getElementById("ratedList");
const genreMenu = document.getElementById("genreMenu");
const countryMenu = document.getElementById("countryMenu");
const yearMenu = document.getElementById("yearMenu");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const resultLine = document.getElementById("resultLine");
const emptyState = document.getElementById("emptyState");
const quickTabs = document.getElementById("quickTabs");
const movieModal = document.getElementById("movieModal");
const closeModal = document.getElementById("closeModal");
const authModal = document.getElementById("authModal");
const openLogin = document.getElementById("openLogin");
const closeAuth = document.getElementById("closeAuth");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const authError = document.getElementById("authError");
const authSwitch = document.getElementById("authSwitch");
const authSubmit = document.getElementById("authSubmit");
const userMenu = document.getElementById("userMenu");
const userChip = document.getElementById("userChip");
const logoutBtn = document.getElementById("logoutBtn");

let activeFilter = "all";
let searchTerm = "";
let authMode = "login";
let currentUser = getCurrentUser();

document.addEventListener("DOMContentLoaded", () => {
    renderMenus();
    renderHome();
    bindControls();
    renderAuthState();
});

function renderMenus() {
    genreMenu.innerHTML = genres.map((genre) => (
        `<a href="#" data-genre="${genre}">${genre}</a>`
    )).join("");

    countryMenu.innerHTML = countries.map((country) => (
        `<a href="#" data-country="${country}">${country}</a>`
    )).join("");

    yearMenu.innerHTML = [
        ...years.map((year) => `<a href="#" data-year="${year}">Năm ${year}</a>`),
        `<a href="#" data-year="older">Trước Năm 2015</a>`
    ].join("");
}

function renderHome() {
    const recommended = [...moviesData].sort((a, b) => b.views - a.views).slice(0, 8);
    recommendStrip.innerHTML = recommended.map(renderRecommendCard).join("");

    renderFilteredGrid();
    renderStaticGrid(cinemaGrid, moviesData.filter((movie) => movie.tags.includes("cinema")).slice(0, 10));
    renderStaticGrid(seriesGrid, moviesData.filter((movie) => movie.type === "series").slice(0, 10));
    renderSidebar();
    bindMovieCards();
}

function renderFilteredGrid() {
    const movies = filterMovies(moviesData);
    movieGrid.innerHTML = movies.map(renderMovieCard).join("");
    emptyState.hidden = movies.length !== 0;
    resultLine.textContent = searchTerm
        ? `Tìm thấy ${movies.length} phim cho "${searchTerm}"`
        : `${movies.length} phim đang hiển thị`;
    bindMovieCards();
}

function renderStaticGrid(target, movies) {
    target.innerHTML = movies.map(renderMovieCard).join("");
}

function renderSidebar() {
    const hotMovies = [...moviesData].sort((a, b) => b.views - a.views).slice(0, 10);
    hotList.innerHTML = hotMovies.map((movie) => `
        <li>
            <a href="#" class="rank-item" data-id="${movie.id}">
                <span class="rank-title">${movie.title}</span>
                <span class="rank-views">${formatViews(movie.views)} lượt xem</span>
            </a>
        </li>
    `).join("");

    const topRated = [...moviesData].sort((a, b) => b.rating - a.rating).slice(0, 8);
    ratedList.innerHTML = topRated.map((movie) => `
        <a href="#" class="rated-item" data-id="${movie.id}">
            <img src="${movie.poster}" alt="${movie.title}">
            <span>
                <strong>${movie.title}</strong>
                <small>${movie.original}</small>
                <em>${movie.rating} • ${movie.status}</em>
            </span>
        </a>
    `).join("");
}

function renderRecommendCard(movie) {
    return `
        <article class="recommend-card movie-open" data-id="${movie.id}">
            <img src="${movie.backdrop}" alt="${movie.title}">
            <div class="recommend-info">
                <span>${movie.lang} ${movie.quality}</span>
                <h3>${movie.title}</h3>
                <p>${movie.original}</p>
            </div>
        </article>
    `;
}

function renderMovieCard(movie) {
    return `
        <article class="movie-card movie-open" data-id="${movie.id}">
            <div class="poster-wrap">
                <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
                <span class="badge badge-left">${movie.lang}</span>
                <span class="badge badge-right">${movie.quality}</span>
                <span class="episode">${movie.status}</span>
                <div class="play-layer" aria-hidden="true"></div>
            </div>
            <h3>${movie.title}</h3>
            <p>${movie.original}</p>
        </article>
    `;
}

function bindControls() {
    document.querySelectorAll("[data-filter]").forEach((item) => {
        item.addEventListener("click", (event) => {
            event.preventDefault();
            activeFilter = item.dataset.filter;
            searchTerm = "";
            searchInput.value = "";
            setActiveFilter(item);
            renderFilteredGrid();
        });
    });

    genreMenu.addEventListener("click", (event) => {
        const item = event.target.closest("[data-genre]");
        if (!item) return;
        event.preventDefault();
        activeFilter = item.dataset.genre;
        renderFilteredGrid();
    });

    countryMenu.addEventListener("click", (event) => {
        const item = event.target.closest("[data-country]");
        if (!item) return;
        event.preventDefault();
        activeFilter = item.dataset.country;
        renderFilteredGrid();
    });

    yearMenu.addEventListener("click", (event) => {
        const item = event.target.closest("[data-year]");
        if (!item) return;
        event.preventDefault();
        activeFilter = item.dataset.year;
        renderFilteredGrid();
    });

    searchForm.addEventListener("submit", (event) => event.preventDefault());
    searchInput.addEventListener("input", (event) => {
        searchTerm = event.target.value.trim().toLowerCase();
        renderFilteredGrid();
    });

    document.getElementById("prevRecommend").addEventListener("click", () => {
        recommendStrip.scrollBy({ left: -320, behavior: "smooth" });
    });

    document.getElementById("nextRecommend").addEventListener("click", () => {
        recommendStrip.scrollBy({ left: 320, behavior: "smooth" });
    });

    closeModal.addEventListener("click", hideModal);
    movieModal.addEventListener("click", (event) => {
        if (event.target === movieModal) hideModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && movieModal.classList.contains("open")) hideModal();
        if (event.key === "Escape" && authModal.classList.contains("open")) hideAuthModal();
    });

    openLogin.addEventListener("click", () => showAuthModal("login"));
    closeAuth.addEventListener("click", hideAuthModal);
    authModal.addEventListener("click", (event) => {
        if (event.target === authModal) hideAuthModal();
    });
    authSwitch.addEventListener("click", () => {
        showAuthModal(authMode === "login" ? "register" : "login");
    });
    authForm.addEventListener("submit", handleAuthSubmit);
    logoutBtn.addEventListener("click", logout);
}

function bindMovieCards() {
    document.querySelectorAll(".movie-open, .rank-item, .rated-item").forEach((card) => {
        card.addEventListener("click", (event) => {
            event.preventDefault();
            const movie = moviesData.find((item) => item.id === Number(card.dataset.id));
            if (movie) showModal(movie);
        });
    });
}

function filterMovies(movies) {
    return movies.filter((movie) => {
        const matchesSearch = !searchTerm || [
            movie.title,
            movie.original,
            movie.description,
            movie.genre,
            movie.country
        ].join(" ").toLowerCase().includes(searchTerm);

        if (!matchesSearch) return false;
        if (activeFilter === "all") return true;
        if (activeFilter === "movie" || activeFilter === "series") return movie.type === activeFilter;
        if (activeFilter === "older") return movie.year < 2015;
        if (!Number.isNaN(Number(activeFilter))) return movie.year === Number(activeFilter);
        return movie.tags.includes(activeFilter) || movie.genre === activeFilter || movie.country === activeFilter;
    });
}

function setActiveFilter(activeItem) {
    document.querySelectorAll(".nav-link, .tab").forEach((item) => item.classList.remove("active"));
    if (activeItem.classList.contains("nav-link") || activeItem.classList.contains("tab")) {
        activeItem.classList.add("active");
    }

    if (activeItem.closest("#quickTabs")) return;

    quickTabs.querySelector('[data-filter="all"]').classList.toggle("active", activeFilter === "all");
}

function showModal(movie) {
    document.getElementById("modalBackdrop").src = movie.backdrop;
    document.getElementById("modalPoster").src = movie.poster;
    document.getElementById("modalOriginal").textContent = movie.original;
    document.getElementById("modalTitle").textContent = movie.title;
    document.getElementById("modalDescription").textContent = movie.description;
    document.getElementById("modalMeta").innerHTML = `
        <span>${movie.year}</span>
        <span>${movie.quality}</span>
        <span>${movie.lang}</span>
        <span>${movie.status}</span>
        <span>${movie.rating}/10</span>
    `;

    document.getElementById("watchBtn").onclick = () => {
        if (!currentUser) {
            hideModal();
            showAuthModal("login", "Bạn cần đăng nhập để xem phim.");
            return;
        }

        alert(`Đang phát phim cho tài khoản ${currentUser.username}.`);
    };
    document.getElementById("trailerBtn").onclick = () => window.open(movie.trailer, "_blank", "noopener");

    movieModal.classList.add("open");
    movieModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function hideModal() {
    movieModal.classList.remove("open");
    movieModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function formatViews(value) {
    return new Intl.NumberFormat("vi-VN").format(value);
}

function showAuthModal(mode = "login", message = "") {
    authMode = mode;
    authTitle.textContent = mode === "login" ? "Đăng nhập VibePhim" : "Đăng ký tài khoản";
    authSubmit.textContent = mode === "login" ? "Đăng nhập" : "Tạo tài khoản";
    authSwitch.textContent = mode === "login"
        ? "Chưa có tài khoản? Đăng ký"
        : "Đã có tài khoản? Đăng nhập";
    authError.hidden = !message;
    authError.textContent = message;
    authPassword.value = "";
    authModal.classList.add("open");
    authModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => authUsername.focus(), 0);
}

function hideAuthModal() {
    authModal.classList.remove("open");
    authModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    authError.hidden = true;
    authForm.reset();
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const username = authUsername.value.trim();
    const password = authPassword.value;

    if (username.length < 3 || password.length < 4) {
        showAuthError("Tên đăng nhập tối thiểu 3 ký tự, mật khẩu tối thiểu 4 ký tự.");
        return;
    }

    const users = getUsers();
    const existingUser = users.find((user) => user.username.toLowerCase() === username.toLowerCase());

    if (authMode === "register") {
        if (existingUser) {
            showAuthError("Tên đăng nhập đã tồn tại.");
            return;
        }

        const newUser = {
            username,
            password,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem("vibephimUsers", JSON.stringify(users));
        setCurrentUser({ username });
        hideAuthModal();
        return;
    }

    if (!existingUser || existingUser.password !== password) {
        showAuthError("Sai tên đăng nhập hoặc mật khẩu.");
        return;
    }

    setCurrentUser({ username: existingUser.username });
    hideAuthModal();
}

function showAuthError(message) {
    authError.textContent = message;
    authError.hidden = false;
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem("vibephimUsers")) || [];
    } catch {
        return [];
    }
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("vibephimCurrentUser"));
    } catch {
        return null;
    }
}

function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem("vibephimCurrentUser", JSON.stringify(user));
    renderAuthState();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("vibephimCurrentUser");
    renderAuthState();
}

function renderAuthState() {
    if (currentUser) {
        openLogin.hidden = true;
        userMenu.hidden = false;
        userChip.textContent = currentUser.username.slice(0, 1).toUpperCase() + " " + currentUser.username;
        return;
    }

    openLogin.hidden = false;
    userMenu.hidden = true;
    userChip.textContent = "";
}
