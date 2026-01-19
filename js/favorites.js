const carsGrid = document.getElementById("carsGrid");

const FAV_KEY = "carall_favs_v1";

function loadFavs(){
  try{
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr.map(String));
  }catch(e){
    return new Set();
  }
}

function saveFavs(set){
  localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
}

/* ✅ Səndəki dizayna uyğun empty state */
function renderEmpty(){
  carsGrid.innerHTML = `
    <div class="empty">
      <div class="empty__t">Seçilmiş elan yoxdur</div>
      <div class="empty__d">Bəyəndiyin elanları ürəyə basıb bura əlavə edə bilərsən.</div>
      <a class="empty__btn" href="index.html#list">Elanlara bax</a>
    </div>
  `;
}

/* ✅ Sənin card render strukturu (indexdəki ilə eyni saxla) */
function renderCars(list){
  if(!list.length){
    renderEmpty();
    return;
  }

  const favIds = loadFavs();

  // fav state tətbiq et
  list.forEach(car => car.fav = favIds.has(String(car.id)));

  carsGrid.innerHTML = list.map(car => `
    <a class="cardlink" href="${car.link}" aria-label="${car.brand} ${car.model} detallar">
      <article class="card">
        <div class="card__imgwrap">
          <img class="card__img" src="${car.img}" alt="${car.brand} ${car.model}">

          <button class="fav-btn ${car.fav ? 'is-on' : ''}" type="button" data-id="${car.id}" aria-label="Favorit">
            <!-- OUTLINE -->
            <svg class="fav-ic ic-off" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- FILLED -->
            <svg class="fav-ic ic-on" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21.23 4.22 13.45 3.16 12.39a5.5 5.5 0 0 1 7.78-7.78L12 5.67l1.06-1.06a5.5 5.5 0 0 1 7.78 7.78l-1.06 1.06L12 21.23Z"/>
            </svg>
          </button>

          <div class="badge">${car.city ?? ""}</div>
        </div>

        <div class="card__body">
          <div class="card__title">${car.brand} ${car.model}</div>
          <div class="card__meta">
            <span>${car.year}</span><span>•</span>
            <span>${Number(car.mileage || 0).toLocaleString("az-AZ")} km</span><span>•</span>
            <span>${car.fuel}</span><span>•</span>
            <span>${car.gearbox}</span>
          </div>
          <div class="card__bottom">
            <div class="card__price">${car.price}</div>
          </div>
        </div>
      </article>
    </a>
  `).join("");
}

/* ✅ Start */
function init(){
  // cars array burda olmalıdır (cars-data.js-dən)
  const allCars = window.cars || [];
  const favIds = loadFavs();

  const favCars = allCars.filter(c => favIds.has(String(c.id)));
  renderCars(favCars);
}

init();

/* ✅ Favoritdən çıxart: localStorage yenilə + listi refresh et */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".fav-btn");
  if(!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const id = String(btn.dataset.id);

  const favIds = loadFavs();
  if(favIds.has(id)) favIds.delete(id);
  saveFavs(favIds);

  // yenidən render et (silinmiş olacaq)
  const allCars = window.cars || [];
  const favCars = allCars.filter(c => favIds.has(String(c.id)));
  renderCars(favCars);
});
const allCars = window.cars || [];
const favIds = loadFavs();

const favCars = allCars.filter(car =>
  favIds.has(String(car.id))
);

renderCars(favCars);
