/* globals slimyBackgroundClasslist, slimyConfig, slimyFeed, engine, refreshFriends, renderFriends, friendList, loadFriends, loadInstanceDetail */ // eslint-disable-line no-unused-vars

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

// #region Slimy Settings Factory Functions

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

// #endregion

// #region Background Colors and Image

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
    {
      id: 'SlimyMenuBackgroundColor',
      title: 'Menu BG Color',
      type: 'background',
      selectors: '.content, #world-detail, .world-instancing, #instance-detail, #user-detail, .tab-contents, .user-settings-dialog, .message-box, .valueList, #keyboard, #avatar-settings, #numpad, #avatar-detail, .favorite-category-selection' // .quick-menu-wrapper, .quick-menu-content
    },
    {
      id: 'SlimyMenuBorderColor',
      title: 'Menu Border Color',
      type: 'border',
      selectors: ''
    },
    {
      id: 'SlimyMenuTextColor',
      title: 'Menu Text Color',
      type: 'text',
      selectors: '.content'
    },
    {
      id: 'SlimyMenuButtonBackgroundColor',
      title: 'Menu Btn BG Color',
      type: 'btn-background',
      selectors: '.btn-region .region-select, .btn-rule .rule-select, .tab-btn.active .active-overlay',
      lightSelectors: '.filter-option.active, .filter-option:hover, .content-btn:hover, .action-btn:hover, .close-btn:hover, ' +
      '.world-instancing .content-btn.active, .btn-region .region-select.active, .btn-region .region-select:hover, .btn-rule .rule-select.active, .btn-rule .rule-select:hover, ' +
      '.content-instance-buttons .instance-btn:hover, .user-toolbar .toolbar-btn:hover, .message-btn:hover, .inp_dropdown:hover, .inp_dropdown .valueList .listValue:hover, ' +
      '.keyboard-key:hover, .keyboard-mod:hover, .keyboard-func:hover, .keyboard-key.active, .keyboard-mod.active, .keyboard-func.active, .advAvtrProfName:hover, .advAvtrProfSave:hover, .advAvtrProfDelete:hover, .numpadButton:hover, .avatar-toolbar .toolbar-btn:hover',
      darkSelectors: '.content-btn.disabled, .world-instancing .content-btn.disabled, .world-instancing .content-btn.disabled:hover, .content-instance-buttons .instance-btn.disabled, ' +
      '.user-toolbar .toolbar-btn.disabled, .message-btn.disabled, .avatar-toolbar .toolbar-btn.disabled'
    },
    {
      id: 'SlimyMenuButtonBorderColor',
      title: 'Menu Btn Border Color',
      type: 'border',
      selectors: ''
    },
    {
      id: 'SlimyMenuButtonTextColor',
      title: 'Menu Btn Text Color',
      type: 'text',
      selectors: ''
    },
    {
      id: 'SlimyToolbarBackgroundColor',
      title: 'Toolbar BG Color',
      type: 'background',
      selectors: '.toolbar'
    },
    {
      id: 'SlimyToolbarBorderColor',
      title: 'Toolbar Border Color',
      type: 'border',
      selectors: ''
    },
    {
      id: 'SlimyToolbarTextColor',
      title: 'Toolbar Text Color',
      type: 'text',
      selectors: '.toolbar'
    },
    {
      id: 'SlimyToolbarButtonBackgroundColor',
      title: 'Toolbar Btn BG Color',
      type: 'btn-background',
      selectors: '.toolbar-btn',
      lightSelectors: '.toolbar-btn.active, .toolbar-btn:hover',
      darkSelectors: '.toolbar-btn.deactivated'
    },
    {
      id: 'SlimyToolbarButtonBorderColor',
      title: 'Toolbar Btn Border Color',
      type: 'border',
      selectors: ''
    },
    {
      id: 'SlimyToolbarButtonTextColor',
      title: 'Toolbar Btn Text Color',
      type: 'text',
      selectors: '.toolbar-btn'
    }
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
  parent.appendChild(wrapper);
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

// #endregion

