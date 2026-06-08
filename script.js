"use strict";

// --- МОДЕЛЬ ДАННЫХ ДЕСЕРТОВ (В ТЕНГЕ) ---
const DESSERTS_DATA = [
  {
    id: "1",
    title: "Торт «Шоколадный Трюфель»",
    description: "Шелковистый мусс из бельгийского шоколада на нежнейшем темном миндальном бисквите.",
    price: 14500,
    category: "cake",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "2",
    title: "Пончик «Карамельный взрыв»",
    description: "Воздушный пончик, политый домашней соленой карамелью и декорированный криспами.",
    price: 950,
    category: "donut",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "3",
    title: "Блины «Лесная Малина»",
    description: "Тонкие французские крепы со свежей лесной малиной, крем-чизом и малиновым соусом.",
    price: 1450,
    category: "pancake",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "4",
    title: "Фисташковый тарт со свежими ягодами",
    description: "Песочное тесто сабле с нежным заварным кремом на основе отборной фисташки.",
    price: 3200,
    category: "cake",
    image: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "5",
    title: "Набор фирменных пончиков (6 шт)",
    description: "Премиум-сет пончиков с шоколадной, фруктовой и карамельной глазурью.",
    price: 5400,
    category: "donut",
    image: "https://images.unsplash.com/photo-1533930250856-a111648a5591?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "6",
    title: "Шоколадные блины «Тройной шоколад»",
    description: "Фирменные шоколадные блины с тремя видами изысканного бельгийского ганаша.",
    price: 1800,
    category: "pancake",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&q=80&w=400"
  }
];

// --- СОСТОЯНИЕ ПРИЛОЖЕНИЯ (localStorage) ---
const state = {
  cart: JSON.parse(localStorage.getItem("dessert_cart_items_kzt_v3")) || [],
  favorites: JSON.parse(localStorage.getItem("dessert_favorites_items_kzt_v3")) || [],
  currentFilter: "all",
  searchQuery: "",
  onlyFavoritesView: false,
  
  // Настройки конструктора боксов
  builder: {
    size: "6",
    sizePrice: 4500,
    base: "Ассорти нежных пончиков",
    basePrice: 0,
    topping: "Ягодный соус",
    toppingPrice: 0
  }
};

// --- ДОМ СЕЛЕКТОРЫ ---
const catalogGrid = document.getElementById("catalogGrid");
const filterButtons = document.querySelectorAll(".catalog__filter-btn");
const searchInput = document.getElementById("searchInput");
const cartBadge = document.getElementById("cartBadge");
const favoriteBadge = document.getElementById("favoriteBadge");
const favoriteToggleBtn = document.getElementById("favoriteToggleBtn");

const cartDialog = document.getElementById("cartDialog");
const cartOpenBtn = document.getElementById("cartOpenBtn");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const cartList = document.getElementById("cartList");
const cartTotalSum = document.getElementById("cartTotalSum");
const checkoutBtn = document.getElementById("checkoutBtn");

const checkoutForm = document.getElementById("checkoutForm");
const clientNameInput = document.getElementById("clientName");
const clientPhoneInput = document.getElementById("clientPhone");
const deliveryAddressInput = document.getElementById("deliveryAddress");
const submitOrderBtn = document.getElementById("submitOrderBtn");

const toast = document.getElementById("toastNotification");
const toastMessage = document.getElementById("toastMessage");

// Конструктор
const sizeOptions = document.getElementById("sizeOptions");
const baseOptions = document.getElementById("baseOptions");
const toppingOptions = document.getElementById("toppingOptions");
const builderTotalPrice = document.getElementById("builderTotalPrice");
const addBuilderToCartBtn = document.getElementById("addBuilderToCartBtn");

// --- ИНИЦИАЛИЗАЦИЯ ---
window.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  updateBadges();
  setupEventListeners();
  setupBuilderListeners();
  applyKazakhstanPhoneMask();
  calculateBuilderPrice();
});

// --- ФОРМАТИРОВАНИЕ ЦЕН ---
function formatPrice(number) {
  return new Intl.NumberFormat('ru-RU').format(number) + " ₸";
}

