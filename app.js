let categoriesSelects = [];
const tokenListContainer = document.getElementById("table-token");
const btnFilter = document.getElementById("btn-filter");
const selectCategoryEl = document.getElementById("select-categories");
const budgeFilterEl = document.getElementById("budge-filter-category");
const btnReset = document.getElementById("btn-reset");

document.addEventListener("DOMContentLoaded", async () => {
  const categories = await fetchCategories();

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.dataset;
    option.textContent = category.name;
    option.dataset.description = category.name;
    selectCategoryEl.appendChild(option);
  });

  selectCategoryEl.addEventListener("change", (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];

    if (categoriesSelects.includes(selectedOption.value)) {
      return;
    }

    const badgeEl = document.createElement("div");
    badgeEl.className = "badge badge-primary mx-1 cursor-pointer";
    badgeEl.setAttribute("data-id", selectedOption.value);
    badgeEl.onclick = () => {
      handleRemoveBadge(selectedOption.value);
    };
    badgeEl.innerHTML = `
		  <svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="inline-block h-4 w-4 stroke-current">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"></path>
			</svg>
		${selectedOption.dataset.description}`;

    categoriesSelects.push(selectedOption.value);
    budgeFilterEl.appendChild(badgeEl);
  });

  btnFilter.addEventListener("click", handleDisplayIrisanToken);
  btnReset.addEventListener("click", resetFilter);
});

function handleRemoveBadge(categoryId) {
  const badgeToRemove = document.querySelector(`div[data-id="${categoryId}"]`);
  if (badgeToRemove) {
    badgeToRemove.remove();
  }

  const index = categoriesSelects.indexOf(categoryId);
  if (index > -1) {
    categoriesSelects.splice(index, 1);
  }

  console.log("Updated categoriesSelects:", categoriesSelects);
  handleDisplayIrisanToken();
}

async function handleDisplayIrisanToken() {
  setLoadingButtonFilter(true);

  tokenListContainer.innerHTML = `<div class="flex justify-center"><span class="loading loading-bars loading-xs"></span></div>`;

  if (categoriesSelects.length <= 0) {
    setLoadingButtonFilter(false);
    tokenListContainer.innerHTML = "";
    return;
  }

  const allTokensByCategory = []; // Array untuk menyimpan token berdasarkan kategori

  for (let i = 0; i < categoriesSelects.length; i++) {
    const categoryId = categoriesSelects[i];
    console.log("Fetching tokens for Category ID:", categoryId);

    try {
      const tokens = await fetchTokensByCategory(categoryId);
      console.log(`Tokens for Category ${categoryId}:`, tokens);
      allTokensByCategory.push(tokens); // Simpan token dari kategori ini
    } catch (error) {
      console.error("Error fetching tokens:", error);
      tokenListContainer.innerHTML += `<p>Error fetching tokens for category ${categoryId}.</p>`;
    }

    // Tambahkan delay antar request jika ada lebih dari satu kategori
    if (i < categoriesSelects.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Cari irisan token di semua kategori
  const intersectedTokens = allTokensByCategory.reduce(
    (intersection, tokens) => {
      if (intersection === null) return tokens; // Inisialisasi dengan token dari kategori pertama
      return intersection.filter(
        (token) => tokens.some((t) => t.id === token.id) // Membandingkan berdasarkan ID token
      );
    },
    null
  );

  console.log("Intersected Tokens:", intersectedTokens);

  // Tampilkan token yang beririsan
  if (intersectedTokens && intersectedTokens.length > 0) {
    displayTokens(intersectedTokens);
  } else {
    tokenListContainer.innerHTML = `<p>No intersected tokens found across selected categories.</p>`;
  }
  setLoadingButtonFilter(false);
}

async function fetchCategories() {
  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const apiUrl = "https://api.coingecko.com/api/v3/coins/categories";
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

async function fetchTokensByCategory(categoryId) {
  const proxyUrl = "https://cors-anywhere.herokuapp.com/";
  const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${categoryId}&order=market_cap_desc`;
  console.log("Fetching from:", apiUrl); // Debug: Check the full URL

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  const data = await response.json();
  return data;
}

function displayTokens(tokens) {
  tokenListContainer.innerHTML = "";
  const table = document.createElement("table");
  table.className = "table w-full";
  table.id = "tokenTable";
  table.innerHTML = `
    <thead>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Symbol</th>
        <th>24h</th>
        <th>Price</th>
        <th>Market Cap</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");
  tokens.forEach((token, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td class="flex items-center gap-2">
        <img src="${token.image}" alt="${
      token.name
    }" class="w-8 h-8 rounded-full">
        <span>${token.name}</span>
      </td>
      <td>${token.symbol.toUpperCase()}</td>
      <td>$${
        token.price_change_24h ? token.price_change_24h.toFixed(2) : "-"
      }</td>
      <td>$${token.current_price.toFixed(2)}</td>
      <td>$${token.market_cap.toLocaleString()}</td>
    `;

    tbody.appendChild(row);
  });

  tokenListContainer.appendChild(table);

  // **Inisialisasi DataTables setelah tabel ditambahkan ke DOM**
  setTimeout(() => {
    $("#tokenTable").DataTable({
      responsive: true,
      paging: true,
      searching: false,
      ordering: true,
      info: true,
    });
  }, 500);
}

function setLoadingButtonFilter(isLoading) {
  const btnFilter = document.getElementById("btn-filter");

  if (!btnFilter) {
    console.error("Button filter element not found");
    return;
  }

  if (isLoading) {
    btnFilter.disabled = true; // Nonaktifkan tombol saat loading
    btnFilter.innerHTML = `
      <span class="loading loading-bars loading-xs"></span>
      Loading...`;
  } else {
    btnFilter.disabled = false; // Aktifkan tombol setelah selesai loading
    btnFilter.innerHTML = `Filter`;
  }
}

function resetFilter() {
  categoriesSelects = [];

  const badgeElements = document.querySelectorAll(".badge");
  badgeElements.forEach((badge) => {
    badge.remove();
  });

  const btnFilter = document.getElementById("btn-filter");
  if (btnFilter) {
    btnFilter.disabled = false;
    btnFilter.innerHTML = "Filter";
  }

  tokenListContainer.innerHTML = "";

  console.log("Filter has been reset");
}
