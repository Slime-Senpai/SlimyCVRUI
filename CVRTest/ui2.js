/* globals slimyBackgroundClasslist, slimyConfig, slimyFeed, engine, refreshFriends */ // eslint-disable-line no-unused-vars

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
    obj: this.obj,
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
    obj: this.obj,
    name: this.name,
    value: this.getValue,
    updateValue: this.updateValue
  };
}

function SlimyInpDropdown (_obj) {
  this.obj = _obj;
  this.value = _obj.getAttribute('data-current');
  this.options = _obj.getAttribute('data-options').split(',');
  this.name = _obj.id;
  this.opened = false;
  this.keyValue = [];

  this.optionElements = [];

  const self = this;

  this.selectValue = function (_e) {
    self.value = _e.target.getAttribute('data-key');
    self.valueElement.innerHTML = _e.target.getAttribute('data-value');
    self.globalClose();
    /* TODO TO CHANGE
     * engine.call('CVRAppCallSaveSetting', self.name, self.value);
     * game_settings[self.name] = self.value;
     */
  };

  this.openClick = function (_e) {
    if (self.obj.classList.contains('open')) {
      self.obj.classList.remove('open');
      self.list.setAttribute('style', 'display: none;');
    } else {
      self.obj.classList.add('open');
      self.list.setAttribute('style', 'display: block;');
      self.opened = true;
      window.setTimeout(function () { self.opened = false; }, 10);
    }
  };

  this.globalClose = function (_e) {
    if (self.opened) return;
    self.obj.classList.remove('open');
    self.list.setAttribute('style', 'display: none;');
  };

  this.list = document.createElement('div');
  this.list.className = 'valueList';

  this.updateOptions = function () {
    for (let i = 0; i < self.options.length; i++) {
      self.optionElements[i] = document.createElement('div');
      self.optionElements[i].className = 'listValue';
      const valuePair = self.options[i].split(':');
      let key = '';
      let value = '';
      if (valuePair.length === 1) {
        key = valuePair[0];
        value = valuePair[0];
      } else {
        key = valuePair[0];
        value = valuePair[1];
      }
      self.keyValue[key] = value;
      self.optionElements[i].innerHTML = value;
      self.optionElements[i].setAttribute('data-value', value);
      self.optionElements[i].setAttribute('data-key', key);
      self.list.appendChild(self.optionElements[i]);
      self.optionElements[i].addEventListener('mousedown', self.selectValue);
    }
  };

  this.updateOptions();

  this.valueElement = document.createElement('div');
  this.valueElement.className = 'dropdown-value';
  this.valueElement.innerHTML = this.keyValue[this.value];

  this.obj.appendChild(this.valueElement);
  this.obj.appendChild(this.list);
  this.valueElement.addEventListener('mousedown', this.openClick);
  document.addEventListener('mousedown', this.globalClose);

  this.getValue = function () {
    return self.value;
  };

  this.updateValue = function (value) {
    self.value = value;
    self.valueElement.innerHTML = self.keyValue[value];
  };

  this.setOptions = function (optionString) {
    self.options = optionString.split(',');
  };

  return {
    obj: this.obj,
    name: this.name,
    value: this.getValue,
    updateValue: this.updateValue,
    updateOptions: this.updateOptions,
    setOptions: this.setOptions
  };
}

function getSliderDiv (name, classes = [], dataMin = '0', dataMax = '255', dataCurrent = '128') {
  const div = document.createElement('div');
  div.id = name;
  div.classList.add('slimy_slider');
  for (let i = 0; i < classes.length; i++) {
    div.classList.add(classes);
  }
  div.setAttribute('data-min', dataMin);
  div.setAttribute('data-max', dataMax);
  div.setAttribute('data-current', dataCurrent);

  return div;
}

function createRowWrapper (parent, child, title = '') {
  const rowWrapRed = document.createElement('div');
  rowWrapRed.classList.add('row-wrapper');

  const optionCaption = document.createElement('div');
  optionCaption.classList.add('option-caption');
  optionCaption.innerHTML = title;

  const optionInput = document.createElement('div');
  optionInput.classList.add('option-input');
  optionInput.appendChild(child);

  rowWrapRed.appendChild(optionCaption);
  rowWrapRed.appendChild(optionInput);

  parent.appendChild(rowWrapRed);
}

