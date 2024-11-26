document.addEventListener("DOMContentLoaded", () => {
  const filterButton = document.querySelector(".filter");
  const dialogElement = document.querySelector(".dialog");
  const cancelButton = document.querySelector(".cancel-button");
  const confirmButton = document.querySelector(".confirm-button");

  if (filterButton) {
    filterButton.addEventListener("click", () => {
      dialogElement.style.display = "block";
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      dialogElement.style.display = 'none';
    });
  }

  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      const available = document.querySelector("#available").checked;
      const returned = document.querySelector("#returned").checked;

      console.log("Фильтры:", { available, returned });
      dialogElement.style.display = 'none'; 
    });
  }
});