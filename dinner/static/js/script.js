const implementation_checkbox = document.getElementById(
  "implementation-checkbox"
);
const waiter_checkbox = document.getElementById("waiter-checkbox");
const waiter_img = document.getElementById("waiter-img");
const bookshelf = document.getElementById("books");

function letsGetItStarted() {
  bookshelf.innerHTML = "";
  const implementation = implementation_checkbox.checked
    ? "multiprocessing"
    : "multithreading";
  const waiter = waiter_checkbox.checked;
  const how_many_books = document.getElementById("how-many-books-input").value;
  if (waiter) {
    waiter_img.style.display = "block";
  } else {
    waiter_img.style.display = "none";
  }
  for (let i = 1; i <= how_many_books; i++) {
    const book = document.createElement("div");
    book.classList.add("book");
    book.innerText = i;
    bookshelf.appendChild(book);
  }
}
