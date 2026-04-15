const expensesList = document.getElementById("list");
const totalSpan = document.getElementById("total");
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const addButton = document.getElementById("addBtn");
const errorMsg = document.querySelector(".errorMessage");

//boje kategorija (svaka kategorija ima zasebnu boju)
const categoryColors = {
  food: "#ff6b6b",
  transport: "#4dabf7",
  housing: "#845ef7",
  utilities: "#ffa94d",

  shopping: "#f06595",
  entertainment: "#20c997",
  subscriptions: "#339af0",
  health: "#51cf66",

  education: "#ffd43b",
  training: "#a78bfa",

  pets: "#ff922b",
  other: "#adb5bd",
};

let expenses = [];

//cuvanje podataka u localStorage u vidu niza/vektora
const data = localStorage.getItem("expenses");
if (data) {
  expenses = JSON.parse(data);
}
renderExpenses();
showTotal(); //Ukoliko ima podataka, odmah ce se prikazati na stranici

//Dodavanje troskova u niz expenses
function addExpense(name, amount, category) {
  expenses.push({ name, amount, category });

  localStorage.setItem("expenses", JSON.stringify(expenses));
} //JSON.stringify - prebacuje u JSON string

//dodavanje troskova u listu
function renderExpenses(list = expenses) {
  expensesList.innerHTML = "";

  //Provera da li je lista prazna ili ne
  if (list.length === 0) {
    const message =
      expenses.length === 0
        ? "No expenses yet..."
        : "No matching expenses found...";

    expensesList.innerHTML = `
    <li style="color: gray; font-style: italic;">
      ${message}
    </li>
  `;
    return;
  }

  list.forEach((expense) => {
    const realIndex = expenses.indexOf(expense);
    let color = categoryColors[expense.category];

    expensesList.innerHTML += `
      <li>
        <span class="categoryTag" style="background-color: ${color}">
          ${expense.category}
        </span>

        ${expense.name} - ${expense.amount}

        <button class="deleteButton" data-index="${realIndex}">X</button>
      </li>
    `;
  });
}

function getTotal() {
  //Racunanje i vracanje ukupnog troska
  let total = 0;

  for (let e of expenses) {
    total += Number(e.amount); //total mora da bude type Number zbog racunanja/sabiranja
  }

  return total;
}

function showTotal() {
  //span sa id-jem total dobija vrednost ukupnog troska
  totalSpan.innerText = getTotal();
}

addButton.addEventListener("click", handleSubmit); //submit-ovanje pritiskom na dugme

//VALIDACIJA INPUT-A
function validateNameInput(input) {
  //validacija name input-a (logika mi je drugacija za name i amount, pa sam ih odvojio)
  input.classList.remove("error", "success");

  if (input.value.trim() === "") {
    input.classList.add("error");
    return false;
  }

  input.classList.add("success");
  return true;
}

function validateAmountInput(input) {
  //validacija amount input-a
  input.classList.remove("error", "success");

  const value = input.value.trim();

  if (value === "" || isNaN(Number(value)) || Number(value) < 0) {
    input.classList.add("error");
    return false;
  }

  input.classList.add("success");
  return true;
}

nameInput.addEventListener("input", () => {
  validateNameInput(nameInput);
  clearError();
});

amountInput.addEventListener("input", () => {
  validateAmountInput(amountInput);
  clearError();
});

nameInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    handleSubmit();
  }
});

amountInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    handleSubmit();
  }
});

//provera validnosti forme
function isFormValid() {
  const nameValid = validateNameInput(nameInput);
  const amountValid = validateAmountInput(amountInput);
  const categoryValid = validateCategoryInput(categoryInput);

  if (!nameValid || !amountValid || !categoryValid) {
    showError("No valid data entered!");
    return false;
  }

  clearError();
  return true;
}

//funkcija za submit-ovanje
function handleSubmit() {
  if (!isFormValid()) return;

  addExpense(nameInput.value, amountInput.value, categoryInput.value);

  renderExpenses();
  showTotal();

  //reset vrednosti
  nameInput.value = "";
  amountInput.value = "";
  categoryInput.value = "";

  //resetovanje stilova inputa
  nameInput.classList.remove("success", "error");
  amountInput.classList.remove("success", "error");
  categoryInput.classList.remove("success", "error");

  clearError();
}

