const implementation_checkbox = document.getElementById(
  'implementation-checkbox'
);
const waiter_checkbox = document.getElementById('waiter-checkbox');
const waiter_img = document.getElementById('waiter-img');
const bookshelf = document.getElementById('books');
const history = document.getElementById('statuses');
const start_dinner_button = document.getElementById('start-dinner-button');
const stop_dinner_button = document.getElementById('stop-dinner-button');

let dinner_status = false;
let dinner_stopped = false;

let last_message_time = 0;
let run_deadlockRadar = false;
let deadlock = false;

let url = `ws://${window.location.host}/ws/`;

const dinnerSocket = new WebSocket(url);

dinnerSocket.onmessage = function (e) {
  let data = JSON.parse(e.data);

  last_message_time = Date.now();

  if (data.message) {
    const html = data.duration
      ? `<div class="status special-status  end-status"><b>${
          data.message
        }</b> Duration: ${data.duration.toFixed(6)}s    [${
          data.time
        }]<br><a href="#header">Try again!</a></div>`
      : `<div class="status special-status"><b>${data.message}</b>    [${data.time}]</div>`;
    history.insertAdjacentHTML('afterbegin', html);
    if (data.action == 'dinner_started') {
      if (run_deadlockRadar) {
        deadlockRadar();
      }
    }
    if (data.action == 'dinner_ended') {
      dinner_status = false;
      stop_dinner_button.style.display = 'none';
      start_dinner_button.style.display = 'block';
      unlockBackend();
    }
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
    if (data.action == 'evacuation') {
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} left.   [${data.time}]</div>`
      );
      document.getElementById(`${data.person}-tr`).style.backgroundColor =
        'rgba(255, 95, 165, 0.2)';
    }
  }
};

const form = document.getElementById('options-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (dinner_status == false) {
    letsGetItStarted();
  }
});

const letsGetItStarted = () => {
  resetDinner();

  const implementation = implementation_checkbox.checked
    ? 'multiprocessing'
    : 'multithreading';
  const waiter = waiter_checkbox.checked;
  run_deadlockRadar = !waiter;
  const how_many_books = document.getElementById('how-many-books-input').value;
  const duration = document.getElementById('duration-input').value;

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
    action: 'start_dinner',
    implementation: implementation,
    waiter: waiter,
    how_many_books: how_many_books,
    duration: duration,
  };

  dinnerSocket.send(JSON.stringify(data));

  dinner_status = true;
  start_dinner_button.style.display = 'none';
  stop_dinner_button.style.display = 'block';
  document.getElementById('dinner-wrapper').scrollIntoView();
};

const resetDinner = () => {
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
  dinner_stopped = false;
  stop_dinner_button.style.backgroundColor = 'red';
  stop_dinner_button.disabled = false;
};

stop_dinner_button.addEventListener('click', (e) => {
  if (dinner_status && !dinner_stopped) {
    stopDinner();
    history.insertAdjacentHTML(
      'afterbegin',
      `<div class="status special-status"><b>You decided to end dinner.</b> Everybody will finish what they're doing and leave</div>`
    );
    dinner_stopped = true;
    stop_dinner_button.style.backgroundColor = 'grey';
    stop_dinner_button.disabled = true;
    document.getElementById('dinner-wrapper').scrollIntoView();
  }
});

const stopDinner = () => {
  let data = {
    action: 'stop_dinner',
  };
  dinnerSocket.send(JSON.stringify(data));
};

const unlockBackend = () => {
  let data = {
    action: 'unlock',
  };
  dinnerSocket.send(JSON.stringify(data));
};

let intervalID = 0;

const deadlockRadar = () => {
  intervalID = setInterval(checkLastMessageTime, 2000);
};

function checkLastMessageTime() {
  if (dinner_status == true) {
    let time = Date.now();
    if (time - last_message_time > 2100) {
      deadlock = true;
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status  special-status">DEADLOCK - You have to reset your server</div>`
      );
      clearInterval(intervalID);
      stop_dinner_button.style.backgroundColor = 'grey';
      stop_dinner_button.disabled = true;
    }
  } else {
    clearInterval(intervalID);
  }
}