// #region Version

function checkVersion (uiVersion, chilloutVersion) {
  const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
  xhr.open('GET', 'https://slimesenpai.fr/chilloutui/checkVersion?v=' + uiVersion + '&cv=' + chilloutVersion, true);
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

const slimyCVRVersion = '2021r160 Experimental 3p4';
const slimyUIVersion = '1.0.8.6';

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

// #endregion

// #region Friends Refresh

let slimyFriendsTimeout = null;

function slimyFriendsRefresh () {
  const friendsButton = document.querySelector('#friends .list-filter .content-btn.second');

  friendsButton.removeEventListener('click', slimyFriendsRefresh);

  friendsButton.setAttribute('disabled', 'true');

  slimyFriendsTimeout = setTimeout(function () {
    const friendsButton = document.querySelector('#friends .list-filter .content-btn.second');
    friendsButton.removeAttribute('disabled');
    friendsButton.addEventListener('click', slimyFriendsRefresh);
  }, 5000);

  refreshFriends();
}

engine.on('LoadFriends', function () {
  const friendsButton = document.querySelector('#friends .list-filter .content-btn.second');

  friendsButton.removeAttribute('disabled');

  friendsButton.addEventListener('click', slimyFriendsRefresh);

  const buttons = document.querySelectorAll('#friends .filter-option');

  for (let i = 0; buttons[i]; i++) {
    buttons[i].classList.remove('active');
  }

  if (slimyFriendsTimeout !== null) clearTimeout(slimyFriendsTimeout);
  slimyFriendsTimeout = null;
});

document.querySelector('#friends .list-filter .content-btn.second').addEventListener('click', slimyFriendsRefresh);

loadFriends = function (_list) { // eslint-disable-line no-global-assign
  friendList = _list; // eslint-disable-line no-global-assign
  friendList.sort(function (a, b) {
    const firstParameter = a.UserIsOnline === b.UserIsOnline ? 0 : a.UserIsOnline ? -1 : 1;

    if (firstParameter === 0) {
      return a.UserName.toLowerCase().localeCompare(b.UserName.toLowerCase());
    } else {
      return firstParameter;
    }
  });

  for (let i = 0; i < friendList.length; i++) {
    friendList[i].FilterTags += ',' + (friendList[i].UserIsOnline ? 'frndonline' : 'frndoffline');
  }

  renderFriends(_list);
};

// #endregion

// #region Feed
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
// #endregion

// #region Secret
/*
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
*/
// #endregion

// #region Active world filter fix
refreshWorlds = () => { // eslint-disable-line no-undef
  worldsResetLoad = true; // eslint-disable-line no-undef
  worldFilter = 'wrldtrending'; // eslint-disable-line no-undef
  document.getElementById('worldsSearch').innerHTML = 'Search...';
  engine.trigger('CVRAppTaskRefreshWorlds');
};
// #endregion

// #region World Search
displayKeyboard = (_e) => { // eslint-disable-line no-undef
  const keyboard = document.getElementById('keyboard');
  document.getElementById('keyoard-input').value = _e.getAttribute('data-value');
  keyboardMaxLength = parseInt(_e.getAttribute('data-max-length')); // eslint-disable-line no-undef

  keyboardTarget = _e; // eslint-disable-line no-undef

  keyboard.classList.remove('hidden');
  keyboard.classList.add('in');
};

const slimyKeyboardFuncKeys = document.querySelectorAll('.keyboard-func');
for (let i = 0; i < slimyKeyboardFuncKeys.length; i++) {
  slimyKeyboardFuncKeys[i].removeEventListener('mousedown', sendFuncKey); // eslint-disable-line no-undef
}

sendFuncKey = (_e) => { // eslint-disable-line no-undef
  const input = document.getElementById('keyoard-input');
  const func = _e.target.getAttribute('data-key-func');
  const submit = keyboardTarget.getAttribute('data-submit'); // eslint-disable-line no-undef

  switch (func) {
    case 'BACKSPACE':
      input.value = input.value.substring(0, input.value.length - 1);
      break;
    case 'CLEAR':
      input.value = '';
      break;
    case 'ENTER':
      keyboardTarget.setAttribute('data-value', input.value); // eslint-disable-line no-undef
      closeKeyboard(); // eslint-disable-line no-undef
      if (submit != null) {
        window[submit]();
      }
      break;
    case 'BACK':
      closeKeyboard(); // eslint-disable-line no-undef
      break;
    case 'PASTE':
      keyboardPasteFromClipboard(); // eslint-disable-line no-undef
      break;
  }
};

for (let i = 0; i < slimyKeyboardFuncKeys.length; i++) {
  slimyKeyboardFuncKeys[i].addEventListener('mousedown', sendFuncKey); // eslint-disable-line no-undef
}

function slimySearchWorld () { // eslint-disable-line no-unused-vars
  const search = document.getElementById('worldsSearch').getAttribute('data-value').toLowerCase();
  document.getElementById('worldsSearch').innerHTML = search;
  document.getElementById('worldsSearch').setAttribute('data-value', '');

  if (search && worldList !== null && worldList.length !== 0) { // eslint-disable-line no-undef
    const filteredWorlds = worldList.filter(w => w.WorldName.toLowerCase().includes(search)); // eslint-disable-line no-undef
    renderWorlds(filteredWorlds); // eslint-disable-line no-undef
  }
}

filterContent = (_ident, _filter) => { // eslint-disable-line no-undef
  const buttons = document.querySelectorAll('#' + _ident + ' .filter-option');

  for (let i = 0; buttons[i]; i++) {
    buttons[i].classList.remove('active');
  }

  const activeButton = document.querySelector('#' + _ident + ' .filter-option.data-filter-' + _filter + '');
  if (activeButton != null) {
    activeButton.classList.add('active');
  }

  let list;

  switch (_ident) {
    case 'avatars':
      list = filterList(avatarList, _filter); // eslint-disable-line no-undef
      renderAvatars(list); // eslint-disable-line no-undef
      break;
    case 'worlds':
      worldFilter = _filter; // eslint-disable-line no-undef
      document.getElementById('worldsSearch').innerHTML = 'Search...';
      loadFilteredWorlds(); // eslint-disable-line no-undef
      break;
    case 'friends':
      list = filterList(friendList, _filter); // eslint-disable-line no-undef
      renderFriends(list);
      break;
  }
};
// #endregion

// HACK This whole region is just a quick fix for experimental glitch
// #region Joining instances

loadInstanceDetail = (_instance) => { // eslint-disable-line no-global-assign
  const detailPage = document.getElementById('instance-detail');
  closeAvatarSettings(); // eslint-disable-line no-undef

  document.querySelector('#instance-detail h1').innerHTML = 'Instance: ' + _instance.InstanceName;

  document.querySelector('#instance-detail .profile-image').src = _instance.Owner.UserImageUrl;
  document.querySelector('#instance-detail .content-instance-owner h2').innerHTML = _instance.Owner.UserName;
  document.querySelector('#instance-detail .content-instance-owner h3').innerHTML = _instance.Owner.UserRank;

  document.querySelector('#instance-detail .profile-badge img').src = _instance.Owner.FeaturedBadgeImageUrl;
  document.querySelector('#instance-detail .profile-badge p').innerHTML = _instance.Owner.FeaturedBadgeName;

  document.querySelector('#instance-detail .profile-group img').src = _instance.Owner.FeaturedGroupImageUrl;
  document.querySelector('#instance-detail .profile-group p').innerHTML = _instance.Owner.FeaturedGroupName;

  document.querySelector('#instance-detail .profile-avatar img').src = _instance.Owner.CurrentAvatarImageUrl;
  document.querySelector('#instance-detail .profile-avatar p').innerHTML = _instance.Owner.CurrentAvatarName;

  document.querySelector('#instance-detail .world-image').src = _instance.World.WorldImageUrl;
  document.querySelector('#instance-detail .content-instance-world h2').innerHTML = _instance.World.WorldName;
  document.querySelector('#instance-detail .content-instance-world p').innerHTML = 'by ' + _instance.World.AuthorName;
  document.querySelector('#instance-detail .content-instance-world p').setAttribute('onclick', 'getUserDetails(\'' + _instance.World.AuthorId + '\');');

  document.querySelector('#instance-detail .data-type').innerHTML = _instance.Privacy;
  document.querySelector('#instance-detail .data-region').innerHTML = _instance.Region;
  document.querySelector('#instance-detail .data-gamemode').innerHTML = _instance.GameMode;
  document.querySelector('#instance-detail .data-maxplayers').innerHTML = _instance.MaxPlayer;
  document.querySelector('#instance-detail .data-currplayers').innerHTML = _instance.CurrentPlayer;

  getJoinId(_instance.InstanceId, _instance.World.WorldId);

  document.querySelector('#instance-detail .instance-btn.joinBtn')
    .setAttribute('onclick', 'joinInstance(\'' + _instance.InstanceId + '\', \'' + _instance.World.WorldId + '\');');
  document.querySelector('#instance-detail .instance-btn.portalBtn')
    .setAttribute('onclick', 'dropInstancePortal(\'' + _instance.InstanceId + '\');');

  let html = '';

  for (let i = 0; i < _instance.Users.length; i++) {
    html += '<div class="instancePlayer" onclick="getUserDetails(\'' + _instance.Users[i].UserId + '\');"><img class="instancePlayerImage" src="' +
      _instance.Users[i].UserImageUrl + '"><div class="instancePlayerName">' +
      _instance.Users[i].UserName + '</div></div>';
  }

  document.querySelector('#instance-detail .content-instance-players .scroll-content').innerHTML = html;

  detailPage.classList.remove('hidden');
  detailPage.classList.add('in');
};

function getJoinId (instanceId, worldId) {
  const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
  xhr.open('GET', 'https://slimesenpai.fr/chilloutui/joinId/new?instanceId=' + instanceId + '&worldId=' + worldId, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response) {
        if (response.joinId) {
          document.querySelector('#instance-detail .data-instanceRules').innerHTML = response.joinId;
        }
      }
    } else if (xhr.readyState === 4) {
      document.querySelector('#instance-detail .data-instanceRules').innerHTML = 'Error getting a link';
    }
  };
  xhr.send();
}