// --- РЕНДЕРИНГ КАТАЛОГА ДЕСЕРТОВ ---
function renderCatalog() {
  catalogGrid.innerHTML = "";

  const filtered = DESSERTS_DATA.filter(item => {
    const matchesCategory = state.currentFilter === "all" || item.category === state.currentFilter;
    const matchesSearch = item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesFavorites = !state.onlyFavoritesView || state.favorites.includes(item.id);
    
    return matchesCategory && matchesSearch && matchesFavorites;
  });

  if (filtered.length === 0) {
    catalogGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--color-text-muted);">
        <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Десерты не найдены</p>
        <p>Попробуйте скорректировать поисковый запрос.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const isFav = state.favorites.includes(item.id);
    const cardHTML = `
      <article class="card" data-id="${item.id}">
        <button class="card__favorite-btn ${isFav ? 'card__favorite-btn--active' : ''}" data-id="${item.id}" aria-label="В избранное">
          <svg class="card__favorite-icon" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
        <div class="card__media">
          <img class="card__image" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400'">
        </div>
        <div class="card__body">
          <h3 class="card__title">${item.title}</h3>
          <p class="card__desc">${item.description}</p>
          <div class="card__footer">
            <span class="card__price">${formatPrice(item.price)}</span>
            <button class="button button--primary card__add-btn" data-id="${item.id}">В корзину</button>
          </div>
        </div>
      </article>
    `;
    catalogGrid.insertAdjacentHTML("beforeend", cardHTML);
  });
}

// --- УВЕДОМЛЕНИЯ (ТОСТЫ) ---
function showNotification(message) {
  toastMessage.textContent = message;
  toast.classList.add("toast--visible");
  setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 3000);
}

// --- ОБНОВЛЕНИЕ БЕЙДЖЕЙ И ИТОГОВЫХ СУММ ---
function updateBadges() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
  favoriteBadge.textContent = state.favorites.length;

  const totalSum = calculateTotalSum();
  submitOrderBtn.textContent = `Оформить доставку на ${formatPrice(totalSum)}`;
}

function calculateTotalSum() {
  return state.cart.reduce((total, cartItem) => {
    if (cartItem.isCustomBox) {
      return total + (cartItem.price * cartItem.quantity);
    }
    const itemData = DESSERTS_DATA.find(d => d.id === cartItem.id);
    return total + (itemData ? itemData.price * cartItem.quantity : 0);
  }, 0);
}

function saveState() {
  localStorage.setItem("dessert_cart_items_kzt_v3", JSON.stringify(state.cart));
  localStorage.setItem("dessert_favorites_items_kzt_v3", JSON.stringify(state.favorites));
  updateBadges();
}

// --- ИНТЕРАКТИВНЫЙ КОНСТРУКТОР ---
function setupBuilderListeners() {
  const handleSelection = (optionsContainer, stateKey) => {
    optionsContainer.addEventListener("click", (e) => {
      const card = e.target.closest(".sweet-builder__card");
      if (!card) return;

      optionsContainer.querySelectorAll(".sweet-builder__card").forEach(c => {
        c.classList.remove("sweet-builder__card--selected");
      });

      card.classList.add("sweet-builder__card--selected");
      
      const value = card.dataset.value;
      const price = parseInt(card.dataset.price, 10);

      state.builder[stateKey] = value;
      state.builder[stateKey + "Price"] = price;

      calculateBuilderPrice();
    });
  };

  handleSelection(sizeOptions, "size");
  handleSelection(baseOptions, "base");
  handleSelection(toppingOptions, "topping");

  // Добавление кастомного набора в корзину
  addBuilderToCartBtn.addEventListener("click", () => {
    const customBoxId = `custom-box-${Date.now()}`;
    const boxPrice = state.builder.sizePrice + state.builder.basePrice + state.builder.toppingPrice;
    const boxTitle = `Sweet Box (${state.builder.size} шт, ${state.builder.base}, декор: ${state.builder.topping})`;

    state.cart.push({
      id: customBoxId,
      title: boxTitle,
      price: boxPrice,
      isCustomBox: true,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400"
    });

    saveState();
    showNotification("Уникальный Sweet Box добавлен в корзину!");
  });
}

