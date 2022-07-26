/* globals engine, specialPeople */

// #region logs

// #region cvr-func-changes

/* globals fadeoutTimer, fadeinTimer, messageShown */
/* globals renderHudMessage, hudMessageBuffer, closeHudMessage */

displayHudMessage = (head, title, message, fadeTime) => { // eslint-disable-line no-undef
  if (/(A|The) user has (joined your Instance|disconnected from this Instance)\./.test(message.trim())) {
    return;
  }
  hudMessageBuffer.push({
    head: head,
    title: title,
    message: message,
    fadeTime: fadeTime
  });
  if (!messageShown) {
    renderHudMessage();
  }
};

displayHudMessageImmediately = (head, title, message, fadeTime) => { // eslint-disable-line no-undef
  if (/(A|The) user has (joined your Instance|disconnected from this Instance)\./.test(message.trim())) {
    return;
  }
  hudMessageBuffer = []; // eslint-disable-line no-global-assign
  clearTimeout(fadeinTimer);
  clearTimeout(fadeoutTimer);
  messageShown = true; // eslint-disable-line no-global-assign
  document.querySelector('.hud-message').classList.add('active');
  document.querySelector('.hud-message .authorative').innerHTML = head;
  document.querySelector('.hud-message .headline').innerHTML = title;
  document.querySelector('.hud-message .message').innerHTML = message;

  fadeinTimer = window.setTimeout(closeHudMessage, fadeTime * 1000 + 500); // eslint-disable-line no-global-assign
};

// #endregion cvr-func-changes

let friendsName = [];

const logsArea = document.getElementById('slimy-logs');

const displaySlimyHud = (head, title, message, fadeTime) => {
  if (!/(A|The) user has (joined your Instance|disconnected from this Instance)\./.test(message.trim())) {
    return;
  }

  const isDisconnect = message.indexOf('disconnected') !== -1;

  // ['Name', 'of', 'Person', ('joined'|'disconnected')]
  const titleArray = title.split(' ');

  // ['Name', 'of', 'Person']
  titleArray.pop();

  // Name of Person
  const username = titleArray.join(' ');

  const isFriend = friendsName.some(e => e === username);

  const log = document.createElement('div');
  log.classList.add('slimy-log');

  log.classList.add(isDisconnect ? 'disconnected' : 'joined');
  // 'Name of Person (joined.|disconnected)'
  let text = title.trim();
  // 'Name of Person (joined|disconnected)'
  if (text[text.length - 1] === '.') text = text.substring(0, text.length - 1);
  const date = new Date();

  let hours = '' + date.getHours();
  if (hours.length < 2) hours = '0' + hours;

  let minutes = '' + date.getMinutes();
  if (minutes.length < 2) minutes = '0' + minutes;

  let seconds = '' + date.getSeconds();
  if (seconds.length < 2) seconds = '0' + seconds;

  const info = specialPeople.find((e) => e.list.some(f => f === username));

  let sound = 'hudAudio';

  sound += isDisconnect ? '_disconnect' : '_join';

  if (info !== undefined) {
    sound += info.title;

    if (info.joinColor && !isDisconnect) {
      log.style.color = info.joinColor;
    } else if (info.disconnectColor && isDisconnect) {
      log.style.color = info.disconnectColor;
    }
  } else if (isFriend) {
    sound += 'friend';

    log.classList.add('friend');
  }

  log.innerHTML = `${hours}:${minutes}:${seconds} - ${text}`;
  logsArea.appendChild(log);

  engine.call('SL1PlayAudio', sound);

  if (logsArea.children.length > 100) {
    logsArea.removeChild(logsArea.firstChild);
  }

  setTimeout(() => {
    log.classList.add('dying');
    setTimeout(() => {
      log.classList.remove('dying');
      log.classList.add('dead');
    }, 600);
  }, fadeTime * 5000);
};

engine.on('DisplayHudMessage', (head, title, message, fadeTime) => {
  displaySlimyHud(head, title, message, fadeTime);
});
engine.on('DisplayHudMessageImmediately', (head, title, message, fadeTime) => {
  displaySlimyHud(head, title, message, fadeTime);
});

engine.on('SL1LoadFriends', (list) => {
  friendsName = list.map(e => {
    return e.UserName;
  });
});

// #endregion logs
