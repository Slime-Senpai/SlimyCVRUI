/* globals slimyBackgroundClasslist, slimyConfig, slimyFeed, engine, refreshFriends */

/*
const currFeed = [];

function displayHudAsFeed (_head, _title, _message, _important) {
  const feeds = document.querySelector('.content-feed .feed-content');

  let html = feeds.innerHTML;

  currFeed.push({ _head: _head, _title: _title, _message: _message, _important: _important });

  if (currFeed.length > 7) currFeed.shift();

  currFeed.forEach(function (feed) {
    html += `<div class="feed-wrapper${feed._important ? ' feed-important' : ''}">
        <div class="feed-head">${feed._head}</div>
        <div class="feed-title">${feed._title}</div>
        <div class="feed-message">${feed._message}</div>
    </div>
    `;
  });

  feeds.innerHTML = html;
}
*/

// Slimy Settings Factory Functions

function SlimyInpSlider (_obj) {
  this.obj = _obj;
  this.minValue = parseFloat(_obj.getAttribute('data-min'));
  this.maxValue = parseFloat(_obj.getAttribute('data-max'));
  this.percent = 0;
  this.value = parseFloat(_obj.getAttribute('data-current'));
  this.dragActive = false;
  this.name = _obj.id;

  const self = this;

  this.valueBar = document.createElement('div');
  this.valueBar.className = 'valueBar';
  this.valueBar.setAttribute('style', 'width: ' + (((this.value - this.minValue) / (this.maxValue - this.minValue)) * 100) + '%;');
  this.obj.appendChild(this.valueBar);

  this.valueLabel = document.createElement('div');
  this.valueLabel.className = 'valueLabel';
  this.valueLabel.innerHTML = Math.round(this.value);
  this.obj.appendChild(this.valueLabel);

  this.mouseDown = function (_e) {
    self.dragActive = true;
    self.mouseMove(_e, false);
  };

  this.mouseMove = function (_e, _write) {
    if (self.dragActive) {
      const rect = _obj.getBoundingClientRect();
      const start = rect.left;
      // const end = rect.right;
      self.percent = Math.min(Math.max((_e.clientX - start) / rect.width, 0), 1);
      let value = self.percent;
      value *= (self.maxValue - self.minValue);
      value += self.minValue;
      self.value = Math.round(value);

      self.valueBar.setAttribute('style', 'width: ' + (self.percent * 100) + '%;');
      self.valueLabel.innerHTML = self.value;

      if (_write === true) {
        // TODO TO CHANGE engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
        updateStuff();
        self.displayImperial();
      }
    }
  };

  this.mouseUp = function (_e) {
    self.mouseMove(_e, true);
    self.dragActive = false;
  };

  _obj.addEventListener('mousedown', this.mouseDown);
  document.addEventListener('mousemove', this.mouseMove);
  document.addEventListener('mouseup', this.mouseUp);
  // _obj.addEventListener('mouseup', this.mouseUp);

  this.getValue = function () {
    return self.value;
  };

  this.updateValue = function (value) {
    self.value = Math.round(value);
    self.percent = (self.value - self.minValue) / (self.maxValue - self.minValue);
    self.valueBar.setAttribute('style', 'width: ' + (self.percent * 100) + '%;');
    self.valueLabel.innerHTML = self.value;
    self.displayImperial();
  };

  this.displayImperial = function () {
    const displays = document.querySelectorAll('.imperialDisplay');
    for (let i = 0; i < displays.length; i++) {
      const binding = displays[i].getAttribute('data-binding');
      if (binding === self.name) {
        const realFeet = ((self.value * 0.393700) / 12);
        const feet = Math.floor(realFeet);
        const inches = Math.floor((realFeet - feet) * 12);
        displays[i].innerHTML = feet + '&apos;' + inches + '&apos;&apos;';
      }
    }
  };

  return {
    name: this.name,
    value: this.getValue,
    updateValue: this.updateValue
  };
}

function SlimyInpToggle (_obj) {
  this.obj = _obj;
  this.value = _obj.getAttribute('data-current') === 'true';
  this.name = _obj.id;

  const self = this;

  this.mouseDown = function (_e) {
    self.value = !self.value;
    self.updateState();
  };

  this.updateState = function () {
    if (self.value) {
      self.obj.classList.add('checked');
    } else {
      self.obj.classList.remove('checked');
    }
    /* TODO TO CHANGE
      * engine.call('CVRAppCallSaveSetting', self.name, self.value);
      * game_settings[self.name] = self.value;
    */
    updateStuff();
  };

  _obj.addEventListener('mousedown', this.mouseDown);

  this.getValue = function () {
    return self.value;
  };

  this.updateValue = function (value) {
    self.value = value;

    if (self.value) {
      self.obj.classList.add('checked');
    } else {
      self.obj.classList.remove('checked');
    }
  };

  this.updateValue(this.value);

  return {
    name: this.name,
    value: this.getValue,
    updateValue: this.updateValue
  };
}