function SlimyColorSettings (name) {
  this.obj = document.createElement('div');
  this.obj.id = 'SlimyColorSettings' + name;
  this.name = name;

  this.preview = document.createElement('div');
  this.preview.classList.add('slimyColorPreview');
  this.obj.appendChild(this.preview);

  this.red = new SlimyInpSlider(getSliderDiv('SlimyColorRed' + name, ['slimyred']));
  createRowWrapper(this.obj, this.red.obj, 'Color Red ' + name);

  this.green = new SlimyInpSlider(getSliderDiv('SlimyColorGreen' + name, ['slimygreen']));
  createRowWrapper(this.obj, this.green.obj, 'Color Green ' + name);

  this.blue = new SlimyInpSlider(getSliderDiv('SlimyColorBlue' + name, ['slimyblue']));
  createRowWrapper(this.obj, this.blue.obj, 'Color Blue ' + name);

  this.alpha = new SlimyInpSlider(getSliderDiv('SlimyColorAlpha' + name, '', 0, 100, 100));
  createRowWrapper(this.obj, this.alpha.obj, 'Color Alpha ' + name);

  const self = this;
  this.mouseUp = function (e) {
    self.preview.style.backgroundColor = 'rgb(' + self.red.value() + ', ' + self.green.value() + ', ' + self.blue.value() + ')';
  };

  this.obj.addEventListener('mouseup', this.mouseUp);

  this.mouseUp();

  return {
    obj: this.obj,
    name: this.name,
    red: this.red,
    green: this.green,
    blue: this.blue,
    alpha: this.alpha
  };
}

function createNewColorSettings (name = slimySettings.length) {
  const newSettings = new SlimyColorSettings(name);
  newSettings.obj.classList.add('row-color-wrapper');
  const settingsZone = document.querySelector('#slimySettingsZone');
  settingsZone.appendChild(newSettings.obj);

  slimySettings.push(newSettings);
}

function updateStuff () {
  const change = [];
  for (let i = 0; i < slimySettings.length; i++) {
    if (typeof slimySettings[i].value === 'function' && slimySettings[i].value() !== slimyValues[i]) { // MAGIC For now, slimySettings contains objects who have values and settings.
      change[change.length] = slimySettings[i].name;
      slimyValues[i] = slimySettings[i].value();
    } else if (typeof slimySettings[i] === 'function') {
      // NOTHING
    }
  }

  let updateBackgroundImage = true;

  for (let i = 0; i < change.length; i++) {
    if (updateBackgroundImage && (change[i].includes('SlimyBackgroundImage') || change[i].includes('SlimyToolbarImage'))) {
      changeBackgroundImage(change[i].includes('SlimyBackgroundImage'));
      updateBackgroundImage = false;
    }
  }

  updateCSS();
}

// Background Colors and Image

function changeBackgroundImage (background) {
  let image = false;
  let sameAsMenu = null;

  for (let i = 0; i < slimySettings.length; i++) {
    if (background && slimySettings[i].name === 'SlimyBackgroundImageToggle') {
      image = slimySettings[i].value();
    } else if (!background && slimySettings[i].name === 'SlimyToolbarImageToggle') {
      image = slimySettings[i].value();
    } else if (!background && slimySettings[i].name === 'SlimyToolbarImageSameAsMenuToggle') {
      sameAsMenu = slimySettings[i].value();
    }
  }

  const contents = document.querySelectorAll((background ? '.content' : '.toolbar') + ' .image');

  for (let i = 0; i < contents.length; i++) {
    if (image) {
      contents[i].classList.add('enabled');
      if (sameAsMenu !== null) {
        contents[i].setAttribute('data-contentImage', sameAsMenu ? 'true' : 'false');
      }
    } else {
      contents[i].classList.remove('enabled');
    }
  }
}