function calculateBuilderPrice() {
  const total = state.builder.sizePrice + state.builder.basePrice + state.builder.toppingPrice;
  builderTotalPrice.textContent = formatPrice(total);
}

// --- ОТОБРАЖЕНИЕ КОРЗИНЫ ---
function renderCartDialog() {
  cartList.innerHTML = "";

  if (state.cart.length === 0) {
    cartList.innerHTML = `
      <div class="cart-empty">
        <svg class="cart-empty__icon" viewBox="0 0 24 24">
          <path d="M19 13H5v-2h14v2z"/>
        </svg>
        <p>Ваша корзина пуста</p>
      </div>
    `;
    cartTotalSum.textContent = "0 ₸";
    return;
  }

  state.cart.forEach(cartItem => {
    let itemTitle, itemPrice, itemImg;

    if (cartItem.isCustomBox) {
      itemTitle = cartItem.title;
      itemPrice = cartItem.price * cartItem.quantity;
      itemImg = cartItem.image;
    } else {
      const itemData = DESSERTS_DATA.find(d => d.id === cartItem.id);
      if (!itemData) return;
      itemTitle = itemData.title;
      itemPrice = itemData.price * cartItem.quantity;
      itemImg = itemData.image;
    }

    const cartItemHTML = `
      <li class="cart-item" data-id="${cartItem.id}">
        <img class="cart-item__img" src="${itemImg}" alt="${itemTitle}">
        <div class="cart-item__details">
          <h4 class="cart-item__title">${itemTitle}</h4>
          <span class="cart-item__price">${formatPrice(itemPrice)}</span>
        </div>
        <div class="cart-item__controls">
          <button class="cart-item__btn cart-item__btn--minus" data-id="${cartItem.id}">-</button>
          <span class="cart-item__qty">${cartItem.quantity}</span>
          <button class="cart-item__btn cart-item__btn--plus" data-id="${cartItem.id}">+</button>
        </div>
      </li>
    `;
    cartList.insertAdjacentHTML("beforeend", cartItemHTML);
  });

  cartTotalSum.textContent = formatPrice(calculateTotalSum());
}