function updateStuff () {
  const change = [];
  for (let i = 0; i < slimySettings.length; i++) {
    if (slimySettings[i].value() !== slimyValues[i]) {
      change[change.length] = slimySettings[i].name;
      slimyValues[i] = slimySettings[i].value();
    }
  }

  let updateBackgroundColor = true;
  let updateBackgroundImage = true;

  for (let i = 0; i < change.length; i++) {
    if (updateBackgroundColor && change[i].includes('SlimyBackgroundColor')) {
      changeBackgroundColor();
      updateBackgroundColor = false;
    } else if (updateBackgroundImage && change[i].includes('SlimyBackgroundImage')) {
      changeBackgroundImage();
      updateBackgroundImage = false;
    }
  }
}

// Background Colors and Image

function changeBackgroundImage () {
  let image = false;

  for (let i = 0; i < slimySettings.length; i++) {
    if (slimySettings[i].name === 'SlimyBackgroundImageToggle') {
      image = slimySettings[i].value();
    }
  }

  const contents = document.querySelectorAll('.content .image');

  for (let i = 0; i < contents.length; i++) {
    if (image) {
      contents[i].classList.add('enabled');
    } else {
      contents[i].classList.remove('enabled');
    }
  }
}

function changeBackgroundColor () {
  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;
  for (let i = 0; i < slimySettings.length; i++) {
    if (slimySettings[i].name === 'SlimyBackgroundColorRed') {
      red = slimySettings[i].value();
    } else if (slimySettings[i].name === 'SlimyBackgroundColorGreen') {
      green = slimySettings[i].value();
    } else if (slimySettings[i].name === 'SlimyBackgroundColorBlue') {
      blue = slimySettings[i].value();
    } else if (slimySettings[i].name === 'SlimyBackgroundColorAlpha') {
      alpha = (slimySettings[i].value() / 100);
    }
  }

  for (let i = 0; i < document.styleSheets[2].cssRules.length; i++) {
    document.styleSheets[2].deleteRule(i);
  }

  for (let i = 0; i < slimyBackgroundElements.length; i++) {
    const selector = slimyBackgroundElements[i].selector;

    const css = slimyBackgroundElements[i].alpha !== '' ? 'rgba(' : 'rgb(';
    const realAlpha = slimyBackgroundElements[i].alpha !== '' ? ',' + (alpha + ((slimyBackgroundElements[i].alpha - 80) / 100)) : '';
    const color = Math.round(red * slimyBackgroundElements[i].multiplier) + ',' + Math.round(green * slimyBackgroundElements[i].multiplier) + ',' + Math.round(blue * slimyBackgroundElements[i].multiplier) + realAlpha + ')';

    document.styleSheets[2].insertRule(selector + ' { background-color: ' + css + color + '; }');
  }

  document.styleSheets[2].insertRule('.content .image { opacity: ' + alpha + '; }');

  document.styleSheets[2].insertRule('#home h1 span { color: rgb(' + Math.round(red * 0.3) + ',' + Math.round(green * 0.3) + ',' + Math.round(blue * 0.3) + '); }');
}

const slimySettings = [];
const slimyValues = [];

// NOTE We can't use pseudo elements ::after or ::before so we need to use another div to have opacity
function createBackgroundImage () {
  const contents = document.querySelectorAll('.content');

  for (let i = 0; i < contents.length; i++) {
    const image = document.createElement('div');
    image.classList.add('image');
    contents[i].appendChild(image);
  }
}

createBackgroundImage();

const slimySliders = document.querySelectorAll('.slimy_slider');

for (let i = 0; i < slimySliders.length; i++) {
  const index = slimySettings.length;
  slimySettings[index] = new SlimyInpSlider(slimySliders[i]);
  slimyValues[index] = slimySettings[index].value();
}

const slimyToggles = document.querySelectorAll('.slimy_toggle');

for (let i = 0; i < slimyToggles.length; i++) {
  const index = slimySettings.length;
  slimySettings[index] = new SlimyInpToggle(slimyToggles[i]);
  slimyValues[index] = slimySettings[index].value();
}