function updateCSS () {
  /*
  while (document.styleSheets[2].cssRules.length > 0) {
    for (let i = 0; i < document.styleSheets[2].cssRules.length; i++) {
      document.styleSheets[2].deleteRule(i);
    }
  }

  for (let i = 0; i < slimyBackgroundElements.length; i++) {
    const selector = slimyBackgroundElements[i].selector;

    const types = slimyBackgroundElements[i].types;

    const css = slimyBackgroundElements[i].alpha !== '' ? 'rgba(' : 'rgb(';
    const realAlpha = slimyBackgroundElements[i].alpha !== '' ? ',' + (alpha + ((slimyBackgroundElements[i].alpha - 80) / 100)) : '';
    const color = Math.round(red * slimyBackgroundElements[i].multiplier) + ',' + Math.round(green * slimyBackgroundElements[i].multiplier) + ',' + Math.round(blue * slimyBackgroundElements[i].multiplier) + realAlpha + ')';

    if (types.includes('background-color')) {
      document.styleSheets[2].insertRule(selector + ' { background-color: ' + css + color + '; }');
    }

    if (types.includes('border-color')) {
      document.styleSheets[2].insertRule(selector + ' { border-color: ' + css + color + '; }');
    }
  }

  */

  let backgroundAlpha = 1;
  let toolbarAlpha = 1;
  let toolbarSameAsBackground = false;

  for (let i = 0; i < slimySettings.length; i++) {
    switch (slimySettings[i].name) {
      case 'SlimyBackgroundImageAlpha':
        backgroundAlpha = (slimySettings[i].value() / 100);
        break;
      case 'SlimyToolbarImageAlpha':
        toolbarAlpha = (slimySettings[i].value() / 100);
        break;
      case 'SlimyToolbarImageSameAsMenuToggle':
        toolbarSameAsBackground = slimySettings[i].value();
        break;
      default:
    }
  }
  document.styleSheets[2].insertRule('.content .image { opacity: ' + backgroundAlpha + '; }');
  document.styleSheets[2].insertRule('.toolbar .image { opacity: ' + (toolbarSameAsBackground ? backgroundAlpha : toolbarAlpha) + '; }');

  // document.styleSheets[2].insertRule('#home h1 span { color: rgb(' + Math.round(red * 0.3) + ',' + Math.round(green * 0.3) + ',' + Math.round(blue * 0.3) + '); }');
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

function createToolbarImage () {
  const toolbar = document.querySelector('.toolbar');

  const image = document.createElement('div');
  image.classList.add('image');
  toolbar.appendChild(image);
}

createToolbarImage();

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

/*
<div class="row-wrapper">
<div class="option-caption">Menu Background Color</div>
<div class="option-input">
<div id="SlimyMenuBackgroundColor" class="slimy_dropdown" data-options="0:Default" data-current="0"></div>
</div>
</div>
*/

const slimyDropdowns = [];

function createDropdowns () {
  const slimyDropdownsList = [
    { id: 'SlimyMenuBackgroundColor', title: 'Menu BG Color', type: 'background', selectors: '' },
    { id: 'SlimyMenuBorderColor', title: 'Menu Border Color', type: 'border', selectors: '' },
    { id: 'SlimyMenuTextColor', title: 'Menu Text Color', type: 'text', selectors: '' },
    { id: 'SlimyMenuButtonBackgroundColor', title: 'Menu Btn BG Color', type: 'btn-background', selectors: '' },
    { id: 'SlimyMenuButtonBorderColor', title: 'Menu Btn Border Color', type: 'border', selectors: '' },
    { id: 'SlimyMenuButtonTextColor', title: 'Menu Btn Text Color', type: 'text', selectors: '' },
    { id: 'SlimyToolbarBackgroundColor', title: 'Toolbar BG Color', type: 'background', selectors: '' },
    { id: 'SlimyToolbarBorderColor', title: 'Toolbar Border Color', type: 'border', selectors: '' },
    { id: 'SlimyToolbarTextColor', title: 'Toolbar Text Color', type: 'text', selectors: '' },
    { id: 'SlimyToolbarButtonBackgroundColor', title: 'Toolbar Btn BG Color', type: 'btn-background', selectors: '' },
    { id: 'SlimyToolbarButtonBorderColor', title: 'Toolbar Btn Border Color', type: 'border', selectors: '' },
    { id: 'SlimyToolbarButtonTextColor', title: 'Toolbar Btn Text Color', type: 'text', selectors: '' }
  ];
  const parent = document.querySelector('#slimyDropdownsZone');
  let wrapper;
  for (let i = 0; i < slimyDropdownsList.length; i++) {
    if (i % 3 === 0) {
      if (wrapper) parent.appendChild(wrapper);
      wrapper = document.createElement('div');
      wrapper.classList.add('row-color-wrapper');
    }
    const div = document.createElement('div');
    div.id = slimyDropdownsList[i].id;
    div.classList.add('slimy_dropdown');
    div.setAttribute('data-options', '0:Default');
    div.setAttribute('data-current', '0');
    div.setAttribute('data-selectors', slimyDropdownsList[i].selectors);

    const dropdown = new SlimyInpDropdown(div);

    slimyDropdowns.push(dropdown);

    createRowWrapper(wrapper, dropdown.obj, slimyDropdownsList[i].title);

    const index = slimySettings.length;
    slimySettings[index] = dropdown;
    slimyValues[index] = slimySettings[index].value();
  }
}

createDropdowns();

document.querySelector('#slimyNewColor').addEventListener('click', function (e) {
  createNewColorSettings();
});

/* TODO CHANGE
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
*/

const slimyBackgroundElements = [];

for (let i = 0; i < slimyBackgroundClasslist.length; i++) {
  let multiplier = 1;
  if (slimyBackgroundClasslist[i].type === 'dark') {
    multiplier = 0.625;
  } else if (slimyBackgroundClasslist[i].type === 'light') {
    multiplier = 1.40625;
  }
  slimyBackgroundElements[slimyBackgroundElements.length] = { types: slimyBackgroundClasslist[i].types, selector: slimyBackgroundClasslist[i].selector, multiplier: multiplier, alpha: slimyBackgroundClasslist[i].alpha };
}

updateStuff();

// Version

function checkVersion (uiVersion, chilloutVersion) {
  const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
  xhr.open('GET', 'http://slimesenpai.fr:8042/chilloutui/checkVersion?v=' + uiVersion + '&cv=' + chilloutVersion, true);
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
    } else if (xhr.readyState === 4 && xhr.status === 404) {
      const slimyVersion = document.querySelector('.slimy-ui-version');
      if (slimyVersion) slimyVersion.style.color = 'orange';
    }
  };
  xhr.send();
}

