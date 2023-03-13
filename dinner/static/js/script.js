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
let intervalID = 0;

const forks_transform = {
  0: {
    neutral:
      'translate(calc(62px * var(--scale)), calc(-79px * var(--scale))) rotate(38deg)',
    left: 'translate(calc(37px * var(--scale)), calc(-93px * var(--scale))) rotate(22deg)',
    right:
      'translate(calc(80px * var(--scale)), calc(-60px * var(--scale))) rotate(53deg)',
  },
  1: {
    neutral:
      'translate(calc(94px * var(--scale)), calc(34px * var(--scale))) rotate(110deg)',
    left: 'translate(calc(99px * var(--scale)), calc(10px * var(--scale))) rotate(96deg)',
    right:
      'translate(calc(82px * var(--scale)), calc(57px * var(--scale))) rotate(125deg)',
  },
  2: {
    neutral:
      'translate(calc(-2px * var(--scale)), calc(100px * var(--scale))) rotate(181deg)',
    left: 'translate(calc(24px * var(--scale)), calc(97px * var(--scale))) rotate(166deg)',
    right:
      'translate(calc(-28px * var(--scale)), calc(96px * var(--scale))) rotate(196deg)',
  },
  3: {
    neutral:
      'translate(calc(-95px * var(--scale)), calc(33px * var(--scale))) rotate(251deg)',
    left: 'translate(calc(-83px * var(--scale)), calc(56px * var(--scale))) rotate(236deg)',
    right:
      'translate(calc(-100px * var(--scale)), calc(7px * var(--scale))) rotate(266deg)',
  },
  4: {
    neutral:
      'translate(calc(-60px * var(--scale)), calc(-80px * var(--scale))) rotate(323deg)',
    left: 'translate(calc(-79px * var(--scale)), calc(-62px * var(--scale))) rotate(308deg)',
    right:
      'translate(calc(-37px * var(--scale)), calc(-93px * var(--scale))) rotate(338deg)',
  },
};

let url = `ws://${window.location.host}/ws/`;

const dinnerSocket = new WebSocket(url);
let socketStatus =
  dinnerSocket.readyState !== WebSocket.CLOSED &&
  dinnerSocket.readyState !== WebSocket.CLOSING
    ? true
    : false;

if (socketStatus) {
  document.getElementById('connection-error').style.display = 'none';
} else {
  document.getElementById('connection-error').style.display = 'block';
}

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
  }

  switch (data.action) {
    case 'dinner_started':
      if (run_deadlockRadar) {
        deadlockRadar();
      }
      break;
    case 'choose_book':
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
      break;
    case 'return_book':
      document.getElementById(`book${data.book}`).style.display = 'block';
      document.getElementById(`${data.person}-book`).innerHTML = '';
      document.getElementById(`${data.person}-read`).innerHTML = data.read;
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} put book ${data.book} back on bookshelf.   [${data.time}]</div>`
      );
      break;
    case 'take_seat':
      document.getElementById(`${data.person}-waiting`).remove();
      document.getElementById(`${data.person}-seat`).innerHTML = data.seat;
      document.getElementById(`seat${data.seat}`).innerHTML = data.person;
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} takes a seat ${data.seat}.   [${data.time}]</div>`
      );
      break;
    case 'leave_table':
      document.getElementById(`seat${data.seat}`).innerHTML = '';
      document.getElementById(`${data.person}-seat`).innerHTML = '';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} left the table. Seat ${data.seat} is empty again.   [${data.time}]</div>`
      );
      break;
    case 'pick_left_fork_up':
      document.getElementById(`${data.person}-left-fork`).innerHTML = '+';
      document.getElementById(`fork${data.fork}`).style.transform =
        forks_transform[data.fork].left;
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} picks left fork (${data.fork}) up.   [${data.time}]</div>`
      );
      break;
    case 'pick_right_fork_up':
      document.getElementById(`${data.person}-right-fork`).innerHTML = '+';
      document.getElementById(`fork${data.fork}`).style.transform =
        forks_transform[data.fork].right;
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} picks right fork (${data.fork}) up.   [${data.time}]</div>`
      );
      break;
    case 'start_eating':
      document.getElementById(`${data.person}-eats`).innerHTML = 'yes';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} starts eating.   [${data.time}]</div>`
      );
      break;
    case 'finish_eating':
      document.getElementById(`${data.person}-eats`).innerHTML = '';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} finished eating.   [${data.time}]</div>`
      );
      break;
    case 'put_left_fork_down':
      document.getElementById(`fork${data.fork}`).style.transform =
        forks_transform[data.fork].neutral;
      document.getElementById(`${data.person}-left-fork`).innerHTML = '';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} put left fork (${data.fork}) down.   [${data.time}]</div>`
      );
      break;
    case 'put_right_fork_down':
      document.getElementById(`fork${data.fork}`).style.transform =
        forks_transform[data.fork].neutral;
      document.getElementById(`${data.person}-right-fork`).innerHTML = '';
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} put right fork (${data.fork}) down.   [${data.time}]</div>`
      );
      break;
    case 'leave':
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} read all books and left.   [${data.time}]</div>`
      );
      document.getElementById(`${data.person}-tr`).style.backgroundColor =
        'rgba(255, 95, 165, 0.2)';
      break;
    case 'evacuation':
      history.insertAdjacentHTML(
        'afterbegin',
        `<div class="status">${data.person} left.   [${data.time}]</div>`
      );
      document.getElementById(`${data.person}-tr`).style.backgroundColor =
        'rgba(255, 95, 165, 0.2)';
      break;
    case 'dinner_ended':
      dinner_status = false;
      stop_dinner_button.style.display = 'none';
      start_dinner_button.style.display = 'block';
      unlockBackend();
      break;
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
      document.getElementById('deadlock-wrapper').style.display = 'block';
      clearInterval(intervalID);
      stop_dinner_button.style.backgroundColor = 'grey';
      stop_dinner_button.disabled = true;
    }
  } else {
    clearInterval(intervalID);
  }
}
