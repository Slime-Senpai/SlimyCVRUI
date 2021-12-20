function changeHudStatus(name, status){
    var selector = '';
    switch(name){
        case 'infos':
            selector = '.hex-shard.shard-infos';
            break;
        case 'friends':
            selector = '.hex-shard.shard-friends';
            break;
        case 'notifications':
            selector = '.hex-shard.shard-notifications';
            break;
        case 'chats':
            selector = '.hex-shard.shard-chats';
            break;
        case 'votes':
            selector = '.hex-shard.shard-votes';
            break;
        case 'alerts':
            selector = '.hex-shard.shard-alerts';
            break;
        case 'mic':
            //selector = '.hex-hub.hub-muted';
            if(status) {
                //document.querySelector(selector).setAttribute('src', 'unmuted.svg')
                document.querySelector('.hex-hub.hub-muted').style.display = 'none';
                document.querySelector('.hex-hub.hub-unmuted').style.display = 'block';
            }else{
                //document.querySelector(selector).setAttribute('src', 'muted.svg')
                document.querySelector('.hex-hub.hub-muted').style.display = 'block';
                document.querySelector('.hex-hub.hub-unmuted').style.display = 'none';
            }
            return;
            break;
    }
    
    if(status) {
        document.querySelector(selector).classList.add('active');
    }else{
        document.querySelector(selector).classList.remove('active');
    }
}

function setMicLevel(value){
    document.querySelector('.hex-hub.hub-muted-bar .bar-content').setAttribute('style', 'height: '+value+'%;');
}

var hudMessageBuffer = [];
var fadeinTimer;
var fadeoutTimer;
var messageShown = false;

function displayHudMessage(_head, _title, _message, _fadeTime){
    hudMessageBuffer.push({
		head: _head,
        title: _title,
        message: _message,
        fadeTime: _fadeTime
    });
    if(!messageShown) {
        renderHudMessage();
    }
}

function renderHudMessage(){
    messageShown = true;
    var data = hudMessageBuffer.shift();
    document.querySelector('.hud-message').classList.add('active');
	document.querySelector('.hud-message .authorative').innerHTML = data.head;
    document.querySelector('.hud-message .headline').innerHTML = data.title;
    document.querySelector('.hud-message .message').innerHTML = data.message;

    fadeinTimer = window.setTimeout(closeHudMessage, data.fadeTime*1000 + 500)
}

function closeHudMessage(){
    document.querySelector('.hud-message').classList.remove('active');
    fadeoutTimer = window.setTimeout(function(){
        messageShown = false;
        if(hudMessageBuffer.length > 0) renderHudMessage();
    }, 500);
}

function displayHudMessageImmediately(_head, _title, _message, _fadeTime){
    console.log(_title);
    hudMessageBuffer = new Array();
    clearTimeout(fadeinTimer);
    clearTimeout(fadeoutTimer);
    messageShown = true;
    document.querySelector('.hud-message').classList.add('active');
	document.querySelector('.hud-message .authorative').innerHTML = _head;
    document.querySelector('.hud-message .headline').innerHTML = _title;
    document.querySelector('.hud-message .message').innerHTML = _message;

    fadeinTimer = window.setTimeout(closeHudMessage, _fadeTime*1000 + 500)
}

function displayHudInteractableIndicator(_interactables){
    var wrapper = document.querySelector('.hud-interactable-wrapper');
    
    var html = "";
    
    for (var i=0; i < _interactables.length; i++){
        var angle = (parseInt(_interactables[i].angle) + 180) * -1;
        html += "<div class='hud-interactable' style='transform: rotate("+angle+"deg);'><img class='hud-interactable-arrow' src='interactable_arrow.svg'><div class='hud-interactable-caption' style='transform: rotate("+(angle * -1)+"deg);'><p>"+_interactables[i].name+"</p><p>("+_interactables[i].distance.toFixed(2)+"m)</p></div></div>";
    }
    
    wrapper.innerHTML = html;
    wrapper.classList.add("in");
    
    window.setTimeout(function(){
        document.querySelector('.hud-interactable-wrapper').classList.remove("in");
    }, 200);
}

function updateCoreGameVars(_coreGameVars){
    if(_coreGameVars.isVr){
        document.body.classList.add('vr');
        document.getElementsByClassName('hud-area-left-bottom')[0].classList.add('vr');
        document.getElementsByClassName('hud-area-left-top')[0].classList.add('vr');
    }else{
        document.body.classList.remove('vr');
        document.getElementsByClassName('hud-area-left-bottom')[0].classList.remove('vr');
        document.getElementsByClassName('hud-area-left-top')[0].classList.remove('vr');
    }
}

engine.on('ChangeHudStatus', function (_name, _status) {
    changeHudStatus(_name, _status);
});

engine.on('ChangeHudMicValue', function (_value) {
    setMicLevel(_value);
});
engine.on('DisplayHudMessage', function (_head, _title, _message, _fadeTime) {
    displayHudMessage(_head, _title, _message, _fadeTime);
});
engine.on('DisplayHudMessageImmediately', function (_head, _title, _message, _fadeTime) {
    displayHudMessageImmediately(_head, _title, _message, _fadeTime);
});

engine.on('DisplayHudInteractableIndicator', function (_interactables) {
    console.log('CALLED');
    displayHudInteractableIndicator(_interactables);
});

engine.on('updateCoreGameVars', function(_coreGameVars) {
    updateCoreGameVars(_coreGameVars);
});

engine.on('showPropHud', function(_propImageUrl, _headline, _propName) {
    showPropHud(_propImageUrl, _headline, _propName);
});

engine.on('hidePropHud', function() {
    hidePropHud();
});

engine.on('updateNetworkHealth', function(health){
    switch(health){
        case 0:
            cvr('.hud-connection-health .warning').hide();
            cvr('.hud-connection-health .error').hide();
            break;
        case 1:
            cvr('.hud-connection-health .warning').show();
            cvr('.hud-connection-health .error').hide();
            break;
        case 2:
            cvr('.hud-connection-health .warning').hide();
            cvr('.hud-connection-health .error').show();
            break;
    }
});

function showPropHud(_propImageUrl, _headline, _propName){
    cvr('.hud-prop-spawner').removeClass('hidden');
    cvr('.hud-prop-spawner .prop-image').attr('src', _propImageUrl);
    cvr('.hud-prop-spawner .prop-caption').innerHTML(_headline);
    cvr('.hud-prop-spawner .prop-name').innerHTML(_propName);
}

function hidePropHud(){
    cvr('.hud-prop-spawner').addClass('hidden');
}

cvr('.hud-connection-health .warning').hide();
cvr('.hud-connection-health .error').hide();

engine.trigger('CVRAppActionHudReady');