const slimyCVRVersion = '2021r159 RELEASE';
const slimyUIVersion = '1.0.8';

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
/* NOTE This doesn't work anymore
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
*/
// Feed
/*
function updateFeed () {
  const newsDiv = document.querySelector('.content-feed .feed-news');

  let html = '';

  html += '<pre>';

  html += slimyFeed;

  html += '</pre>';

  newsDiv.innerHTML = html;
}

updateFeed();
*/
// Secret

function validateSecret (secret) {
  if (!secret || secret === '') {
    slimySecret.validated = false;
    document.querySelector('#SlimySecret').innerHTML = 'Not Validated';
    return;
  }

  const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
  xhr.open('POST', 'http://slimesenpai.fr:8042/chilloutui/secret', true); // FIXME Can't use POST
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const slimySecretDiv = document.querySelector('#SlimySecret');

      const response = JSON.parse(xhr.responseText);
      if (response) {
        slimySecretDiv.innerHTML = response.validated ? 'Validated' : 'Not Validated';
        slimySecret.validated = response.validated === true;
      }
    } else if (xhr.readyState === 4) {
      const slimySecretDiv = document.querySelector('#SlimySecret');
      slimySecretDiv.innerHTML = 'Not Validated';
      slimySecret.validated = false;
    }
  };
  xhr.setRequestHeader('Content-Type', 'application/json'); // FIXME Can't use setRequestHeader
  xhr.send('{ "secret": "' + secret + '" }');
}

const slimySecret = {
  value: slimyConfig.slimySecret,
  validated: false
};

validateSecret(slimyConfig.slimySecret);