function getJoinParameters (joinId) {
  document.getElementById('joinIdSearch').innerHTML = joinId + ' HELLO';
  const xhr = new XMLHttpRequest(); // eslint-disable-line no-undef
  xhr.open('GET', 'https://slimesenpai.fr/chilloutui/joinId/' + joinId, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response) {
        if (response.worldId && response.instanceId) {
          document.getElementById('joinIdSearch').innerHTML = 'joining...';
          document.getElementById('joinIdSearch').setAttribute('data-value', '');
          joinInstance(response.instanceId, response.worldId); // eslint-disable-line no-undef
        } else {
          document.getElementById('joinIdSearch').innerHTML = 'error no ids in response...';
          document.getElementById('joinIdSearch').setAttribute('data-value', '');
        }
      } else {
        document.getElementById('joinIdSearch').innerHTML = 'error no response from server...';
        document.getElementById('joinIdSearch').setAttribute('data-value', '');
      }
      setTimeout(() => { document.getElementById('joinIdSearch').innerHTML = 'joinId...'; }, 5000);
    } else if (xhr.readyState === 4) {
      document.getElementById('joinIdSearch').innerHTML = 'error from server...';
      document.getElementById('joinIdSearch').setAttribute('data-value', '');
      setTimeout(() => { document.getElementById('joinIdSearch').innerHTML = 'joinId...'; }, 5000);
    }
  };
  xhr.send();
}

function slimyJoinWorld () { // eslint-disable-line no-unused-vars
  const search = document.getElementById('joinIdSearch').getAttribute('data-value').toLowerCase();

  document.getElementById('joinIdSearch').innerHTML = search;

  getJoinParameters(search);
}

// #endregion