// --- НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ---
function setupEventListeners() {
  // Клик по сетке каталога (Добавление товаров и Избранное)
  catalogGrid.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".card__add-btn");
    const favBtn = e.target.closest(".card__favorite-btn");

    if (addBtn) {
      const id = addBtn.dataset.id;
      const existing = state.cart.find(item => item.id === id && !item.isCustomBox);

      if (existing) {
        existing.quantity++;
      } else {
        state.cart.push({ id, quantity: 1 });
      }
      saveState();
      showNotification("Добавлено в корзину!");
    }

    if (favBtn) {
      const id = favBtn.dataset.id;
      const index = state.favorites.indexOf(id);

      if (index > -1) {
        state.favorites.splice(index, 1);
        favBtn.classList.remove("card__favorite-btn--active");
        showNotification("Удалено из избранного");
      } else {
        state.favorites.push(id);
        favBtn.classList.add("card__favorite-btn--active");
        showNotification("Добавлено в избранное!");
      }
      saveState();
      if (state.onlyFavoritesView) {
        renderCatalog();
      }
    }
  });

  // Фильтрация категорий
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("catalog__filter-btn--active"));
      button.classList.add("catalog__filter-btn--active");
      state.currentFilter = button.dataset.filter;
      renderCatalog();
    });
  });

  // Поиск
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderCatalog();
  });

  // Переключатель избранных позиций
  favoriteToggleBtn.addEventListener("click", () => {
    state.onlyFavoritesView = !state.onlyFavoritesView;
    if (state.onlyFavoritesView) {
      favoriteToggleBtn.classList.add("header__action-btn--active");
      showNotification("Отображаются только избранные десерты");
    } else {
      favoriteToggleBtn.classList.remove("header__action-btn--active");
    }
    renderCatalog();
  });

  // Открытие и закрытие модального окна корзины
  cartOpenBtn.addEventListener("click", () => {
    renderCartDialog();
    cartDialog.showModal();
  });

  cartCloseBtn.addEventListener("click", () => {
    cartDialog.close();
  });

  checkoutBtn.addEventListener("click", () => {
    cartDialog.close();
    document.getElementById("checkout").scrollIntoView({ behavior: "smooth" });
  });

  // Изменение количества внутри корзины
  cartList.addEventListener("click", (e) => {
    const plusBtn = e.target.closest(".cart-item__btn--plus");
    const minusBtn = e.target.closest(".cart-item__btn--minus");

    if (plusBtn) {
      const id = plusBtn.dataset.id;
      const item = state.cart.find(c => c.id === id);
      if (item) {
        item.quantity++;
        saveState();
        renderCartDialog();
      }
    }

    if (minusBtn) {
      const id = minusBtn.dataset.id;
      const item = state.cart.find(c => c.id === id);
      if (item) {
        item.quantity--;
        if (item.quantity <= 0) {
          state.cart = state.cart.filter(c => c.id !== id);
        }
        saveState();
        renderCartDialog();
      }
    }
  });

  // Кастомная валидация
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let isFormValid = true;

    // Имя
    const nameRegex = /^[A-Za-zА-Яа-яЁё\s]{2,30}$/;
    const nameError = document.getElementById("nameError");
    if (!nameRegex.test(clientNameInput.value.trim())) {
      clientNameInput.classList.add("input-field--error");
      clientNameInput.classList.remove("input-field--success");
      nameError.textContent = "Пожалуйста, введите ваше имя (только буквы, от 2 до 30 знаков).";
      isFormValid = false;
    } else {
      clientNameInput.classList.remove("input-field--error");
      clientNameInput.classList.add("input-field--success");
      nameError.textContent = "";
    }

    // Телефон Казахстана
    const phoneRegex = /^\+7\s\(7\d{2}\)\s\d{3}-\d{2}-\d{2}$/;
    const phoneError = document.getElementById("phoneError");
    if (!phoneRegex.test(clientPhoneInput.value)) {
      clientPhoneInput.classList.add("input-field--error");
      clientPhoneInput.classList.remove("input-field--success");
      phoneError.textContent = "Заполните номер телефона Казахстана полностью: +7 (7__) ___-__-__.";
      isFormValid = false;
    } else {
      clientPhoneInput.classList.remove("input-field--error");
      clientPhoneInput.classList.add("input-field--success");
      phoneError.textContent = "";
    }

    // Адрес
    const addressError = document.getElementById("addressError");
    if (deliveryAddressInput.value.trim().length < 8) {
      deliveryAddressInput.classList.add("input-field--error");
      deliveryAddressInput.classList.remove("input-field--success");
      addressError.textContent = "Укажите полный адрес доставки (не менее 8 символов).";
      isFormValid = false;
    } else {
      deliveryAddressInput.classList.remove("input-field--error");
      deliveryAddressInput.classList.add("input-field--success");
      addressError.textContent = "";
    }

    // Корзина
    if (state.cart.length === 0) {
      showNotification("Ваша корзина пуста! Добавьте любимые десерты.");
      isFormValid = false;
    }

    if (isFormValid) {
      const finalSum = calculateTotalSum();
      showNotification(`Заказ успешно оформлен на сумму ${formatPrice(finalSum)}! Ожидайте звонка менеджера.`);
      
      state.cart = [];
      saveState();
      checkoutForm.reset();
      
      clientNameInput.classList.remove("input-field--success");
      clientPhoneInput.classList.remove("input-field--success");
      deliveryAddressInput.classList.remove("input-field--success");
    }
  });
}

// --- МАСКА ТЕЛЕФОНА КАЗАХСТАНА ---
function applyKazakhstanPhoneMask() {
  clientPhoneInput.addEventListener("input", (e) => {
    let matrix = "+7 (7__) ___-__-__";
    let i = 0;
    let def = matrix.replace(/\D/g, "");
    let val = e.target.value.replace(/\D/g, "");

    if (def.length >= val.length) {
      val = def;
    }

    e.target.value = matrix.replace(/./g, function (a) {
      return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
    });
  });
}