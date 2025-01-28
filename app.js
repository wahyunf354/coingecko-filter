document.addEventListener("DOMContentLoaded", async () => {
  const categoriesSelects = [];
  const categories = await fetchCategories();
  const selectCategoryEl = document.getElementById("select-categories");
  const budgeFilterEl = document.getElementById("budge-filter-category");
  const btnFilter = document.getElementById("btn-filter");

  const filtersContainer = document.getElementById("filters");
  const tokenListContainer = document.getElementById("token-list");
  console.log("CATEGORY", categories);

  // Add checkboxes for each category
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.dataset;
    option.textContent = category.name;
    option.dataset.description = category.name; // Tambahkan atribut dataset

    selectCategoryEl.appendChild(option);
  });

  selectCategoryEl.addEventListener("change", (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const badgeEl = document.createElement("div");
    badgeEl.className = "badge badge-primary mx-1";
    badgeEl.setAttribute("data-id", selectedOption.value);
    badgeEl.textContent = selectedOption.dataset.description;

    categoriesSelects.push(selectedOption.value);

    budgeFilterEl.appendChild(badgeEl);
  });

  btnFilter.addEventListener("click", async () => {
    if (categoriesSelects.length <= 0) {
      return;
    }

    const allTokens = []; // Array untuk menyimpan semua token dari setiap kategori

    categoriesSelects.forEach(async (item, i) => {
      console.log("Fetching tokens for Category ID:", item);

      try {
        const tokens = await fetchTokensByCategory(item);
        console.log(`Tokens for Category ${item}:`, tokens);
        displayTokens(tokens);
        allTokens.push(tokens); // Simpan token untuk kategori ini
      } catch (error) {
        console.error("Error fetching tokens:", error);
        tokenListContainer.innerHTML += `<p>Error fetching tokens for category ${item}.</p>`;
      }

      if (i < categoriesSelects.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    });
  });
});

// Fetch all categories
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
  console.log("Fetching from:", proxyUrl + apiUrl); // Debug: Check the full URL

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  const data = await response.json();
  return data;
}

// Display tokens
function displayTokens(tokens) {
  const tokenListContainer = document.getElementById("token-list");

  tokens.forEach((token) => {
    const tokenItem = document.createElement("div");
    tokenItem.className = "token-item";
    tokenItem.innerHTML = `
            <img src="${token.image}" alt="${token.name}">
            <h3>${token.name}</h3>
            <p>Symbol: ${token.symbol.toUpperCase()}</p>
            <p>Price: $${token.current_price}</p>
            <p>Market Cap: $${token.market_cap.toLocaleString()}</p>
        `;
    tokenListContainer.appendChild(tokenItem);
  });
}
