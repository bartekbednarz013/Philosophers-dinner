const history = document.getElementById('statuses');

let url = `ws://${window.location.host}/ws/`;

const dinnerSocket = new WebSocket(url);

dinnerSocket.onmessage = function (e) {
  let data = JSON.parse(e.data);
  // console.log('Data:', data);

  if (data.type == 'dinner' && data.message) {
    const html = data.duration
      ? `<div class="status special-status  end-status">${data.message} Duration: ${data.duration}s    [${data.time}]<br><a href="#header">Try again!</a></div>`
      : `<div class="status special-status">${data.message}    [${data.time}]</div>`;
    history.insertAdjacentHTML('afterbegin', html);
  }

  if (data.action) {
    if (data.action == 'choose_book') {
      document.getElementById(`book${data.book}`).style.display = 'none';
      document.getElementById(`${data.person}-book`).innerHTML = data.book;
      document
        .getElementById('waiting-room')
        .insertAdjacentHTML(
          'beforeend',
          `<div class="patient-guest" id="${data.person}-waiting">${data.person} (book ${data.book})</div>`
        );
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} chose book ${data.book} and tries to sit at the table.   [${data.time}]</div>`
      );
    }
    if (data.action == 'return_book') {
      document.getElementById(`book${data.book}`).style.display = 'block';
      document.getElementById(`${data.person}-book`).innerHTML = '';
      document.getElementById(`${data.person}-read`).innerHTML = data.read;
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} put book ${data.book} back on bookshelf.   [${data.time}]</div>`
      );
    }
    if (data.action == 'take_seat') {
      document.getElementById(`${data.person}-seat`).innerHTML = data.seat;
      document.getElementById(`${data.person}-waiting`).remove();
      document.getElementById(`seat${data.seat}`).innerHTML = data.person;
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} takes a seat ${data.seat}.   [${data.time}]</div>`
      );
    }
    if (data.action == 'leave_table') {
      document.getElementById(`${data.person}-seat`).innerHTML = '';
      document.getElementById(`seat${data.seat}`).innerHTML = '';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} left the table. Seat ${data.seat} is empty again.   [${data.time}]</div>`
      );
    }
    if (data.action == 'pick_left_fork_up') {
      document.getElementById(`${data.person}-left-fork`).innerHTML = '+';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} picks left fork (${data.fork}) up.   [${data.time}]</div>`
      );
    }
    if (data.action == 'pick_right_fork_up') {
      document.getElementById(`${data.person}-right-fork`).innerHTML = '+';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} picks right fork (${data.fork}) up.   [${data.time}]</div>`
      );
    }
    if (data.action == 'start_eating') {
      document.getElementById(`${data.person}-eats`).innerHTML = 'yep';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} starts eating.   [${data.time}]</div>`
      );
    }
    if (data.action == 'finish_eating') {
      document.getElementById(`${data.person}-eats`).innerHTML = '';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} finished eating.   [${data.time}]</div>`
      );
    }
    if (data.action == 'put_left_fork_down') {
      document.getElementById(`${data.person}-left-fork`).innerHTML = '';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} put left fork (${data.fork}) down.   [${data.time}]</div>`
      );
    }
    if (data.action == 'put_right_fork_down') {
      document.getElementById(`${data.person}-right-fork`).innerHTML = '';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} put right fork (${data.fork}) down.   [${data.time}]</div>`
      );
    }
    if (data.action == 'leave') {
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} read all books and left.   [${data.time}]</div>`
      );
      document.getElementById(`${data.person}-tr`).style.backgroundColor =
        'rgba(255, 95, 165, 0.2)';
    }
  }
};

const implementation_checkbox = document.getElementById(
  'implementation-checkbox'
);
const waiter_checkbox = document.getElementById('waiter-checkbox');
const waiter_img = document.getElementById('waiter-img');
const bookshelf = document.getElementById('books');

const form = document.getElementById('options-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  letsGetItStarted();
});

function letsGetItStarted() {
  reset_dinner();

  const implementation = implementation_checkbox.checked
    ? 'multiprocessing'
    : 'multithreading';
  const waiter = waiter_checkbox.checked;
  const how_many_books = document.getElementById('how-many-books-input').value;
  if (waiter) {
    waiter_img.style.display = 'block';
  } else {
    waiter_img.style.display = 'none';
  }
  for (let i = 0; i < how_many_books; i++) {
    bookshelf.insertAdjacentHTML(
      'beforeend',
      `<div class="book" id="book${i}">${i}<div>`
    );
  }

  let data = {
    implementation: implementation,
    waiter: waiter,
    how_many_books: how_many_books,
    time: 1,
  };
  dinnerSocket.send(JSON.stringify(data));

  document.getElementById('dinner-wrapper').scrollIntoView();
}

function reset_dinner() {
  bookshelf.innerHTML = '';
  const tds = document.getElementsByClassName('clr-td');
  Array.from(tds).forEach((td) => {
    td.innerHTML = '';
  });
  const trs = document.getElementsByTagName('tr');
  Array.from(trs).forEach((tr) => {
    tr.style.backgroundColor = 'unset';
  });
  history.innerHTML = '';
}
