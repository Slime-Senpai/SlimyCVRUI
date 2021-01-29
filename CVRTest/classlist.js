/**
 * A variable containing an array of objects for different class selectors, as well as their alpha (nothing, 80 or 100) and color (dark, normal or light)
 */

const slimyBackgroundClasslist = [ // eslint-disable-line no-unused-vars
  {
    selector: '#world-detail, .world-instancing, .btn-region .region-select, .btn-rule .rule-select, #instance-detail, #user-detail, .tab-btn.active .active-overlay, .tab-contents, .message-box, .valueList, #keyboard, #avatar-settings, #numpad, #avatar-detail',
    type: 'normal',
    alpha: 100
  },
  {
    selector: '.content, .toolbar, .quick-menu-wrapper, .quick-menu-content',
    type: 'normal',
    alpha: 80
  },
  {
    selector: '.filter-option.active, .filter-option:hover, .content-btn:hover, .action-btn:hover, .close-btn:hover, .user-toolbar .toolbar-btn:hover, .toolbar-btn.active, .toolbar-btn:hover, .message-btn:hover, .world-instancing .content-btn.active, .advAvtrProfName:hover, .advAvtrProfSave:hover, .advAvtrProfDelete:hover, .avatar-toolbar .toolbar-btn:hover',
    type: 'light',
    alpha: ''
  },
  {
    selector: '.content-instance-buttons .instance-btn:hover, .inp_dropdown:hover, .inp_dropdown .valueList .listValue:hover, .keyboard-key:hover, .keyboard-mod:hover, .keyboard-func:hover, .keyboard-key.active, .keyboard-mod.active, .keyboard-func.active, .numpadButton:hover',
    type: 'light',
    alpha: 100
  },
  {
    selector: '.content-btn.disabled, .btn-region .region-select.active, .btn-region .region-select:hover, .btn-rule .rule-select.active, .btn-rule .rule-select:hover, .user-toolbar .toolbar-btn.disabled, .toolbar-btn.deactivated, .message-btn.disabled, .avatar-toolbar .toolbar-btn.disabled',
    type: 'dark',
    alpha: ''
  },
  {
    selector: '.world-instancing .content-btn.disabled, .world-instancing .content-btn.disabled:hover, .content-instance-buttons .instance-btn.disabled',
    type: 'dark',
    alpha: 100
  }
];
