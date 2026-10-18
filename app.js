(() => {
  const $ = (id) => document.getElementById(id);

  const state = {
    items: [],
  };

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "ru")
    );
  }

  function fillSelect(select, values) {
    const current = select.value;
    select.innerHTML = '<option value="">все</option>';
    for (const value of values) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      select.appendChild(opt);
    }
    if ([...select.options].some((o) => o.value === current)) {
      select.value = current;
    }
  }

  function countryKey(country) {
    if (!country) return "";
    const parts = country.split(",").map((p) => p.trim());
    return parts[parts.length - 1] || country;
  }

  function filters() {
    return {
      q: $("q").value.trim().toLowerCase(),
      genre: $("genre").value,
      country: $("country").value,
      yearFrom: Number($("yearFrom").value) || null,
      yearTo: Number($("yearTo").value) || null,
      priceFrom: Number($("priceFrom").value) || null,
      priceTo: Number($("priceTo").value) || null,
    };
  }

  function matches(item, f) {
    if (f.q) {
      const hay = `${item.title} ${item.label}`.toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    if (f.genre && !(item.genres || []).includes(f.genre)) return false;
    if (f.country && countryKey(item.country) !== f.country) return false;
    if (f.yearFrom != null && (item.year == null || item.year < f.yearFrom)) return false;
    if (f.yearTo != null && (item.year == null || item.year > f.yearTo)) return false;
    if (f.priceFrom != null && (item.price == null || item.price < f.priceFrom)) return false;
    if (f.priceTo != null && (item.price == null || item.price > f.priceTo)) return false;
    return true;
  }

  function coverHtml(item, className = "cover") {
    if (item.image) {
      const src = escapeHtml(item.image);
      const title = escapeHtml(item.title);
      return `<button type="button" class="cover-btn" data-lightbox-src="${src}" data-lightbox-title="${title}" aria-label="Открыть обложку: ${title}">
        <img class="${className}" src="${src}" alt="" loading="lazy" width="56" height="56" />
      </button>`;
    }
    return `<div class="cover-fallback" aria-hidden="true"></div>`;
  }

  function openLightbox(src, title) {
    const box = $("lightbox");
    const img = $("lightboxImg");
    img.src = src;
    img.alt = title || "";
    $("lightboxCaption").textContent = title || "";
    box.hidden = false;
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    const box = $("lightbox");
    box.hidden = true;
    $("lightboxImg").removeAttribute("src");
    $("lightboxCaption").textContent = "";
    document.body.classList.remove("lightbox-open");
  }

  function listenHtml(item) {
    if (!item.listen || !item.listen.url) return "—";
    const label = item.listen.label || "Listen";
    return `<a href="${item.listen.url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }

  function titleHtml(item) {
    const text = escapeHtml(item.title);
    if (!item.discogs) return text;
    return `<a class="title-link" href="${escapeHtml(item.discogs)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  }

  function render(items) {
    $("count").textContent = `Показано ${items.length} из ${state.items.length}`;

    const rows = $("rows");
    rows.innerHTML = items
      .map(
        (item) => `
      <tr>
        <td>${coverHtml(item)}</td>
        <td class="title">${titleHtml(item)}</td>
        <td class="genres">${escapeHtml((item.genres || []).join(" / "))}</td>
        <td>${item.year ?? "—"}</td>
        <td class="country">${escapeHtml(item.country || "—")}</td>
        <td class="label-cell">${escapeHtml(item.label || "—")}</td>
        <td class="price">${item.price != null ? `${item.price} ₽` : "—"}</td>
        <td>${listenHtml(item)}</td>
      </tr>`
      )
      .join("");

    const cards = $("cards");
    cards.hidden = false;
    cards.innerHTML = items
      .map(
        (item) => `
      <article class="card">
        ${coverHtml(item)}
        <div>
          <h2>${titleHtml(item)}</h2>
          <p class="meta">${escapeHtml((item.genres || []).join(" / ") || "—")}</p>
          <p class="meta">${item.year ?? "—"} · ${escapeHtml(item.country || "—")}</p>
          <p class="meta">${escapeHtml(item.label || "—")}</p>
          <span class="price">${item.price != null ? `${item.price} ₽` : "—"}</span>
          <div class="meta">${listenHtml(item)}</div>
        </div>
      </article>`
      )
      .join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function apply() {
    const f = filters();
    render(state.items.filter((item) => matches(item, f)));
  }

  function reset() {
    $("q").value = "";
    $("genre").value = "";
    $("country").value = "";
    $("yearFrom").value = "";
    $("yearTo").value = "";
    $("priceFrom").value = "";
    $("priceTo").value = "";
    apply();
  }

  async function init() {
    const res = await fetch("data/catalog.json");
    state.items = await res.json();

    const genres = uniqueSorted(state.items.flatMap((i) => i.genres || []));
    const countries = uniqueSorted(state.items.map((i) => countryKey(i.country)));
    fillSelect($("genre"), genres);
    fillSelect($("country"), countries);

    for (const id of ["q", "genre", "country", "yearFrom", "yearTo", "priceFrom", "priceTo"]) {
      $(id).addEventListener("input", apply);
      $(id).addEventListener("change", apply);
    }
    $("reset").addEventListener("click", reset);

    document.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-lightbox-src]");
      if (btn) {
        openLightbox(btn.getAttribute("data-lightbox-src"), btn.getAttribute("data-lightbox-title"));
        return;
      }
      if (event.target.id === "lightbox" || event.target.id === "lightboxClose") {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !$("lightbox").hidden) {
        closeLightbox();
      }
    });

    apply();
  }

  init().catch((err) => {
    $("count").textContent = `Не удалось загрузить каталог: ${err.message}`;
  });
})();