//PRIKAZ ERROR-A
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("errorMessage");
  errorMsg.classList.add("displayElement");
}

function clearError() {
  errorMsg.textContent = "";
  errorMsg.classList.remove("displayElement");
  errorMsg.classList.add("errorMessage");
}

//Delete dugmad
expensesList.addEventListener("click", function (e) {
  if (e.target.classList.contains("deleteButton")) {
    const index = e.target.dataset.index;

    // brisanje iz niza
    expenses.splice(index, 1);

    // update localStorage
    localStorage.setItem("expenses", JSON.stringify(expenses));

    // 🔥 UMESTO renderExpenses()
    applyFilters();

    showTotal();
  }
});

//EDITOVANJE TROSKOVA (kada zavrsimo sa editovanjem troska, primenjuje se ovaj event listener(tj. kada vise nije lista u fokusu - blur/focusout event))
expensesList.addEventListener("focusout", function (e) {
  if (e.target.classList.contains("editName")) {
    const index = e.target.dataset.index;
    const value = e.target.textContent.trim();

    e.target.textContent = value;
    expenses[index].name = value;
  }

  if (e.target.classList.contains("editAmount")) {
    const index = e.target.dataset.index;
    const value = e.target.textContent.trim();

    if (!isNaN(Number(value)) && value !== "") {
      e.target.textContent = value;
      expenses[index].amount = value;
    }
  }

  localStorage.setItem("expenses", JSON.stringify(expenses));
  showTotal();
});

expensesList.addEventListener("keydown", function (e) {
  if (
    e.target.classList.contains("editName") ||
    e.target.classList.contains("editAmount")
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  }
});

//KATEGORIJE
const categoryInput = document.getElementById("category");

//validacija kategorije
function validateCategoryInput(select) {
  select.classList.remove("error", "success");

  if (select.value === "") {
    select.classList.add("error");
    return false;
  }

  select.classList.add("success");
  return true;
}

//live validacija kategorije (kada se odabere kategorija, odmah je validna)
categoryInput.addEventListener("change", () => {
  validateCategoryInput(categoryInput);
  clearError();
});

//SEARCH LOGIKA

const searchNameInput = document.getElementById("searchName");
const minAmountInput = document.getElementById("minAmount");
const maxAmountInput = document.getElementById("maxAmount");
const filterCategoryInput = document.getElementById("filterCategory");

//filter funkcija
function getFilteredExpenses() {
  const searchName = searchNameInput.value.toLowerCase();

  const min = minAmountInput.value === "" ? null : Number(minAmountInput.value);
  const max = maxAmountInput.value === "" ? null : Number(maxAmountInput.value);

  const category = filterCategoryInput.value;

  return expenses.filter((expense) => {
    const nameMatch = expense.name.toLowerCase().includes(searchName);

    const amount = Number(expense.amount);

    const minMatch = min === null || amount >= min;
    const maxMatch = max === null || amount <= max;

    const categoryMatch = category === "" || expense.category === category;

    return nameMatch && minMatch && maxMatch && categoryMatch;
  });
}

//search funkcija
function applyFilters() {
  let filtered = getFilteredExpenses();

  // dodato sortiranje
  filtered = sortExpenses(filtered);

  renderExpenses(filtered);
}

//event listeneri
searchNameInput.addEventListener("input", applyFilters);
minAmountInput.addEventListener("input", applyFilters);
maxAmountInput.addEventListener("input", applyFilters);
filterCategoryInput.addEventListener("change", applyFilters);

//SORT LOGIKA
const sortOptionInput = document.getElementById("sortOption");

//sort funkcija
function sortExpenses(list) {
  const sortValue = sortOptionInput.value;

  const sorted = [...list]; //kopija liste

  switch (sortValue) {
    case "amount-asc":
      sorted.sort((a, b) => Number(a.amount) - Number(b.amount));
      break;

    case "amount-desc":
      sorted.sort((a, b) => Number(b.amount) - Number(a.amount));
      break;

    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  return sorted;
}

//event listener za dropdown listu sortiranja
sortOptionInput.addEventListener("change", applyFilters);