for (let i = 0; i < slimySettings.length; i++) {
  if (slimySettings[i].name === 'SlimyBackgroundColorRed') {
    slimySettings[i].updateValue(slimyConfig.slimyBackgroundDefaultRed);
  } else if (slimySettings[i].name === 'SlimyBackgroundColorGreen') {
    slimySettings[i].updateValue(slimyConfig.slimyBackgroundDefaultGreen);
  } else if (slimySettings[i].name === 'SlimyBackgroundColorBlue') {
    slimySettings[i].updateValue(slimyConfig.slimyBackgroundDefaultBlue);
  } else if (slimySettings[i].name === 'SlimyBackgroundColorAlpha') {
    slimySettings[i].updateValue(slimyConfig.slimyBackgroundDefaultAlpha);
  } else if (slimySettings[i].name === 'SlimyBackgroundImageToggle') {
    slimySettings[i].updateValue(slimyConfig.slimyBackgroundDefaultImageToggle);
  }
}

const slimyBackgroundElements = [];

for (let i = 0; i < slimyBackgroundClasslist.length; i++) {
  let multiplier = 1;
  if (slimyBackgroundClasslist[i].type === 'dark') {
    multiplier = 0.625;
  } else if (slimyBackgroundClasslist[i].type === 'light') {
    multiplier = 1.40625;
  }
  slimyBackgroundElements[slimyBackgroundElements.length] = { selector: slimyBackgroundClasslist[i].selector, multiplier: multiplier, alpha: slimyBackgroundClasslist[i].alpha };
}

updateStuff();

// Version

function checkVersion (uiVersion, chilloutVersion) {
  const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
  xhr.open('GET', 'http://sf4y.fr:8042/chilloutui/checkVersion?v=' + uiVersion + '&cv=' + chilloutVersion, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const slimyVersion = document.querySelector('.slimy-ui-version');
      const response = JSON.parse(xhr.responseText);
      if (response) {
        if (response.exists === true) {
          if (response.upToDate === true) {
            if (slimyVersion) slimyVersion.style.color = 'green';
          } else if (response.upToDate === false) {
            if (slimyVersion) slimyVersion.style.color = 'red';
          }
        } else if (response.exists === false) {
          if (response.upToDate === true) {
            if (slimyVersion) slimyVersion.style.color = 'midnightblue';
          } else if (response.upToDate === false) {
            if (slimyVersion) slimyVersion.style.color = 'blueviolet';
          }
        }
      }
    }
  };
  xhr.send();
}

const slimyCVRVersion = '2021r159 Experimental 15';
const slimyUIVersion = '1.0.6';

const slimyChilloutVersion = document.querySelector('.slimy-ui-chillout-version');
if (slimyChilloutVersion) slimyChilloutVersion.innerHTML = slimyCVRVersion;
const slimyVersionDiv = document.querySelector('.slimy-ui-version');
if (slimyVersionDiv) slimyVersionDiv.innerHTML = slimyUIVersion;

let slimyVersionValidated = false;

engine.on('UpdateGameDebugInformation', function (_info) {
  if (slimyVersionValidated) {
    return;
  }

  const cvrVersion = (_info && _info.Version) ? _info.Version.replace(/\s+/g, '') : slimyCVRVersion.replace(/\s+/g, '');

  checkVersion(slimyUIVersion, cvrVersion);

  slimyVersionValidated = true;
});

// Friends

engine.on('LoadFriends', function (_list, _filter) {
  if (!_list || _list.length === 0) {
    return;
  }

  const onlineFriends = [];
  for (let i = 0; i < _list.length; i++) {
    if (_list[i].OnlineState) {
      onlineFriends.push(_list[i]);
    }
  }
  renderOnlineFriends(onlineFriends);
});

function renderOnlineFriends (onlineFriends) {
  const contentList = document.querySelector('.content-friends .list-content');

  let html = '';

  for (let i = 0; onlineFriends[i]; i++) {
    if (i % 3 === 0) {
      if (i !== 0) {
        html += '</div>';
      }
      html += '<div class="content-row">';
    }

    html += '<div class="content-cell online-friend"><div class="content-cell-formatter"></div>' +
            '<div class="content-cell-content"><div class="online-state online"></div>' +
            '<img class="content-image" src="' +
            onlineFriends[i].ProfileImageUrl + '"><div class="content-name">' +
            onlineFriends[i].PlayerName + '</div><div class="content-btn second" ' +
            'onclick="getUserDetails(\'' + onlineFriends[i].Guid + '\');">Details</div>' +
            '</div></div>';
  }

  contentList.innerHTML = html;
}

refreshFriends();

// Feed

function updateFeed () {
  const newsDiv = document.querySelector('.content-feed .feed-news');

  let html = '';

  html += '<pre>';

  html += slimyFeed;

  html += '</pre>';

  newsDiv.innerHTML = html;
}

updateFeed();
