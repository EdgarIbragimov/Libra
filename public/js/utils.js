document.addEventListener("DOMContentLoaded", () => {
  // Filter dialog elements
  const filterButton = document.querySelector(".filter");
  const dialogElement = document.querySelector(".dialog");
  const cancelButton = document.querySelector(".cancel-button");
  const confirmButton = document.querySelector(".confirm-button");

  // Add book dialog elements
  const addButton = document.querySelector(".add");
  const addBookDialog = document.querySelector("#addBookDialog");
  const addBookForm = document.querySelector("#addBookForm");
  const cancelAddButton = addBookDialog?.querySelector(".cancel-button");

  // Store initial filter states when opening dialog
  let tempAvailable;
  let tempReturned;

  // Filter dialog handlers
  if (filterButton) {
    filterButton.addEventListener("click", () => {
      tempAvailable = document.querySelector("#available").checked;
      tempReturned = document.querySelector("#returned").checked;
      dialogElement.style.display = "block";
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      document.querySelector("#available").checked = tempAvailable;
      document.querySelector("#returned").checked = tempReturned;
      dialogElement.style.display = "none";
    });
  }

  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      const available = document.querySelector("#available").checked;
      const returned = document.querySelector("#returned").checked;
      localStorage.setItem(
        "filterState",
        JSON.stringify({ available, returned })
      );
    });
  }

  // Add book dialog handlers
  if (addButton) {
    addButton.addEventListener("click", () => {
      addBookDialog.style.display = "block";
    });
  }

  if (cancelAddButton) {
    cancelAddButton.addEventListener("click", () => {
      addBookDialog.style.display = "none";
      addBookForm.reset();
    });
  }

  if (addBookForm) {
    addBookForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.querySelector("#title").value.trim();
      const author = document.querySelector("#author").value.trim();
      const datePublication = document.querySelector("#datePublication").value;
      const description = document.querySelector("#description").value.trim();

      if (!title || !author || !datePublication) {
        alert("Please fill in all required fields");
        return;
      }

      const selectedDate = new Date(datePublication);
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        alert("Publication date cannot be in the future");
        return;
      }

      addBookForm.submit();
    });
  }

  const searchInput = document.querySelector(".search");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300));
  }
});

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  const tbody = document.querySelector(".books_data");
  const rows = tbody.getElementsByTagName("tr");

  for (const row of rows) {
    const title = row.querySelector("td:nth-child(1)").textContent.toLowerCase();
    const author = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
    
    if (title.includes(searchTerm) || author.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  }
}

function confirmDelete() {
  return confirm(
    "Are you sure you want to delete this book? This action cannot be undone."
  );
}

function goBack() {
  const filterState = localStorage.getItem("filterState");
  if (filterState) {
    const { available, returned } = JSON.parse(filterState);
    window.location.href = `/books?available=${available}&returned=${returned}`;
  } else {
    window.location.href = "/books";
  }
}

function filterBooks() {
  const available = document.querySelector("#available").checked;
  const returned = document.querySelector("#returned").checked;

  localStorage.setItem("filterState", JSON.stringify({ available, returned }));

  fetch(`/books?available=${available}&returned=${returned}`, {
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
        return;
      }
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (!data) return;

      const tbody = document.querySelector(".books_data");
      tbody.innerHTML = "";

      data.forEach((book) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><div class="text__info">${book.title}</div></td>
          <td><div class="text__info">${book.author}</div></td>
          <td><div class="text__info">${book.datePublication}</div></td>
          <td>
            <div class="text__info">${book.description}
              <div class="button__indesc">
                <a class="button_info" href="/books/${book.id}"><i class="fas fa-info-circle"></i></a>
                <form action="/books/${book.id}?_method=DELETE" method="POST" style="display:inline;" onsubmit="return confirmDelete();">
                  <button class="button_delete" type="submit"><i class="fas fa-trash"></i></button>
                </form>
              </div>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error fetching filtered books:", error);
    });

  const dialogElement = document.querySelector(".dialog");
  dialogElement.style.display = "none";
}
