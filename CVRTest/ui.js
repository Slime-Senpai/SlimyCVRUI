function changeTab(_id, _e){

    if(_e.className.includes('active')){

        switch(_id){
            case 'friends':
                    if(friendList.length == 0){
                        refreshFriends();
                    }
                    closeUserDetail();
                break;
            case 'worlds':
                    if(worldList.length == 0){
                        loadFilteredWorlds();
                    }
                    closeWorldDetail();
                    closeInstanceDetail();
                break;
            case 'avatars':
                    if(avatarList.length == 0){
                        refreshAvatars();
                    }
                break;
            case 'props':
                if(propList.length == 0){
                    refreshProps();
                }
                break;
        }

        return;
    }

    var buttons = document.querySelectorAll('.toolbar-btn');
    for(var i=0; buttons[i]; i++){
        buttons[i].classList.remove('active');
    }
    _e.classList.add('active');

    var content = document.querySelectorAll('.content.in');
    for(var i=0; content[i]; i++){
        content[i].classList.remove('in');
        content[i].classList.add('out');
    }
    setTimeout(hideTabs, 200);

    var target = document.getElementById(_id);
    target.classList.remove('hidden');
    target.classList.add('in');

    switch(_id){
        case 'friends':
                if(friendList.length == 0){
                    refreshFriends();
                }
            break;
        case 'worlds':
                if(worldList.length == 0){
                    refreshWorlds();
                }
            break;
        case 'avatars':
                if(avatarList.length == 0){
                    refreshAvatars();
                }
            break;
        case 'props':
            if(avatarList.length == 0){
                refreshProps();
            }
            break;
    }
}

function hideTabs(){
    var content = document.querySelectorAll('.content.out');
    for(var i=0; content[i]; i++){
        content[i].classList.add('hidden');
        content[i].classList.remove('out');
    }
}

function switchTab(_tabs, _contents, _content, _e){
    if(_e.className.includes('active')) return;

    var buttons = document.querySelectorAll(_tabs);
    for(var i=0; buttons[i]; i++){
        buttons[i].classList.remove('active');
    }
    _e.classList.add('active');
    var tabs = document.querySelectorAll('.active-overlay');
    for(var i=0; i < tabs.length; i++){
      tabs[i].innerHTML = ' ';
    }

    var content = document.querySelectorAll(_contents);
    for(var i=0; content[i]; i++){
        content[i].classList.remove('active');
    }

    document.querySelector(_content).classList.add('active');
}

var scrollTarget = null;

var mouseScrolling = false;
var pauseScrolling = false;

var startY = 0;
var startScrollY = 0;
var oldY = 0;
var speedY = 0;

var startX = 0;
var startScrollX = 0;
var oldX = 0;
var speedX = 0;

var scrollWheelTarget = null;

document.addEventListener('mousedown', function(e){
    scrollTarget = e.target.closest('.list-content');
    startY = e.clientY;
    startX = e.clientX;
    if(scrollTarget !== null){
        mouseScrolling = true;
        startScrollY = scrollTarget.scrollTop;
        startScrollX = scrollTarget.scrollLeft;
    }else{
        scrollTarget = e.target.closest('.scroll-content');
        if(scrollTarget !== null){
            mouseScrolling = true;
            startScrollY = scrollTarget.scrollTop;
            startScrollX = scrollTarget.scrollLeft;
        }
    }
});

document.addEventListener('mousemove', function(e){
    if(scrollTarget !== null && mouseScrolling && !pauseScrolling){
        scrollTarget.scrollTop = startScrollY - e.clientY + startY;
        scrollTarget.scrollLeft = startScrollX - e.clientX + startX;
        speedY = e.clientY - oldY;
        speedX = e.clientX - oldX;
        oldY = e.clientY;
        oldX = e.clientX;
    }

    scrollWheelTarget = e.target.closest('.list-content');
    if(scrollWheelTarget == null){
        scrollWheelTarget = e.target.closest('.scroll-content');
    }
});

document.addEventListener('mouseup', function(e){
    mouseScrolling = false;
    if(scrollTarget != null){
        startScrollY = scrollTarget.scrollTop;
        startScrollX = scrollTarget.scrollLeft;
    }
});

window.setInterval(function(){
    if(!mouseScrolling && scrollTarget != null && (Math.abs(speedY) > 0.01 || Math.abs(speedX) > 0.01) && !pauseScrolling){
        speedY *= 0.95;
        speedX *= 0.95;

        scrollTarget.scrollTop -= speedY;
        scrollTarget.scrollLeft -= speedX;

    }else if(!mouseScrolling && scrollTarget != null){
        scrollTarget = null;
    }
}, 10);

window.addEventListener('wheel', function(e){
    if(scrollWheelTarget != null){
        scrollWheelTarget.scrollTop += e.deltaY;
        scrollWheelTarget.scrollLeft += e.deltaY;
    }

    e.preventDefault();
});

/*window.addEventListener('click', function(e){
    if(e.target.closest('div').getAttribute('onclick') !== null) {
        playSound("click");
    }
});*/

var avatarList = [];
var worldList = [];
var friendList = [];

function filterList(_list, _filter){
    var list = [];

    for(var i=0; _list[i]; i++){
        if(_list[i].FilterTags.split(',').includes(_filter) || _filter == ''){
            list.push(_list[i]);
        }
    }

    return list;
}

function filterContent(_ident, _filter){
    var buttons = document.querySelectorAll('#'+_ident+' .filter-option');

    for(var i=0; buttons[i]; i++){
        buttons[i].classList.remove('active');
    }

    var activeButton = document.querySelector('#'+_ident+' .filter-option.data-filter-'+_filter+'');
    if(activeButton != null){
        activeButton.classList.add('active');
    }

    switch(_ident){
        case 'avatars':
                var list = filterList(avatarList, _filter);
                renderAvatars(list);
            break;
        case 'worlds':
                //var list = filterList(worldList, _filter);
                //renderWorlds(list);
                worldFilter = _filter;
                loadFilteredWorlds();
            break;
        case 'friends':
                var list = filterList(friendList, _filter);
                renderFriends(list);
            break;
    }
}

//Avatars
function loadAvatars(_list, _filter){
    avatarList = _list;

    var html = '';

    for(var i=0; _filter[i]; i++){
        html += '<div class="filter-option data-filter-'+_filter[i].CategoryKey+
                '" onclick="filterContent(\'avatars\', \''+
                _filter[i].CategoryKey+'\');">'+_filter[i].CategoryClearTextName+'</div>';
    }

    document.querySelector('#avatars .filter-content').innerHTML = html;

    renderAvatars(_list);
}

function renderAvatars(_list){
    var contentList = document.querySelector('#avatars .list-content');

    var html = '';

    for(var i=0; _list[i]; i++){
        if(i%4 === 0){
            if(i !== 0){
                html += '</div>';
            }
            html += '<div class="content-row">';
        }

        html += '<div class="content-cell avatar"><div class="content-cell-formatter"></div>'+
                '<div class="content-cell-content"><img class="content-image" src="'+
                _list[i].AvatarImageUrl+'"><div class="content-name">'+
                _list[i].AvatarName+'</div><div class="content-btn first disabled">Details</div>'+
                '<div class="content-btn second" onclick="changeAvatar(\''+_list[i].Guid+'\');">Change Avatar</div></div></div>';
    }

    contentList.innerHTML = html;
}

//Worlds
var worldFilter = "";
var worldsResetLoad = true;

function loadWorlds(_list, _filter){
    worldList = _list;

    var html = '';

    for(var i=0; _filter[i]; i++){
        if((i == 0 && worldsResetLoad) || worldFilter == '')worldFilter = _filter[i].CategoryKey;
        html += '<div class="filter-option data-filter-'+_filter[i].CategoryKey+
                ' '+(_filter[i].CategoryKey == worldFilter?'active':'')+'" onclick="filterContent(\'worlds\', \''+
                _filter[i].CategoryKey+'\');">'+_filter[i].CategoryClearTextName+'</div>';
    }

    document.querySelector('#worlds .filter-content').innerHTML = html;

    renderWorlds(_list);

    worldsResetLoad = false;
}

function renderWorlds(_list){
    var contentList = document.querySelector('#worlds .list-content');

    var html = '';

    for(var i=0; _list[i]; i++){
        if(i%4 === 0){
            if(i !== 0){
                html += '</div>';
            }
            html += '<div class="content-row">';
        }

        html += '<div class="content-cell world"><div class="content-cell-formatter"></div>'+
                '<div class="content-cell-content"><img class="content-image" src="'+
                _list[i].WorldImageUrl+'"><div class="content-name">'+
                _list[i].WorldName+'</div>'+
                '<div  onclick="getWorldDetails(\''+_list[i].Guid+'\');" class="content-btn second">Details</div>'+
                '</div></div>';
    }

    contentList.innerHTML = html;
}

//Friends
function loadFriends(_list, _filter){
    friendList = _list;

    var html = '';

    for(var i=0; _filter[i]; i++){
        html += '<div class="filter-option data-filter-'+_filter[i].CategoryKey+
                '" onclick="filterContent(\'friends\', \''+
                _filter[i].CategoryKey+'\');">'+_filter[i].CategoryClearTextName+'</div>';
    }

    document.querySelector('#friends .filter-content').innerHTML = html;

    renderFriends(_list);
}

function renderFriends(_list){
    var contentList = document.querySelector('#friends .list-content');

    var html = '';

    for(var i=0; _list[i]; i++){
        if(i%5 === 0){
            if(i !== 0){
                html += '</div>';
            }
            html += '<div class="content-row">';
        }

        html += '<div class="content-cell friend"><div class="content-cell-formatter"></div>'+
                '<div class="content-cell-content"><div class="online-state '+(_list[i].OnlineState?'online':'offline')+'"></div>'+
                '<img class="content-image" src="'+
                _list[i].ProfileImageUrl+'"><div class="content-name">'+
                _list[i].PlayerName+'</div><div class="content-btn second" '+
                'onclick="getUserDetails(\''+_list[i].Guid+'\');">Details</div>'+
                '</div></div>';
    }

    contentList.innerHTML = html;
}

//Settings
function switchSettingCategorie(_id, _e){
    var buttons = document.querySelectorAll('#settings .filter-option');
    var categories = document.querySelectorAll('#settings .settings-categorie');

    for(var i = 0; i < buttons.length; i++){
        buttons[i].classList.remove('active');
    }

    for(var i = 0; i < categories.length; i++){
        categories[i].classList.remove('active');
    }

    _e.classList.add('active');

    document.getElementById(_id).classList.add('active');
}

//Messages
function switchMessageCategorie(_id, _e){
    var buttons = document.querySelectorAll('#messages .filter-option');
    var categories = document.querySelectorAll('#messages .message-categorie');

    for(var i = 0; i < buttons.length; i++){
        buttons[i].classList.remove('active');
    }

    for(var i = 0; i < categories.length; i++){
        categories[i].classList.remove('active');
    }

    _e.classList.add('active');

    document.getElementById(_id).classList.add('active');
}

function loadMessages(_invites, _friendrequests, _votes, _systems, _dms){
    var html = '';
    for(var i=0; i < _invites.length; i++){
        html += displayMessageInvite(_invites[i]);
    }
    if(_invites.length == 0){
        html = '<div class="noMessagesWrapper">'+
'            <div class="noMessagesInfo">'+
'                <img src="gfx\\attention.svg">'+
'                <div>'+
'                    No invites found.'+
'                </div>'+
'            </div>'+
'        </div>';
    }
    document.querySelector('#message-invites .message-list').innerHTML = html;
    document.querySelector('.messages-invites > .filter-number').innerHTML = _invites.length;

    html = '';
    for(i=0; i < _friendrequests.length; i++){
        html += displayMessageFriendRequest(_friendrequests[i]);
    }
    if(_friendrequests.length == 0){
        html = '<div class="noMessagesWrapper">'+
'            <div class="noMessagesInfo">'+
'                <img src="gfx\\attention.svg">'+
'                <div>'+
'                    No friend requests found.'+
'                </div>'+
'            </div>'+
'        </div>';
    }
    document.querySelector('#message-friendrequests .message-list').innerHTML = html;
    document.querySelector('.message-friendrequests > .filter-number').innerHTML = _friendrequests.length;

    html = '';
    for(i=0; i < _votes.length; i++){
        html += displayMessageVote(_votes[i]);
    }
    if(_votes.length == 0){
        html = '<div class="noMessagesWrapper">'+
'            <div class="noMessagesInfo">'+
'                <img src="gfx\\attention.svg">'+
'                <div>'+
'                    No votes found.'+
'                </div>'+
'            </div>'+
'        </div>';
    }
    document.querySelector('#message-votes .message-list').innerHTML = html;
    document.querySelector('.message-votes > .filter-number').innerHTML = _votes.length;

    html = '';
    for(i=0; i < _systems.length; i++){
        html += displayMessageSystem(_systems[i]);
    }
    if(_systems.length == 0){
        html = '<div class="noMessagesWrapper">'+
'            <div class="noMessagesInfo">'+
'                <img src="gfx\\attention.svg">'+
'                <div>'+
'                    No system messages found.'+
'                </div>'+
'            </div>'+
'        </div>';
    }
    document.querySelector('#message-system .message-list').innerHTML = html;
    document.querySelector('.message-system > .filter-number').innerHTML = _systems.length;

    html = '';
    for(i=0; i < _dms.length; i++){
        html += displayMessageDM(_dms[i]);
    }
    if(_dms.length == 0){
        html = '<div class="noMessagesWrapper">'+
'            <div class="noMessagesInfo">'+
'                <img src="gfx\\attention.svg">'+
'                <div>'+
'                    No direct messages found.'+
'                </div>'+
'            </div>'+
'        </div>';
    }
    document.querySelector('#message-dm .message-list').innerHTML = html;
    document.querySelector('.message-dm > .filter-number').innerHTML = _dms.length;
}

function displayMessageInvite(_invite){
    return '<div class="message-content message-invite">'+
'        <img src="'+_invite.WorldImageUrl+'" class="message-image">'+
'        <div class="message-text-wrapper">'+
'            <div class="message-name">'+_invite.SenderUsername+' invited you to join thier session<br>'+_invite.InviteMessage+'</div>'+
'            <div class="message-text"></div>'+
'        </div>'+
'        <div class="message-btn" onclick="showInstanceDetails(\''+_invite.InstanceId+'\')">'+
'            <img src="gfx/details.svg">'+
'            Details</div>'+
'        <div class="message-btn" onclick="respondeInvite(\''+_invite.InviteId+'\', \'accept\')">'+
'            <img src="gfx/accept.svg">'+
'            Accept</div>'+
'        <div class="message-btn" onclick="respondeInvite(\''+_invite.InviteId+'\', \'deny\')">'+
'            <img src="gfx/deny.svg">'+
'            Deny</div>'+
'        <div class="message-btn" onclick="respondeInvite(\''+_invite.InviteId+'\', \'silence\')">'+
'            <img src="gfx/silence.svg">'+
'            Silence</div>'+
'    </div>';
}

function displayMessageInviteRequest(_request){
    return '<div class="message-content message-invite">'+
        '        <img src="'+_invite.WorldImageUrl+'" class="message-image">'+
        '        <div class="message-text-wrapper">'+
        '            <div class="message-name">'+_invite.RequestMessage+'</div>'+
        '            <div class="message-text"></div>'+
        '        </div>'+
        '        <div class="message-btn" onclick="respondeInviteRequest(\''+_invite.InviteId+'\', \'accept\')">'+
        '            <img src="gfx/accept.svg">'+
        '            Accept</div>'+
        '        <div class="message-btn" onclick="respondeInviteRequest(\''+_invite.InviteId+'\', \'deny\')">'+
        '            <img src="gfx/deny.svg">'+
        '            Deny</div>'+
        '        <div class="message-btn" onclick="respondeInviteRequest(\''+_invite.InviteId+'\', \'silence\')">'+
        '            <img src="gfx/silence.svg">'+
        '            Silence</div>'+
        '    </div>';
}

function respondeInvite(_guid, _response){
    engine.call('CVRAppCallRespondToInvite', _guid, _response);
}

function respondeInviteRequest(_guid, _response){
    engine.call('CVRAppCallRespondToInviteRequest', _guid, _response);
}

function displayMessageFriendRequest(_friendrequest){
    return '<div class="message-content message-friendrequest">'+
'        <img src="'+_friendrequest.SenderImageUrl+'" class="message-image">'+
'        <div class="message-text-wrapper">'+
'            <div class="message-name">'+_friendrequest.SenderUsername+' sent you a friend request</div>'+
'            <div class="message-text"></div>'+
'        </div>'+
'        <div class="message-btn" onclick="getUserDetails(\''+_friendrequest.SenderId+'\');">'+
'            <img src="gfx/details.svg">'+
'            Profile</div>'+
'        <div class="message-btn" onclick="addFriend(\''+_friendrequest.SenderId+'\')">'+
'            <img src="gfx/accept.svg">'+
'            Accept</div>'+
'        <div class="message-btn" onclick="denyFriend(\''+_friendrequest.SenderId+'\')">'+
'            <img src="gfx/deny.svg">'+
'            Deny</div>'+
'    </div>';
}

function displayMessageVote(_vote){
    return '<div class="message-content message-vote">'+
'        <img src="gfx/home.svg" class="message-image">'+
'        <div class="message-text-wrapper">'+
'            <div class="message-name">Name</div>'+
'            <div class="message-text"></div>'+
'        </div>'+
'        <div class="message-btn" onclick="respondeVote(\'\', true)">'+
'            <img src="gfx/accept.svg">'+
'            Yes</div>'+
'        <div class="message-btn" onclick="respondeVote(\'\', false)">'+
'            <img src="gfx/deny.svg">'+
'            No</div>'+
'    </div>';
}

function respondeVote(_guid, _response){
    engine.call('CVRAppCallRespondToVote', _guid, _response);
}

function displayMessageSystem(_system){
    return '<div class="message-content message-system">'+
'        <img src="gfx/home.svg" class="message-image">'+
'        <div class="message-text-wrapper">'+
'            <div class="message-name">'+_system.HeaderText+'</div>'+
'            <div class="message-text">'+_system.LongText+'</div>'+
'        </div>'+
'        <div class="message-btn" onclick="respondeSystem(\'\', true)">'+
'            <img src="gfx/accept.svg">'+
'            Okay</div>'+
'        <div class="message-btn" onclick="respondeSystem(\'\', false)">'+
'            <img src="gfx/deny.svg">'+
'            Dismiss</div>'+
'    </div>';
}

function respondeSystem(_guid, _response){
    engine.call('CVRAppCallRespondToSystem', _guid, _response);
}

function displayMessageDM(_dm){
    return '<div class="message-content message-dm">'+
'        <img src="gfx/home.svg" class="message-image">'+
'        <div class="message-text-wrapper">'+
'            <div class="message-name">Name</div>'+
'            <div class="message-text"></div>'+
'        </div>'+
'        <div class="message-btn">'+
'            <img src="gfx/chat.svg">'+
'            Chat</div>'+
'    </div>';
}

function loadMessagesSingle(_cat, _list){
    switch(_cat){
        case 'invites':
                var html = '';
                for(var i=0; i < _list.length; i++){
                    html += displayMessageInvite(_list[i]);
                }
                if(_list.length == 0){
                    html = '<div class="noMessagesWrapper">'+
                        '            <div class="noMessagesInfo">'+
                        '                <img src="gfx\\attention.svg">'+
                        '                <div>'+
                        '                    No invites found.'+
                        '                </div>'+
                        '            </div>'+
                        '        </div>';
                }
                document.querySelector('#message-invites .message-list').innerHTML = html;
                document.querySelector('.messages-invites > .filter-number').innerHTML = _list.length;
            break;
        case 'invite-requets':
            var html = '';
            for(var i=0; i < _list.length; i++){
                html += displayMessageInviteRequest(_list[i]);
            }
            if(_list.length == 0){
                html = '<div class="noMessagesWrapper">'+
                    '            <div class="noMessagesInfo">'+
                    '                <img src="gfx\\attention.svg">'+
                    '                <div>'+
                    '                    No invite requests found.'+
                    '                </div>'+
                    '            </div>'+
                    '        </div>';
            }
            document.querySelector('#message-invite-requests .message-list').innerHTML = html;
            document.querySelector('.messages-invite-requests > .filter-number').innerHTML = _list.length;
            break;   
    }
}

var propList = [];
//Props
function loadProps(_list, _filter){
    propList = _list;

    var html = '';

    for(var i=0; _filter[i]; i++){
        html += '<div class="filter-option data-filter-'+_filter[i].CategoryKey+
            '" onclick="filterContent(\'props\', \''+
            _filter[i].CategoryKey+'\');">'+_filter[i].CategoryClearTextName+'</div>';
    }

    document.querySelector('#props .filter-content').innerHTML = html;

    renderProps(_list);
}

function renderProps(_list){
    var contentList = document.querySelector('#props .list-content');

    var html = '';

    for(var i=0; _list[i]; i++){
        if(i%4 === 0){
            if(i !== 0){
                html += '</div>';
            }
            html += '<div class="content-row">';
        }

        html += '<div class="content-cell prop"><div class="content-cell-formatter"></div>'+
            '<div class="content-cell-content"><img class="content-image" src="'+
            _list[i].SpawnableImageUrl+'"><div class="content-name">'+
            _list[i].SpawnableName+'</div><div class="content-btn first disabled zero">Details</div>'+
            '<div class="content-btn first" onclick="SelectProp(\''+_list[i].Guid+'\', \''+_list[i].SpawnableImageUrl+'\', \''+_list[i].SpawnableName+'\');">Select Prop</div>'+
            '<div class="content-btn second" onclick="SpawnProp(\''+_list[i].Guid+'\');">Drop Prop</div></div></div>';
    }

    contentList.innerHTML = html;
}

function SpawnProp(_uid){
    engine.call('CVRAppCallSpawnProp', _uid);
}
function SelectProp(_uid, _image, _name){
    engine.call('CVRAppCallSelectProp', _uid, _image, _name);
}
function DeletePropMode(){
    engine.trigger('CVRAppCallDeletePropMode');
}
function ReloadAllAvatars(){
    engine.trigger('CVRAppActionReloadAllAvatars');
}

//World Details
function getWorldDetails(_uid){
    engine.call('CVRAppCallGetWorldDetails', _uid);
    if(debug){
        loadWorldDetails({WorldName: 'Testworld', AdminTags: '', SafetyTags: 'SFW', AuthorName: 'Khodrin', AuthorGuid: 'AAAA',
            Guid: 'AAAA', AuthorImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png',
            WorldImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/Worlds/b1d2ac7c-4074-4804-abd5-3fe2fe12680c.png',
            WorldDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel tellus eget mauris vestibulum tempus at sed felis. Pellentesque vitae sapien non sapien sagittis ultrices sed quis odio. Quisque ac rutrum nunc. Nulla cursus volutpat lectus, eget consectetur enim fermentum eu. Etiam sodales posuere magna ac dictum. Phasellus laoreet purus sollicitudin pretium vehicula. Aenean ullamcorper in mauris ultrices ornare. Aliquam elementum lacus vel enim blandit, quis pretium urna fringilla. Aliquam sagittis venenatis mi et tristique. Mauris a pulvinar dolor. Nam nec pharetra erat, in molestie ipsum. Proin sed justo sed sem elementum faucibus non nec ex.',
            UploadedAt: '2020-01-01', UpdatedAt: '2020-01-20', WorldSize: '20MB'
        },
        [{Guid: 'AAAA', CurrentPlayerCount: 24, InstanceName: 'Sauerkraut der Zukunft#945623', InstanceRegion: 'EU'}],
        []);
    }
}

var currentWorldDetails = {};

function loadWorldDetails(_data, _instances, _authorWorlds){
    currentWorldDetails = _data;
    var detailPage = document.getElementById('world-detail');

    document.querySelector('#world-detail h1').innerHTML = 'World: '+_data.WorldName;
    document.querySelector('.data-worldName').innerHTML = _data.WorldName;
    document.querySelector('.data-description').innerHTML = _data.WorldDescription;
    document.querySelector('.data-adminTags').innerHTML = _data.AdminTags.replace(/,/g, ' ');
    document.querySelector('.data-safetyTags').innerHTML = _data.SafetyTags.replace(/,/g, ' ');
    document.querySelector('.data-fileSize').innerHTML = _data.WorldSize;
    document.querySelector('.data-uploaded').innerHTML = _data.UploadedAt;
    document.querySelector('.data-updated').innerHTML = _data.UpdatedAt;

    document.querySelector('.data-worldImage').src = _data.WorldImageUrl;
    document.querySelector('.data-worldPreload').setAttribute('onclick', 'preloadWorld(\''+_data.Guid+'\');');

    document.querySelector('.data-worldExplore').setAttribute('onclick', 'changeWorld(\''+_data.Guid+'\');');

    document.querySelector('.data-worldSetHome').setAttribute('onclick', 'setHome(\''+_data.Guid+'\');');

    document.querySelector('.data-worldAuthorImage').src = _data.AuthorImageUrl;
    document.querySelector('.data-authorName').innerHTML = _data.AuthorName;
    document.querySelector('.action-btn.data-author-profile').setAttribute('onclick', 'getUserDetails(\''+_data.AuthorGuid+'\');');

    var html = '';

    for(var i=0; i < _authorWorlds.length; i++){
        html += '<div class="row-wrapper world-authorWorld">'+
                '    <img src="'+_authorWorlds[i].WorldImageUrl+'">'+
                '    <div class="cell-value">'+_authorWorlds[i].WorldName+
                '    <div class="action-btn author-world-btn" onclick="getWorldDetails(\''+
                _authorWorlds[i].Guid+'\');">Details</div>'+'</div>'+
                '</div>';
    }

    if(_authorWorlds.length == 0){
        html = '<div class="author-worlds-empty-message">There are currently no other public worlds from this Author</div>';
    }

    document.querySelector('.data-worldAuthorWorlds').innerHTML = html;

    var html = '';

    for(var i=0; i < _instances.length; i++){
        html += generateInstanceHTML(_instances[i]);
    }

    if(_instances.length == 0){
        html = '<div class="world-instances-empty-message">There are currently no open instances for this world</div>';
    }

    document.querySelector('.data-worldInstances').innerHTML = html;

    detailPage.classList.remove('hidden');
    detailPage.classList.add('in');

    document.querySelector('#world-instance-create .btn-create').setAttribute('onclick', 'instancingCreateInstance(\''+_data.Guid+'\');');
    hideCreateInstance();
}

function updateWorldDetailInstances(_instances){
    var html = '';

    for(var i=0; i < _instances.length; i++){
        html += generateInstanceHTML(_instances[i]);
    }

    if(_instances.length == 0){
        html = '<div class="world-instances-empty-message">There are currently no open instances for this world</div>';
    }

    document.querySelector('.data-worldInstances').innerHTML = html;
}

function addWorldDetailInstance(_instance){
    uiLoadingClose();

    var instances = document.querySelectorAll('#world-detail .world-instance');

    for(var i=0; i < instances.length; i++){
        instances[i].classList.remove('new');
    }

    var html = generateInstanceHTML(_instance, true);
    document.querySelector('.data-worldInstances').insertAdjacentHTML('afterbegin', html);

    var empty = document.querySelector('.world-instances-empty-message');
    if(empty != null){
        empty.parentNode.removeChild(empty);
    }
}

function generateInstanceHTML(_instance, _new){
    return '<div class="world-instance '+(_new === true?'new':'')+'" onclick="showInstanceDetails(\''+_instance.Guid+'\');">'+
                '    <div style="background-image: url('+currentWorldDetails.WorldImageUrl+');" class="instance-image"></div>'+
                '    <div class="playerCount">'+_instance.CurrentPlayerCount+'</div>'+
                '    <div class="instanceRegion">'+_instance.InstanceRegion+'</div>'+
                '    <div class="instanceName">'+_instance.InstanceName+'</div>'+
                '</div>';
}

function closeWorldDetail(){
    var detailPage = document.getElementById('world-detail');
    detailPage.classList.remove('in');
    detailPage.classList.add('out');
    setTimeout(function(){
        detailPage.classList.add('hidden');
        detailPage.classList.remove('out');
    }, 200);
}

function showCreateInstance(){
    var createInstance = document.getElementById('world-instance-create');
    createInstance.classList.remove('hidden');
    createInstance.classList.add('in');
}

function instancingChangeType(_type, _e){
    document.getElementById('instancing-type').value = _type;

    var buttons = document.querySelectorAll('.instancing-type-btn');
    for(var i=0; buttons[i]; i++){
        buttons[i].classList.remove('active');
    }

    _e.classList.add('active');
}

function instancingChangeRegion(_region, _e){
    document.getElementById('instancing-region').value = _region;

    var buttons = document.querySelectorAll('.region-select');
    for(var i=0; buttons[i]; i++){
        buttons[i].classList.remove('active');
    }

    _e.classList.add('active');
}

function instancingChangeRule(_region, _e){
    document.getElementById('instancing-rule').value = _region;

    var buttons = document.querySelectorAll('.rule-select');
    for(var i=0; buttons[i]; i++){
        buttons[i].classList.remove('active');
    }

    _e.classList.add('active');
}

function instancingCreateInstance(_uid){
    var type = document.getElementById('instancing-type').value;
    var region = document.getElementById('instancing-region').value;
    var rule = document.getElementById('instancing-rule').value;

    engine.call('CVRAppCallCreateInstance', _uid, type, region, rule);
    hideCreateInstance();
    uiLoadingShow('Your instance is being created.');
}

function hideCreateInstance(){
    var createInstance = document.getElementById('world-instance-create');

    createInstance.classList.remove('in');
    createInstance.classList.add('out');
    setTimeout(function(){
        createInstance.classList.add('hidden');
        createInstance.classList.remove('out');
    }, 200);
}

//Instance Detail
function closeInstanceDetail(){
    var detailPage = document.getElementById('instance-detail');
    detailPage.classList.remove('in');
    detailPage.classList.add('out');
    setTimeout(function(){
        detailPage.classList.add('hidden');
        detailPage.classList.remove('out');
    }, 200);
}

function showInstanceDetails(_uid){
    engine.call('CVRAppCallGetInstanceDetails', _uid);
}

engine.on('LoadInstanceDetails', function (_owner, _world, _instance, _instanceUsers) {
    loadInstanceDetail(_owner, _world, _instance, _instanceUsers);
});

function loadInstanceDetail(_owner, _world, _instance, _instanceUsers){
    var detailPage = document.getElementById('instance-detail');
    closeAvatarSettings();
    
    document.querySelector('#instance-detail h1').innerHTML = "Instance: "+_instance.InstanceName;

    document.querySelector('#instance-detail .profile-image').src = _owner.PlayerImageUrl;
    document.querySelector('#instance-detail .content-instance-owner h2').innerHTML = _owner.PlayerName;
    document.querySelector('#instance-detail .content-instance-owner h3').innerHTML = _owner.PlayerRank;

    document.querySelector('#instance-detail .profile-badge img').src = _owner.FeaturedBadgeImageUrl;
    document.querySelector('#instance-detail .profile-badge p').innerHTML = _owner.FeaturedBadgeName;

    document.querySelector('#instance-detail .profile-group img').src = _owner.FeaturedGroupImageUrl;
    document.querySelector('#instance-detail .profile-group p').innerHTML = _owner.FeaturedGroupName;

    document.querySelector('#instance-detail .profile-avatar img').src = _owner.CurrentAvatarImageUrl;
    document.querySelector('#instance-detail .profile-avatar p').innerHTML = _owner.CurrentAvatarName;


    document.querySelector('#instance-detail .world-image').src = _world.WorldImageUrl;
    document.querySelector('#instance-detail .content-instance-world h2').innerHTML = _world.WorldName;
    document.querySelector('#instance-detail .content-instance-world p').innerHTML = 'by '+_world.AuthorName;
    document.querySelector('#instance-detail .content-instance-world p').setAttribute(
        'onclick', 'getUserDetails(\''+_world.AuthorGuid+'\');');


    document.querySelector('#instance-detail .data-type').innerHTML = _instance.Privacy;
    document.querySelector('#instance-detail .data-region').innerHTML = _instance.Region;
    document.querySelector('#instance-detail .data-gamemode').innerHTML = _instance.GameMode;
    document.querySelector('#instance-detail .data-maxplayers').innerHTML = _instance.MaxPlayer;
    document.querySelector('#instance-detail .data-currplayers').innerHTML = _instance.CurrentPlayer;


    document.querySelector('#instance-detail .instance-btn.joinBtn').
        setAttribute('onclick', 'joinInstance(\''+_instance.InstanceId+'\');');
    document.querySelector('#instance-detail .instance-btn.portalBtn').
        setAttribute('onclick', 'dropInstancePortal(\''+_instance.InstanceId+'\');');


    var html = '';

    for(var i=0; i < _instanceUsers.length; i++){
        html += '<div class="instancePlayer"><img class="instancePlayerImage" src="'+
            _instanceUsers[i].UserImageUrl+'"><div class="instancePlayerName">'+
            _instanceUsers[i].UserName+'</div></div>';
    }

    document.querySelector('#instance-detail .content-instance-players .scroll-content').innerHTML = html;
    
    detailPage.classList.remove('hidden');
    detailPage.classList.add('in');
}

//User Details
function getUserDetails(_uid){
    engine.call('CVRAppCallGetUserDetails', _uid);
    if(debug){
        loadUserDetails(
            {Guid: 'AAAA', OnlineState: false,  PlayerImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png', PlayerName: 'Testuser',
             IsFriend: true, IsBlocked: false, IsMuted: false},
            {WorldImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png', WorldName: 'Testworld', GameMode: 'Social', MaxPlayer: 64,
             CurrentPlayer: 4, IsInPrivateLobby: false},
            [{Guid: 'AAAA', OnlineState: true,  UserImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png', UserName: 'Testuser'},
             {Guid: 'AAAA', OnlineState: true,  UserImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png', UserName: 'Testuser'},
             {Guid: 'AAAA', OnlineState: true,  UserImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png', UserName: 'Testuser'},
             {Guid: 'AAAA', OnlineState: true,  UserImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png', UserName: 'Testuser'},
             {Guid: 'AAAA', OnlineState: true,  UserImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png', UserName: 'Testuser'},
             {Guid: 'AAAA', OnlineState: true,  UserImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png', UserName: 'Testuser'},
             {Guid: 'AAAA', OnlineState: true,  UserImageUrl: 'https://abis3.fra1.digitaloceanspaces.com/ProfilePictures/Khodrin.png', UserName: 'Testuser'}]
        );
    }
}

var PlayerData = {};

function loadUserDetails(_data, _activity, _instanceUsers){
    PlayerData = _data;
    var detailPage = document.getElementById('user-detail');

    document.querySelector('#user-detail h1').innerHTML = 'Profile: '+_data.PlayerName;

    document.querySelector('#user-detail .online-state').className = 'online-state '+(_data.OnlineState?'online':'offline');
    document.querySelector('#user-detail .profile-image').src = _data.PlayerImageUrl;
    document.querySelector('#user-detail .user-sidebar h2').innerHTML = _data.PlayerName;
    document.querySelector('#user-detail .user-sidebar h3').innerHTML = _data.PlayerRank;

    document.querySelector('#user-detail .profile-badge img').src = _data.FeaturedBadgeImageUrl;
    document.querySelector('#user-detail .profile-badge p').innerHTML = _data.FeaturedBadgeName;

    document.querySelector('#user-detail .profile-group img').src = _data.FeaturedGroupImageUrl;
    document.querySelector('#user-detail .profile-group p').innerHTML = _data.FeaturedGroupName;

    document.querySelector('#user-detail .profile-avatar img').src = _data.CurrentAvatarImageUrl;
    document.querySelector('#user-detail .profile-avatar p').innerHTML = _data.CurrentAvatarName;

    var friendBtn = document.querySelector('#user-detail .friend-btn');
    if(_data.IsFriend){
        friendBtn.setAttribute('onclick', 'unFriend(\''+_data.Guid+'\');');
        friendBtn.innerHTML = '<img src="gfx/unfriend.svg">Unfriend';
    }else{
        friendBtn.setAttribute('onclick', 'addFriend(\''+_data.Guid+'\');');
        friendBtn.innerHTML = '<img src="gfx/friend.svg">Add Friend';
    }

    var blockBtn = document.querySelector('#user-detail .block-btn');
    if(_data.IsBlocked){
        blockBtn.setAttribute('onclick', 'unBlock(\''+_data.Guid+'\');');
        blockBtn.innerHTML = '<img src="gfx/unblock.svg">Unblock';
    }else{
        blockBtn.setAttribute('onclick', 'block(\''+_data.Guid+'\');');
        blockBtn.innerHTML = '<img src="gfx/block.svg">Block';
    }

    var muteBtn = document.querySelector('#user-detail .mute-btn');
    if(_data.IsMuted){
        muteBtn.setAttribute('onclick', 'unMute(\''+_data.Guid+'\');');
        muteBtn.innerHTML = '<img src="gfx/user-unmute.svg">Unmute';
    }else{
        muteBtn.setAttribute('onclick', 'mute(\''+_data.Guid+'\');');
        muteBtn.innerHTML = '<img src="gfx/user-mute.svg">Mute';
    }

    var kickBtn = document.querySelector('#user-detail .kick-btn');
    kickBtn.setAttribute('onmousedown', 'kickUser(\''+_data.Guid+'\');');

    detailPage.classList.remove('hidden');
    detailPage.classList.add('in');

    updateUserDetailsActivity(_activity, _instanceUsers);
}

function unFriend(_guid){
    engine.call('CVRAppCallRelationsManagement', _guid, 'Unfriend');
}

function addFriend(_guid){
    engine.call('CVRAppCallRelationsManagement', _guid, 'Add');
}

function denyFriend(_guid){
    engine.call('CVRAppCallRelationsManagement', _guid, 'Deny');
}

function block(_guid){
    engine.call('CVRAppCallRelationsManagement', _guid, 'Block');
}

function unBlock(_guid){
    engine.call('CVRAppCallRelationsManagement', _guid, 'Unblock');
}

var kickTimer;
var kickGuid = "";
document.addEventListener('mouseup', resetKickTimer);
function kickUser(_guid){
    kickGuid = _guid;
    kickTimer = window.setTimeout(kickUserAction, 3000);
}
function resetKickTimer(){
    kickGuid = "";
    window.clearTimeout(kickTimer);
}
function kickUserAction(){
    engine.call('CVRAppCallKickUser', kickGuid);
    console.log("Kick executed");
}

function updateUserDetailsActivity(_activity, _instanceUsers){

    if(_activity.IsInPrivateLobby == false && PlayerData.IsFriend && PlayerData.OnlineState && !PlayerData.OnlineNotConnected) {

        document.querySelector('#tab-content-activity .player-instance-world-image').src = _activity.WorldImageUrl;
        document.querySelector('#tab-content-activity .player-instance-details h2').innerHTML = _activity.WorldName;
        document.querySelector('#tab-content-activity .player-instance-details .data-gamemode').innerHTML = _activity.GameMode;
        document.querySelector('#tab-content-activity .player-instance-details .data-maxplayers').innerHTML = _activity.MaxPlayer;
        document.querySelector('#tab-content-activity .player-instance-details .data-currplayers').innerHTML = _activity.CurrentPlayer;

        var html = '';

        for (var i = 0; i < _instanceUsers.length; i++) {
            html += '<div class="instancePlayer"><img class="instancePlayerImage" src="' +
                _instanceUsers[i].UserImageUrl + '"><div class="instancePlayerName">' +
                _instanceUsers[i].UserName + '</div></div>';
        }

        document.querySelector('#tab-content-activity .player-instance-players .scroll-content').innerHTML = html;

        document.querySelector('#tab-content-activity .activityDataAviable').className = 'activityDataAviable';
        document.querySelector('#tab-content-activity .activityDataUnaviable').className = 'activityDataUnaviable hidden';
        document.querySelector('#tab-content-activity .activityDataPrivate').className = 'activityDataPrivate hidden';
        document.querySelector('#tab-content-activity .activityDataOffline').className = 'activityDataOffline hidden';

    }else if(_activity.IsInPrivateLobby == false && PlayerData.IsFriend && PlayerData.OnlineState && PlayerData.OnlineNotConnected){
        document.querySelector('#tab-content-activity .activityDataAviable').className = 'activityDataAviable hidden';
        document.querySelector('#tab-content-activity .activityDataUnaviable').className = 'activityDataUnaviable hidden';
        document.querySelector('#tab-content-activity .activityDataPrivate').className = 'activityDataPrivate hidden';
        document.querySelector('#tab-content-activity .activityDataOffline').className = 'activityDataOffline';
    }else if(_activity.IsInPrivateLobby == true && PlayerData.OnlineState){
        document.querySelector('#tab-content-activity .activityDataAviable').className = 'activityDataAviable hidden';
        document.querySelector('#tab-content-activity .activityDataUnaviable').className = 'activityDataUnaviable hidden';
        document.querySelector('#tab-content-activity .activityDataPrivate').className = 'activityDataPrivate';
        document.querySelector('#tab-content-activity .activityDataOffline').className = 'activityDataOffline hidden';
    }else{
        document.querySelector('#tab-content-activity .activityDataAviable').className = 'activityDataAviable hidden';
        document.querySelector('#tab-content-activity .activityDataUnaviable').className = 'activityDataUnaviable';
        document.querySelector('#tab-content-activity .activityDataPrivate').className = 'activityDataPrivate hidden';
        document.querySelector('#tab-content-activity .activityDataOffline').className = 'activityDataOffline hidden';
    }

    var joinBtn = document.querySelector('#user-detail .join-btn');
    var inviteBtn = document.querySelector('#user-detail .invite-btn');

    if(PlayerData.OnlineState && PlayerData.IsFriend && !PlayerData.OnlineNotConnected){
        joinBtn.setAttribute('onclick', 'joinInstance(\''+_activity.InstanceId+'\');');
        joinBtn.classList.remove('disabled');

        inviteBtn.setAttribute('onclick', 'invitePlayer(\''+PlayerData.Guid+'\');');
        joinBtn.classList.remove('disabled');
    }else if(PlayerData.IsFriend) {
        joinBtn.setAttribute('onclick', '');
        joinBtn.classList.add('disabled');

        inviteBtn.setAttribute('onclick', 'invitePlayer(\''+PlayerData.Guid+'\');');
        joinBtn.classList.remove('disabled');
    }else{
        joinBtn.setAttribute('onclick', '');
        joinBtn.classList.add('disabled');

        inviteBtn.setAttribute('onclick', '');
        joinBtn.classList.add('disabled');
    }
}

function closeUserDetail(){
    var detailPage = document.getElementById('user-detail');
    detailPage.classList.remove('in');
    detailPage.classList.add('out');
    setTimeout(function(){
        detailPage.classList.add('hidden');
        detailPage.classList.remove('out');
    }, 200);
}

//Avatar Details
function closeAvatarDetail(){
    var detailPage = document.getElementById('avatar-detail');
    detailPage.classList.remove('in');
    detailPage.classList.add('out');
    setTimeout(function(){
        detailPage.classList.add('hidden');
        detailPage.classList.remove('out');
    }, 200);
}

//Ui Masseges e.g. alerts, coinfirms
var messageList = [];

function uiMessageActive(){
    var messageBoxes = document.querySelectorAll('.message-box');
    var messageActive = false;

    for(var i = 0; i < messageBoxes.length; i++){
        if(!messageBoxes[i].className.includes('hidden')){
            messageActive = true;
        }
    }

    return messageActive;
}

function uiCheckForAdditionalMessage(){
    if(messageList.length > 0){
        var data = messageList.shift();
        switch(data.type){
            case 'alert':
                uiAlertShow(data.headline, data.text, data.id);
                break;
            case 'confirm':
                uiConfirmShow(data.headline, data.text, data.id);
                break;
            case 'alertTimed':
                uiAlertTimedShow(data.headline, data.text, data.time, data.id);
                break;
            case 'push':
                uiPushShow(data.text, data.time, data.id);
                break;
        }
    }
}

function uiAlertShow(_headline, _text, _id){
    var alertBox = document.getElementById('alert');

    if(uiMessageActive()){
        messageList.push({
            type: 'alert',
            headline: _headline,
            text: _text,
            id: _id
        });
        return;
    }

    alertBox.classList.remove('hidden');
    alertBox.classList.add('in');

    alertBox.setAttribute('data-index', _id);

    document.querySelector('#alert h2').innerHTML = _headline;
    document.querySelector('#alert p').innerHTML = _text;
}

function uiAlertClose(){
    var alertBox = document.getElementById('alert');

    var id = alertBox.getAttribute('data-index');

    alertBox.classList.remove('in');
    alertBox.classList.add('out');
    setTimeout(function(){
        alertBox.classList.add('hidden');
        alertBox.classList.remove('out');

        uiCheckForAdditionalMessage();
    }, 200);

    engine.call('CVRAppCallAlertClose', id);
}

window.setInterval(updateUiAlertTime, 25);
var uiAlertTimer = 0;
var uiAlertTime = 0;

function updateUiAlertTime(){
    uiAlertTimer += 0.025;
    
    var percent = Math.min((uiAlertTimer / uiAlertTime) * 100, 100);
    
    if(uiAlertTimer >= uiAlertTime){
        uiAlertTimedClose();
        uiAlertTimer = 0;
        uiAlertTime = 999999;
    }else{
        document.querySelector('#alertTimed .message-time-bar').setAttribute('style', 'width:'+percent+'%;');
    }
}

function uiAlertTimedShow(_headline, _text, _time, _id){
    var alertBox = document.getElementById('alertTimed');

    if(uiMessageActive()){
        messageList.push({
            type: 'alertTimed',
            headline: _headline,
            text: _text,
            time: _time,
            id: _id
        });
        return;
    }

    uiAlertTimer = 0;
    uiAlertTime = _time;

    alertBox.classList.remove('hidden');
    alertBox.classList.add('in');

    alertBox.setAttribute('data-index', _id);

    document.querySelector('#alertTimed h2').innerHTML = _headline;
    document.querySelector('#alertTimed p').innerHTML = _text;
    document.querySelector('#alertTimed .message-time-bar').setAttribute('style', 'width:0;');
}

function uiAlertTimedClose(){
    var alertBox = document.getElementById('alertTimed');

    var id = alertBox.getAttribute('data-index');

    alertBox.classList.remove('in');
    alertBox.classList.add('out');
    setTimeout(function(){
        alertBox.classList.add('hidden');
        alertBox.classList.remove('out');

        uiCheckForAdditionalMessage();
    }, 200);

    engine.call('CVRAppCallAlertClose', id);
}

window.setInterval(updateUiPushTime, 25);
var uiPushTimer = 0;
var uiPushTime = 0;

function updateUiPushTime(){
    uiPushTimer += 0.025;

    if(uiPushTimer >= uiPushTime){
        uiPushClose();
        uiPushTimer = 0;
        uiPushTime = 999999;
    }else{
        
    }
}

function uiPushShow(_text, _time, _id){
    var alertBox = document.getElementById('push');

    if(uiMessageActive()){
        messageList.push({
            type: 'push',
            text: _text,
            time: _time,
            id: _id
        });
        return;
    }

    uiPushTimer = 0;
    uiPushTime = _time;

    alertBox.classList.remove('hidden');
    alertBox.classList.add('in');

    alertBox.setAttribute('data-index', _id);

    document.querySelector('#push p').innerHTML = _text;
}

function uiPushClose(){
    var alertBox = document.getElementById('push');

    var id = alertBox.getAttribute('data-index');

    alertBox.classList.remove('in');
    alertBox.classList.add('out');
    setTimeout(function(){
        alertBox.classList.add('hidden');
        alertBox.classList.remove('out');

        uiCheckForAdditionalMessage();
    }, 200);

    engine.call('CVRAppCallAlertClose', id);
}

function uiLoadingShow(_text){
    var loadingBox = document.getElementById('loading');

    loadingBox.classList.remove('hidden');
    loadingBox.classList.add('in');

    document.querySelector('#loading p').innerHTML = _text;
}

function uiLoadingClose(){
    var loadingBox = document.getElementById('loading');

    loadingBox.classList.remove('in');
    loadingBox.classList.add('out');
    setTimeout(function(){
        loadingBox.classList.add('hidden');
        loadingBox.classList.remove('out');

        uiCheckForAdditionalMessage();
    }, 200);
}

function uiConfirmShow(_headline, _text, _id){
    var alertBox = document.getElementById('confirm');

    if(uiMessageActive()){
        messageList.push({
            type: 'confirm',
            headline: _headline,
            text: _text,
            id: _id
        });
        return;
    }

    alertBox.classList.remove('hidden');
    alertBox.classList.add('in');

    alertBox.setAttribute('data-index', _id);

    document.querySelector('#confirm h2').innerHTML = _headline;
    document.querySelector('#confirm p').innerHTML = _text;
}

window.uiConfirm = {
    id: 0,
    value: ""
};

function uiConfirmClose(_value){
    var alertBox = document.getElementById('confirm');

    var id = alertBox.getAttribute('data-index');

    alertBox.classList.remove('in');
    alertBox.classList.add('out');
    setTimeout(function(){
        alertBox.classList.add('hidden');
        alertBox.classList.remove('out');

        uiCheckForAdditionalMessage();
    }, 200);

    window.uiConfirm.id = id;
    window.uiConfirm.value = _value;
    
    var event = new CustomEvent("uiConfirm");
    window.dispatchEvent(event);
    engine.call('CVRAppCallConfirmClose', id, _value);
}

//Time Display
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function updateTime(){
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();

  h = checkTime(h);
  m = checkTime(m);

  if(game_settings && game_settings['GeneralClockFormat'] && game_settings['GeneralClockFormat'] != '24'){
      document.querySelector('.time-display').innerHTML = h%12+':'+m+' '+(h >= 12 ? 'PM' : 'AM');
  }else{
      document.querySelector('.time-display').innerHTML = h+':'+m;
  }
}
updateTime();
window.setInterval(updateTime, 1000);

//Quick menu
function updateAnimationNames(_names){
    var emote1 = document.querySelector('.quick-menu-wrapper .emote-1');
    if(emote1) emote1.innerHTML = _names.emote1;

    var emote2 = document.querySelector('.quick-menu-wrapper .emote-2');
    if(emote2) emote2.innerHTML = _names.emote2;

    var emote3 = document.querySelector('.quick-menu-wrapper .emote-3');
    if(emote3) emote3.innerHTML = _names.emote3;

    var emote4 = document.querySelector('.quick-menu-wrapper .emote-4');
    if(emote4) emote4.innerHTML = _names.emote4;

    var emote5 = document.querySelector('.quick-menu-wrapper .emote-5');
    if(emote5) emote5.innerHTML = _names.emote5;

    var emote6 = document.querySelector('.quick-menu-wrapper .emote-6');
    if(emote6) emote6.innerHTML = _names.emote6;

    var emote7 = document.querySelector('.quick-menu-wrapper .emote-7');
    if(emote7) emote7.innerHTML = _names.emote7;

    var emote8 = document.querySelector('.quick-menu-wrapper .emote-8');
    if(emote8) emote6.innerHTML = _names.emote8;


    var state1 = document.querySelector('.quick-menu-wrapper .state-1');
    if(state1) state1.innerHTML = _names.state1;

    var state2 = document.querySelector('.quick-menu-wrapper .state-2');
    if(state2) state2.innerHTML = _names.state2;

    var state3 = document.querySelector('.quick-menu-wrapper .state-3');
    if(state3) state3.innerHTML = _names.state3;

    var state4 = document.querySelector('.quick-menu-wrapper .state-4');
    if(state4) state4.innerHTML = _names.state4;

    var state5 = document.querySelector('.quick-menu-wrapper .state-5');
    if(state5) state5.innerHTML = _names.state5;

    var state6 = document.querySelector('.quick-menu-wrapper .state-6');
    if(state6) state6.innerHTML = _names.state6;

    var state7 = document.querySelector('.quick-menu-wrapper .state-7');
    if(state7) state7.innerHTML = _names.state7;

    var state8 = document.querySelector('.quick-menu-wrapper .state-8');
    if(state8) state6.innerHTML = _names.state8;
}

//Calls to cohtml
function refreshAvatars(){
    engine.trigger('CVRAppTaskRefreshAvatars');
}

function refreshWorlds(){
    worldsResetLoad = true;
    engine.trigger('CVRAppTaskRefreshWorlds');
}

function loadFilteredWorlds(){
    var search = document.getElementById('worldsSearch').value;
    engine.call('CVRAppCallLoadFilteredWorlds', worldFilter, search);
}

function refreshGameModes(){
    engine.trigger('CVRAppTaskRefreshGameModes');
}

function refreshFriends(){
    engine.trigger('CVRAppTaskRefreshFriends');
}

function refreshFeed(){
    engine.trigger('CVRAppTaskRefreshFeed');
}

function disconnect(){
    engine.trigger('CVRAppActionDisconnect');
}

function goHome(){
    engine.trigger('CVRAppActionGoHome');
}

function exit(){
    engine.trigger('CVRAppActionQuit');
}

function toggleMic(){
    engine.trigger('CVRAppActionMicToggle');
}

function toogleCamera(){
    engine.trigger('CVRAppActionCameraToggle');
}
function tooglePathCamera(){
    engine.trigger('CVRAppActionPathCameraToggle');
}

function recalibrate(){
    engine.trigger('CVRAppActionRecalibrate');
}

function respawn(){
    engine.trigger('CVRAppActionRespawn');
}

function mediaPrev(){
    engine.trigger('CVRAppActionMediaPrev');
}

function mediaPlayPause(){
    engine.trigger('CVRAppActionMediaPlayPause');
}

function mediaStop(){
    engine.trigger('CVRAppActionMediaStop');
}

function mediaNext(){
    engine.trigger('CVRAppActionMediaNext');
}

function settingsReset(){
    engine.trigger('CVRAppActionSettingsReset');
}

function toogleSeatedPlay(){
    engine.trigger('CVRAppActionToggleSeatedPlay');
}

function toggleFlight(){
    engine.trigger('CVRAppActionToggleFlight');
}

function autoCalibrateHeight(){
    engine.trigger('CVRAppActionAutoCalibrateHeight');
}

function mouseUnlock(){
    engine.trigger('CVRAppActionMouseUnlock');
}

function refreshProps(){
    engine.trigger('CVRAppActionRefreshProps');
}

function deleteAllMyProps(){
    engine.trigger('CVRAppActionDeleteAllMyProps');
}

function changeAvatar(_uid){
    engine.call('CVRAppCallChangeAvatar', _uid);
}

function changeWorld(_uid){
    engine.call('CVRAppCallChangeWorld', _uid);
}

function preloadWorld(_uid){
    engine.call('CVRAppCallPreloadWorld', _uid);
}

function setHome(_uid){
    engine.call('CVRAppCallSetHomeWorld', _uid);
}

function joinInstance(_uid){
    engine.call('CVRAppCallJoinInstance', _uid);
}
function invitePlayer(_uid){
    engine.call('CVRAppCallInvitePlayer', _uid);
}

function playEmote(_id){
    engine.call('CVRAppCallPlayEmote', _id);
}

function changeState(_id){
    engine.call('CVRAppCallChangeState', _id);
}

function changeAnimatorParam(_name, _value){
    engine.call('CVRAppCallChangeAnimatorParam', _name, _value);
}

function changeGestureLeft(_id){
    engine.call('CVRAppCallChangeGestureLeft', _id);
}

function changeGestureRight(_id){
    engine.call('CVRAppCallChangeGestureRight', _id);
}

function dropInstancePortal(_instanceID){
    engine.call('CVRAppCallDropInstancePortal', _instanceID);
}

function loadSettings(){
    engine.trigger('CVRAppActionLoadSettings');
}

function playSound(sound){
    engine.trigger('CVRAppCallPlayAudio', sound);
}

function updateGameDebugInformation(_info){
    var ping = document.querySelector('.game-debug-ping');
    if(ping) ping.innerHTML = _info.Ping;

    var fps = document.querySelector('.game-debug-fps');
    if(fps) fps.innerHTML = _info.Fps;

    var version = document.querySelector('.game-debug-version');
    if(version) version.innerHTML = _info.Version;
}

//Advanced Avatar Settings
function showAvatarSettings(){
    engine.trigger('CVRAppActionLoadAvatarSettings');
}

function DisplayAvatarSettings(_list){
    var contentElement = document.querySelector('#avatar-settings .list-content');
    var html = '';

    for(var i=0; i < _list.length; i++){
        var entry = _list[i];

        switch(entry.type){
            case 'toggle':
                html += '<div class="row-wrapper">\n' +
                    '    <div class="option-caption">'+entry.name+':</div>\n' +
                    '        <div class="option-input">\n' +
                    '        <div id="AVS_'+entry.parameterName+'" class="inp_toggle" data-type="avatar" data-current="'+(entry.defaultValueX==1?'True':'False')+'" data-saveOnChange="true"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                break;
            case 'dropdown':
                var settings = '';

                for(var j=0; j < entry.optionList.length; j++){
                    if(j != 0) settings += ',';
                    settings += j+':'+entry.optionList[j];
                }

                html += '<div class="row-wrapper">\n' +
                    '    <div class="option-caption">'+entry.name+':</div>\n' +
                    '        <div class="option-input">\n' +
                    '        <div id="AVS_'+entry.parameterName+'" class="inp_dropdown" data-type="avatar" data-options="'+settings+'" data-current="'+entry.defaultValueX+'" data-saveOnChange="true"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                break;
            case 'colorpicker':
                html += '<div class="row-wrapper">\n' +
                    '    <div class="option-caption">'+entry.name+':</div>\n' +
                    '        <div class="option-input">\n' +
                    '        <div id="AVS_PREV_'+entry.parameterName+'" class="color-preview" data-r="'+parseInt(entry.defaultValueX * 255)+'" data-g="'+parseInt(entry.defaultValueY * 255)+'" data-b="'+parseInt(entry.defaultValueZ * 255)+'" '  +
                    'style="background-color: rgba('+parseInt(entry.defaultValueX * 255)+','+parseInt(entry.defaultValueY * 255)+','+parseInt(entry.defaultValueZ * 255)+',1);"></div>\n' +
                    '        <div id="AVS_'+entry.parameterName+'-r" class="inp_slider color" data-caption="Red: " data-type="avatar" data-min="0" data-max="255" data-current="'+(entry.defaultValueX * 255)+'" data-saveOnChange="true"></div>\n' +
                    '        <div id="AVS_'+entry.parameterName+'-g" class="inp_slider color" data-caption="Green: " data-type="avatar" data-min="0" data-max="255" data-current="'+(entry.defaultValueY * 255)+'" data-saveOnChange="true"></div>\n' +
                    '        <div id="AVS_'+entry.parameterName+'-b" class="inp_slider color" data-caption="Blue: " data-type="avatar" data-min="0" data-max="255" data-current="'+(entry.defaultValueZ * 255)+'" data-saveOnChange="true"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                break;
            case 'slider':
                html += '<div class="row-wrapper">\n' +
                    '    <div class="option-caption">'+entry.name+':</div>\n' +
                    '        <div class="option-input">\n' +
                    '        <div id="AVS_'+entry.parameterName+'" class="inp_slider" data-type="avatar" data-min="0" data-max="100" data-current="'+(entry.defaultValueX * 100)+'" data-saveOnChange="true"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                break;
            case 'joystick2d':
                html += '<div class="row-wrapper">\n' +
                    '    <div class="option-caption">'+entry.name+':</div>\n' +
                    '        <div class="option-input">\n' +
                    '        <div id="AVS_'+entry.parameterName+'" class="inp_joystick" data-type="avatar" data-current="'+entry.defaultValueX+'|'+entry.defaultValueY+'" data-saveOnChange="true"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                break;
            case 'joystick3d':
                html += '<div class="row-wrapper">\n' +
                    '    <div class="option-caption">'+entry.name+':</div>\n' +
                    '        <div class="option-input">\n' +
                    '        <div id="AVS_'+entry.parameterName+'" class="inp_joystick" data-type="avatar" data-current="'+entry.defaultValueX+'|'+entry.defaultValueY+'" data-saveOnChange="true"></div>\n' +
                    '        <div id="AVS_'+entry.parameterName+'-z" class="inp_sliderH" data-type="avatar" data-min="0" data-max="100" data-current="'+(entry.defaultValueZ * 100)+'" data-saveOnChange="true"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                break;
            case 'inputsingle':
                html += '<div class="row-wrapper">\n' +
                    '    <div class="option-caption">'+entry.name+':</div>\n' +
                    '        <div class="option-input">\n' +
                    '        <div id="AVS_'+entry.parameterName+'-x" class="inp_number" data-type="avatar" data-caption="X" data-min="-9999" data-max="9999" data-current="'+entry.defaultValueX+'" data-saveOnChange="true"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                break;
            case 'inputvector2':
                html += '<div class="row-wrapper">\n' +
                    '    <div class="option-caption">'+entry.name+':</div>\n' +
                    '        <div class="option-input">\n' +
                    '        <div id="AVS_'+entry.parameterName+'-x" class="inp_number" data-type="avatar" data-caption="X" data-min="-9999" data-max="9999" data-current="'+entry.defaultValueX+'" data-saveOnChange="true"></div>\n' +
                    '        <div id="AVS_'+entry.parameterName+'-y" class="inp_number" data-type="avatar" data-caption="Y" data-min="-9999" data-max="9999" data-current="'+entry.defaultValueY+'" data-saveOnChange="true"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                break;
            case 'inputvector3':
                html += '<div class="row-wrapper">\n' +
                    '    <div class="option-caption">'+entry.name+':</div>\n' +
                    '        <div class="option-input">\n' +
                    '        <div id="AVS_'+entry.parameterName+'-x" class="inp_number" data-type="avatar" data-caption="X" data-min="-9999" data-max="9999" data-current="'+entry.defaultValueX+'" data-saveOnChange="true"></div>\n' +
                    '        <div id="AVS_'+entry.parameterName+'-y" class="inp_number" data-type="avatar" data-caption="Y" data-min="-9999" data-max="9999" data-current="'+entry.defaultValueY+'" data-saveOnChange="true"></div>\n' +
                    '        <div id="AVS_'+entry.parameterName+'-z" class="inp_number" data-type="avatar" data-caption="Z" data-min="-9999" data-max="9999" data-current="'+entry.defaultValueZ+'" data-saveOnChange="true"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                break;
        }
    }

    if(_list.length == 0){
        html = "There are no advanced settings configured for this avatar.";
    }

    contentElement.innerHTML = html;

    var avatarSettings = document.getElementById('avatar-settings');
    avatarSettings.classList.remove('hidden');
    avatarSettings.classList.add('in');

    for(var i=0; i < _list.length; i++){
        var entry = _list[i];

        switch(entry.type){
            case 'toggle':
                new inp_toggle(document.getElementById('AVS_'+entry.parameterName));
                break;
            case 'dropdown':
                new inp_dropdown(document.getElementById('AVS_'+entry.parameterName));
                break;
            case 'colorpicker':
                new inp_slider(document.getElementById('AVS_'+entry.parameterName+'-r'));
                new inp_slider(document.getElementById('AVS_'+entry.parameterName+'-g'));
                new inp_slider(document.getElementById('AVS_'+entry.parameterName+'-b'));
                break;
            case 'slider':
                new inp_slider(document.getElementById('AVS_'+entry.parameterName));
                break;
            case 'joystick2d':
                new inp_joystick(document.getElementById('AVS_'+entry.parameterName));
                break;
            case 'joystick3d':
                new inp_joystick(document.getElementById('AVS_'+entry.parameterName));
                new inp_sliderH(document.getElementById('AVS_'+entry.parameterName+'-z'));
                break;
            case 'inputsingle':
                new inp_number(document.getElementById('AVS_'+entry.parameterName+'-x'));
                break;
            case 'inputvector2':
                new inp_number(document.getElementById('AVS_'+entry.parameterName+'-x'));
                new inp_number(document.getElementById('AVS_'+entry.parameterName+'-y'));
                break;
            case 'inputvector3':
                new inp_number(document.getElementById('AVS_'+entry.parameterName+'-x'));
                new inp_number(document.getElementById('AVS_'+entry.parameterName+'-y'));
                new inp_number(document.getElementById('AVS_'+entry.parameterName+'-z'));
                break;
        }
    }
}

function closeAvatarSettings(){
    closeKeyboard();
    closeNumpad();
    var avatarSettings = document.getElementById('avatar-settings');
    avatarSettings.classList.remove('in');
    avatarSettings.classList.add('out');
    setTimeout(function(){
        avatarSettings.classList.add('hidden');
        avatarSettings.classList.remove('out');
    }, 200);
}

function DisplayAvatarSettingsProfiles(_info){
    var html = '';
    
    for(var i=0; i < _info.length; i++){
        html += '<div class="advAvtrProfile">\n' +
            '    <div class="advAvtrProfName" onclick="loadAdvAvtrProfile(\''+_info[i]+'\');">'+_info[i]+'</div>\n' +
            '    <div class="advAvtrProfSave" onclick="saveAdvAvtrProfile(\''+_info[i]+'\');">S</div>\n' +
            '    <div class="advAvtrProfDelete" onclick="deleteAdvAvtrProfile(\''+_info[i]+'\');">D</div>\n' +
            '</div>';
    }
    
    document.getElementById('savedProfiles').innerHTML = html;
}

function saveAdvAvtrProfileNew(){
    var profileName = document.getElementById('advAvtrProfileNameNew').value;
    saveAdvAvtrProfile(profileName);
    document.getElementById('advAvtrProfileNameNew').value = "";
}
function loadAdvAvtrProfileDefault(){
    engine.trigger('CVRAppActionLoadAdvAvtrSettingsDefault');
}
function saveAdvAvtrProfile(_name){
    engine.call('CVRAppCallSaveAdvAvtrSettingsProfile', _name);
    uiPushShow("The Profile was saved", 2, 'advAvtrCnfSav');
}
function loadAdvAvtrProfile(_name){
    engine.call('CVRAppCallLoadAdvAvtrSettingsProfile', _name);
}
var profileIndex = "";
function deleteAdvAvtrProfile(_name){
    profileIndex = _name;
    uiConfirmShow("Advanced Avatar Settings", 'Are you sure you want to delete the profile "'+_name+'"', 'deleteAdvAvtrProfile');
}
window.addEventListener("uiConfirm", function(e){
    if(window.uiConfirm.id == "deleteAdvAvtrProfile" && window.uiConfirm.value == true){
        engine.call('CVRAppCallDeleteAdvAvtrSettingsProfile', profileIndex);
        uiPushShow("The Profile was deleted", 2, 'advAvtrCnfDel');
    }
});

function vrInputChanged(_fullBodyActive){
    if (_fullBodyActive){
        cvr('#seatedPlayBtnHome').hide();
        cvr('#recalibrateBtnHome').show();
    } else {
        cvr('#seatedPlayBtnHome').show();
        cvr('#recalibrateBtnHome').hide();
    }
}

//Calls from cohtml
engine.on('LoadAvatars', function (_list, _filter) {
    loadAvatars(_list, _filter);
});

engine.on('LoadWorlds', function (_list, _filter) {
    loadWorlds(_list, _filter);
});

engine.on('LoadFriends', function (_list, _filter) {
    loadFriends(_list, _filter);
});

engine.on('LoadMessages', function(_invites, _friendrequests, _votes, _systems, _dms){
    loadMessages(_invites, _friendrequests, _votes, _systems, _dms);
});

engine.on('LoadMessagesSingle', function(_category, _list){
    loadMessagesSingle(_category, _list);
});

engine.on('LoadWorldDetails', function (_data, _instances, _authorWorlds) {
    loadWorldDetails(_data, _instances, _authorWorlds);
});

engine.on('AddWorldDetailsInstance', function(_instance){
    addWorldDetailInstance(_instance);
});

engine.on('LoadUserDetails', function (_data, _activity, _instanceUsers) {
    loadUserDetails(_data, _activity, _instanceUsers);
});

engine.on('alert', function (_headline, _text, _id) {
    uiAlertShow(_headline, _text, _id);
});
engine.on('alertTimed', function (_headline, _text, _time, _id) {
    uiAlertTimedShow(_headline, _text, _time, _id);
});
engine.on('push', function (_text, _time, _id) {
    uiPushShow(_text, _time, _id);
});

engine.on('confirm', function (_headline, _text, _id) {
    uiConfirmShow(_headline, _text, _id);
});

engine.on('loadingShow', function (_text) {
    uiLoadingShow(_text);
});

engine.on('loadingClose', function () {
    uiLoadingClose();
});

engine.on('UpdateMute', function (_muted) {
    if(!_muted){
        var buttons = document.querySelectorAll('.action-mute');
        for(var i=0 ; i < buttons.length; i++){
            buttons[i].innerHTML = '<img src="gfx/mute.svg">Unmute</div>';
        }
    }else{
        var buttons = document.querySelectorAll('.action-mute');
        for(var i=0 ; i < buttons.length; i++){
            buttons[i].innerHTML = '<img src="gfx/unmute.svg">Mute</div>';
        }
    }
});

engine.on('ChangeCameraStatus', function (_active) {
    if(_active){
        document.querySelector('#home .action-camera').innerHTML = '<img src="gfx/camera-on.svg">Cam Off</div>';
    }else{
        document.querySelector('#home .action-camera').innerHTML = '<img src="gfx/camera-off.svg">Cam On</div>';
    }
});

engine.on('ChangePathCameraStatus', function (_active) {
    if(_active){
        document.querySelector('#home .action-path-camera').innerHTML = '<img src="gfx/camera-on.svg">PCam Off</div>';
    }else{
        document.querySelector('#home .action-path-camera').innerHTML = '<img src="gfx/camera-off.svg">PCam On</div>';
    }
});

engine.on('ChangeGlobalNSFW', function(_enabled){
    console.log(_enabled);
    var nsfwSettings = document.getElementById('content-filter-nsfw-wrapper');
    var nsfwSettingsAdditional = document.getElementById('content-filter-nsfw-wrapper-second');
    var nsfwSettingsProp = document.getElementById('content-filter-nsfw-wrapper-props');
    var nsfwSettingsAdditionalProp = document.getElementById('content-filter-nsfw-wrapper-second-props');
    
    if(_enabled){
        nsfwSettings.style.display = 'block';
        nsfwSettingsAdditional.style.display = 'block';
        nsfwSettingsProp.style.display = 'block';
        nsfwSettingsAdditionalProp.style.display = 'block';
    }else{
        nsfwSettings.style.display = 'none';
        nsfwSettingsAdditional.style.display = 'none';
        nsfwSettingsProp.style.display = 'none';
        nsfwSettingsAdditionalProp.style.display = 'none';
    }
});

engine.on('UpdateAnimationNames', function(_names){
    updateAnimationNames(_names);
});

engine.on('UpdateGameDebugInformation', function(_info){
    updateGameDebugInformation(_info);
});

engine.on('ShowAvatarSettings', function(_info){
    DisplayAvatarSettings(_info);
});

engine.on('ShowAvatarSettingsProfiles', function(_info){
    DisplayAvatarSettingsProfiles(_info);
});

engine.on('LoadSpawnables', function (_list, _filter) {
    //changeTab('props', document.getElementById('props-btn'));
    loadProps(_list, _filter);
});

engine.on('vrInputChanged', function (_fullBody) {
    vrInputChanged(_fullBody);
});

//General Input Types
var settings = [];
var game_settings = [];

function saveSettings(){
    settings.forEach(function(_setting){
        engine.call('CVRAppCallSaveSetting', _setting.name, _setting.value());
    });
}

function inp_slider(_obj){
    this.obj = _obj;
    this.minValue = parseFloat(_obj.getAttribute('data-min'));
    this.maxValue = parseFloat(_obj.getAttribute('data-max'));
    this.percent  = 0;
    this.value    = parseFloat(_obj.getAttribute('data-current'));
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.dragActive = false;
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');
    this.caption = _obj.getAttribute('data-caption');
    this.continuousUpdate = _obj.getAttribute('data-continuousUpdate');

    var self = this;

    this.valueBar = document.createElement('div');
    this.valueBar.className = 'valueBar';
    this.valueBar.setAttribute('style', 'width: '+(((this.value - this.minValue) / (this.maxValue - this.minValue)) * 100)+'%;');
    this.obj.appendChild(this.valueBar);

    this.valueLabel = document.createElement('div');
    this.valueLabel.className = 'valueLabel';
    this.valueLabel.innerHTML = this.caption + Math.round(this.value);
    this.obj.appendChild(this.valueLabel);

    this.mouseDown = function(_e){
        self.dragActive = true;
        self.mouseMove(_e, false);
    }

    this.mouseMove = function(_e, _write){
        if(self.dragActive){
            var rect = _obj.getBoundingClientRect();
            var start = rect.left;
            var end = rect.right;
            self.percent = Math.min(Math.max((_e.clientX - start) / rect.width, 0), 1);
            var value = self.percent;
            value *= (self.maxValue - self.minValue);
            value += self.minValue;
            self.value = Math.round(value);

            self.valueBar.setAttribute('style', 'width: '+(self.percent * 100)+'%;');
            self.valueLabel.innerHTML = self.caption + self.value;
            
            if(self.type == 'avatar'){
                var color = self.name.substr(self.name.length - 2, self.name.length);
                var name = self.name.replace('AVS_', '').replace(color, '');
                var preview = document.getElementById('AVS_PREV_' + name);
                if(preview){
                    var red = preview.getAttribute('data-r');
                    var green = preview.getAttribute('data-g');
                    var blue = preview.getAttribute('data-b');
                    
                    switch(color){
                        case '-r':
                            red = parseInt(self.value);
                            preview.setAttribute('data-r', red);
                            break;
                        case '-g':
                            green = parseInt(self.value);
                            preview.setAttribute('data-g', green);
                            break;
                        case '-b':
                            blue = parseInt(self.value);
                            preview.setAttribute('data-b', blue);
                            break;
                    }
                    
                    preview.setAttribute('style', 'background-color: rgba('+red+','+green+','+blue+',1);');
                }
            }

            if(self.saveOnChange && (_write === true || self.type == 'avatar' || self.continuousUpdate == 'true')){
                if(self.type == 'avatar'){
                    changeAnimatorParam(self.name.replace('AVS_', ''), self.value / self.maxValue);
                }else{
                    engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
                    game_settings[self.name] = self.value;
                    self.displayImperial();
                }
            }
        }
    }

    this.mouseUp = function(_e){
        self.mouseMove(_e, true);
        self.dragActive = false;
    }

    _obj.addEventListener('mousedown', this.mouseDown);
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
    //_obj.addEventListener('mouseup', this.mouseUp);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = Math.round(value);
        self.percent = (self.value - self.minValue) / (self.maxValue - self.minValue);
        self.valueBar.setAttribute('style', 'width: '+(self.percent * 100)+'%;');
        self.valueLabel.innerHTML = self.caption + self.value;
        self.displayImperial();
    }
    
    this.displayImperial = function(){
        var displays = document.querySelectorAll('.imperialDisplay');
        for (var i = 0; i < displays.length; i++){
            var binding = displays[i].getAttribute('data-binding');
            if(binding == self.name){
                var realFeet = ((self.value * 0.393700) / 12);
                var feet = Math.floor(realFeet);
                var inches = Math.floor((realFeet - feet) * 12);
                displays[i].innerHTML = feet + "&apos;" + inches + '&apos;&apos;';
            }
        }
    }

    return {
      name: this.name,
      value: this.getValue,
      updateValue: this.updateValue
    }
}

var sliders = document.querySelectorAll('.inp_slider');
for(var i = 0; i < sliders.length; i++){
    settings[settings.length] = new inp_slider(sliders[i]);
}

function inp_dropdown(_obj){
    this.obj = _obj;
    this.value    = _obj.getAttribute('data-current');
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.options  = _obj.getAttribute('data-options').split(',');
    this.name = _obj.id;
    this.opened = false;
    this.keyValue = [];
    this.type = _obj.getAttribute('data-type');

    this.optionElements = [];

    var self = this;

    this.SelectValue = function(_e){
        self.value = _e.target.getAttribute('data-key');
        self.valueElement.innerHTML = _e.target.getAttribute('data-value');
        self.globalClose();

        if(self.saveOnChange){
            if(self.type == 'avatar'){
                changeAnimatorParam(self.name.replace('AVS_', ''), parseFloat(self.value));
            }else {
                engine.call('CVRAppCallSaveSetting', self.name, self.value);
                game_settings[self.name] = self.value;
            }
        }
    }

    this.openClick = function(_e){
      if(self.obj.classList.contains('open')){
        self.obj.classList.remove('open');
        self.list.setAttribute('style', 'display: none;');
      }else{
        self.obj.classList.add('open');
        self.list.setAttribute('style', 'display: block;');
        self.opened = true;
        window.setTimeout(function(){self.opened = false;}, 10);
      }
    }

    this.globalClose = function(_e){
      if(self.opened) return;
      self.obj.classList.remove('open');
      self.list.setAttribute('style', 'display: none;');
    }

    this.list = document.createElement('div');
    this.list.className = 'valueList';
    for(var i = 0; i < this.options.length; i++){
        this.optionElements[i] = document.createElement('div');
        this.optionElements[i].className = 'listValue';
        var valuePair = this.options[i].split(':');
        var key = "";
        var value = "";
        if(valuePair.length == 1){
            key = valuePair[0];
            value = valuePair[0];
        }else{
            key = valuePair[0];
            value = valuePair[1];
        }
        this.keyValue[key] = value;
        this.optionElements[i].innerHTML = value;
        this.optionElements[i].setAttribute('data-value', value);
        this.optionElements[i].setAttribute('data-key', key);
        this.list.appendChild(this.optionElements[i]);
        this.optionElements[i].addEventListener('mousedown', this.SelectValue);
    }

    this.valueElement = document.createElement('div');
    this.valueElement.className = 'dropdown-value';
    this.valueElement.innerHTML = this.keyValue[this.value];

    this.obj.appendChild(this.valueElement);
    this.obj.appendChild(this.list);
    this.valueElement.addEventListener('mousedown', this.openClick);
    document.addEventListener('mousedown', this.globalClose);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = value;
        self.valueElement.innerHTML = self.keyValue[value];
    }

    return {
      name: this.name,
      value: this.getValue,
      updateValue: this.updateValue
    }
}

var dropdowns = document.querySelectorAll('.inp_dropdown');
for(var i = 0; i < dropdowns.length; i++){
    settings[settings.length] = new inp_dropdown(dropdowns[i]);
}

function inp_toggle(_obj){
    this.obj = _obj;
    this.value = _obj.getAttribute('data-current');
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');

    var self = this;

    this.mouseDown = function(_e){
        self.value = self.value=="True"?"False":"True";
        self.updateState();
    }

    this.updateState = function(){
        self.obj.classList.remove("checked");
        if(self.value == "True"){
            self.obj.classList.add("checked");
        }

        if(self.saveOnChange){
            if(self.type == 'avatar'){
                changeAnimatorParam(self.name.replace('AVS_', ''), (self.value=="True"?1:0));
            }else{
                engine.call('CVRAppCallSaveSetting', self.name, self.value);
                game_settings[self.name] = self.value;
            }
        }
    }
    
    _obj.addEventListener('mousedown', this.mouseDown);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = value;

        self.obj.classList.remove("checked");
        if(self.value == "True"){
            self.obj.classList.add("checked");
        }
    }

    this.updateValue(this.value);

    return {
      name: this.name,
      value: this.getValue,
      updateValue: this.updateValue
    }
}

var toggles = document.querySelectorAll('.inp_toggle');
for(var i = 0; i < toggles.length; i++){
    settings[settings.length] = new inp_toggle(toggles[i]);
}

function inp_joystick(_obj){
    this.obj = _obj;
    this.minValue = 0;
    this.maxValue = 1;
    this.pos1     = 0;
    this.pos2     = 0;
    this.value    = _obj.getAttribute('data-current').split('|');
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.dragActive = false;
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');
    this.caption = _obj.getAttribute('data-caption');

    var self = this;

    this.pointer = document.createElement('div');
    this.pointer.className = 'pointer';
    this.pointer.setAttribute('style', 'left: '+(parseFloat(this.value[0])*100)+'%; top: '+((1 - parseFloat(this.value[1]))*100)+'%;');
    this.obj.appendChild(this.pointer);

    this.mouseDown = function(_e){
        self.dragActive = true;
        self.mouseMove(_e, false);
        pauseScrolling = true;
    }

    this.mouseMove = function(_e, _write){
        if(self.dragActive){
            var rect = _obj.getBoundingClientRect();
            var startLeft = rect.left;
            var startTop = rect.top;
            self.pos1 = Math.min(Math.max((_e.clientX - startLeft) / rect.width, 0), 1);
            self.pos2 = 1 - Math.min(Math.max((_e.clientY - startTop) / rect.height, 0), 1);
            self.value = [self.pos1, self.pos2];
            
            self.pointer.setAttribute('style', 'left: '+(parseFloat(self.value[0])*100)+'%; top: '+((1 - parseFloat(self.value[1]))*100)+'%;');

            if(self.saveOnChange && (_write === true || self.type == 'avatar')){
                if(self.type == 'avatar'){
                    changeAnimatorParam(self.name.replace('AVS_', '')+'-x', self.value[0]);
                    changeAnimatorParam(self.name.replace('AVS_', '')+'-y', self.value[1]);
                }else{
                    engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
                    game_settings[self.name] = self.value;
                    self.displayImperial();
                }
            }
        }
    }

    this.mouseUp = function(_e){
        self.mouseMove(_e, true);
        self.dragActive = false;
        pauseScrolling = false;
    }

    _obj.addEventListener('mousedown', this.mouseDown);
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
    //_obj.addEventListener('mouseup', this.mouseUp);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = Math.round(value);
        self.percent = (self.value - self.minValue) / (self.maxValue - self.minValue);
        self.valueBar.setAttribute('style', 'width: '+(self.percent * 100)+'%;');
        self.valueLabel.innerHTML = self.caption + self.value;
        self.displayImperial();
    }

    this.displayImperial = function(){
        var displays = document.querySelectorAll('.imperialDisplay');
        for (var i = 0; i < displays.length; i++){
            var binding = displays[i].getAttribute('data-binding');
            if(binding == self.name){
                var realFeet = ((self.value * 0.393700) / 12);
                var feet = Math.floor(realFeet);
                var inches = Math.floor((realFeet - feet) * 12);
                displays[i].innerHTML = feet + "&apos;" + inches + '&apos;&apos;';
            }
        }
    }

    return {
        name: this.name,
        value: this.getValue,
        updateValue: this.updateValue
    }
}

var joysticks = document.querySelectorAll('.inp_joystick');
for(var i = 0; i < joysticks.length; i++){
    settings[settings.length] = new inp_joystick(joysticks[i]);
}

function inp_sliderH(_obj){
    this.obj = _obj;
    this.minValue = parseFloat(_obj.getAttribute('data-min'));
    this.maxValue = parseFloat(_obj.getAttribute('data-max'));
    this.percent  = 0;
    this.value    = parseFloat(_obj.getAttribute('data-current'));
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.dragActive = false;
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');
    this.caption = _obj.getAttribute('data-caption');

    var self = this;

    this.valueBar = document.createElement('div');
    this.valueBar.className = 'valueBar';
    this.valueBar.setAttribute('style', 'height: '+(((this.value - this.minValue) / (this.maxValue - this.minValue)) * 100)+'%;');
    this.obj.appendChild(this.valueBar);

    this.valueLabel = document.createElement('div');
    this.valueLabel.className = 'valueLabel';
    this.valueLabel.innerHTML = this.caption + Math.round(this.value);
    this.obj.appendChild(this.valueLabel);

    this.mouseDown = function(_e){
        self.dragActive = true;
        self.mouseMove(_e, false);
        pauseScrolling = true;
    }

    this.mouseMove = function(_e, _write){
        if(self.dragActive){
            var rect = _obj.getBoundingClientRect();
            var start = rect.top;
            var end = rect.bottom;
            self.percent = 1 - Math.min(Math.max((_e.clientY - start) / rect.height, 0), 1);
            var value = self.percent;
            value *= (self.maxValue - self.minValue);
            value += self.minValue;
            self.value = value;

            self.valueBar.setAttribute('style', 'height: '+(self.percent * 100)+'%;');
            self.valueLabel.innerHTML = self.caption + Math.round(self.value);

            if(self.saveOnChange && (_write === true || self.type == 'avatar')){
                if(self.type == 'avatar'){
                    changeAnimatorParam(self.name.replace('AVS_', ''), self.value / self.maxValue);
                }else{
                    engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
                    game_settings[self.name] = self.value;
                    self.displayImperial();
                }
            }
        }
    }

    this.mouseUp = function(_e){
        self.mouseMove(_e, true);
        self.dragActive = false;
        pauseScrolling = false;
    }

    _obj.addEventListener('mousedown', this.mouseDown);
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);
    //_obj.addEventListener('mouseup', this.mouseUp);

    this.getValue = function(){
        return self.value;
    }

    this.updateValue = function(value){
        self.value = Math.round(value);
        self.percent = (self.value - self.minValue) / (self.maxValue - self.minValue);
        self.valueBar.setAttribute('style', 'width: '+(self.percent * 100)+'%;');
        self.valueLabel.innerHTML = self.caption + self.value;
        self.displayImperial();
    }

    this.displayImperial = function(){
        var displays = document.querySelectorAll('.imperialDisplay');
        for (var i = 0; i < displays.length; i++){
            var binding = displays[i].getAttribute('data-binding');
            if(binding == self.name){
                var realFeet = ((self.value * 0.393700) / 12);
                var feet = Math.floor(realFeet);
                var inches = Math.floor((realFeet - feet) * 12);
                displays[i].innerHTML = feet + "&apos;" + inches + '&apos;&apos;';
            }
        }
    }

    return {
        name: this.name,
        value: this.getValue,
        updateValue: this.updateValue
    }
}

var slidersH = document.querySelectorAll('.inp_sliderH');
for(var i = 0; i < slidersH.length; i++){
    settings[settings.length] = new inp_sliderH(slidersH[i]);
}

function inp_number(_obj){
    this.obj = _obj;
    this.minValue = parseFloat(_obj.getAttribute('data-min'));
    this.maxValue = parseFloat(_obj.getAttribute('data-max'));
    this.value    = parseFloat(_obj.getAttribute('data-current'));
    this.saveOnChange = _obj.getAttribute('data-saveOnChange') == 'true';
    this.name = _obj.id;
    this.type = _obj.getAttribute('data-type');
    this.caption = _obj.getAttribute('data-caption');

    this.obj.innerHTML = this.caption + ": " + this.value.toFixed(4);
    
    var self = this;

    this.mouseDown = function(_e){
        self.dragActive = true;
        pauseScrolling = true;
        displayNumpad(self);
    }

    this.updateValue = function(_value, _write){
        self.value = Math.min(9999, Math.max(-9999, _value));
        _obj.innerHTML = self.caption + ": " + self.value.toFixed(4);
        
        if(self.saveOnChange && (_write === true || self.type == 'avatar')){
            if(self.type == 'avatar'){
                changeAnimatorParam(self.name.replace('AVS_', ''), self.value);
            }else{
                engine.call('CVRAppCallSaveSetting', self.name, "" + self.value);
                game_settings[self.name] = self.value;
                self.displayImperial();
            }
        }
    }

    this.mouseUp = function(_e){
        self.dragActive = false;
        pauseScrolling = false;
    }

    _obj.addEventListener('mousedown', this.mouseDown);
    document.addEventListener('mouseup', this.mouseUp);

    this.getValue = function(){
        return self.value;
    }

    return {
        name: this.name,
        value: this.getValue,
        updateValue: this.updateValue
    }
}

var inputNumber = document.querySelectorAll('.inp_number');
for(var i = 0; i < slidersH.length; i++){
    settings[settings.length] = new inp_number(slidersH[i]);
}

function updateGameSettingsValue(_name, _value){
    for(var i = 0; i < settings.length; i++){
        if(settings[i].name == _name){
            settings[i].updateValue(_value);
            game_settings[_name] = _value;
        }
    }
}

engine.on('UpdateGameSettings', function(_name, _value){
    updateGameSettingsValue(_name, _value);
});

engine.on('UpdateGameSettingsBulk', function(_settings){
    for(var i = 0; i < _settings.length; i++){
        updateGameSettingsValue(_settings[i].Name, _settings[i].Value);
    }
});

function addSettingsValue(name, delta){
    for(var i = 0; i < settings.length; i++){
        if(settings[i].name == name){
            settings[i].updateValue(settings[i].value() + delta);
            engine.call('CVRAppCallSaveSetting', name, '' + (settings[i].value() + delta));
        }
    }
}

var keyboardTarget;
var keyboardMaxLength = 0;

function displayKeyboard(_e){
    var keyboard = document.getElementById('keyboard');
    document.getElementById('keyoard-input').value = _e.value;
    keyboardMaxLength = parseInt(_e.getAttribute("data-max-length"));
    
    keyboardTarget = _e;

    keyboard.classList.remove('hidden');
    keyboard.classList.add('in');
}

function closeKeyboard(){
    var keyboard = document.getElementById('keyboard');
    keyboard.classList.remove('in');
    keyboard.classList.add('out');
    setTimeout(function(){
        keyboard.classList.add('hidden');
        keyboard.classList.remove('out');
    }, 200);
}

var keyboardKeys = document.querySelectorAll('.keyboard-key');
var keyboardModKeys = document.querySelectorAll('.keyboard-mod');
var keyboardFuncKeys = document.querySelectorAll('.keyboard-func');

var keyMod = "";
var modLock = false;

for(var i=0; i < keyboardKeys.length; i++){
    keyboardKeys[i].addEventListener('mousedown', sendKey);
}

for(var i=0; i < keyboardFuncKeys.length; i++){
    keyboardFuncKeys[i].addEventListener('mousedown', sendFuncKey);
}

for(var i=0; i < keyboardModKeys.length; i++){
    keyboardModKeys[i].addEventListener('mousedown', sendModKey);
}

function sendKey(_e){
    var input = document.getElementById('keyoard-input');
    if(keyboardMaxLength > 0 && input.value.length == keyboardMaxLength) return;
    input.value += _e.target.textContent;
    
    if(!modLock && keyMod != ""){
        keyMod = "";

        var list = document.querySelectorAll('#keyboard .active');
        for(var i=0; i < list.length; i++){
            list[i].classList.remove('active');
        }
        
        updateKeys();
    }
}

function sendFuncKey(_e){
    var input = document.getElementById('keyoard-input');
    var func = _e.target.getAttribute('data-key-func');
    
    switch(func){
        case 'BACKSPACE':
            input.value = input.value.substring(0, input.value.length - 1);
            break;
        case 'CLEAR':
            input.value = '';
            break;
        case 'ENTER':
            keyboardTarget.value = input.value;
            closeKeyboard();
            var submit = keyboardTarget.getAttribute('data-submit');
            if(submit != null) {
                eval(submit);
            }
            break;
        case 'BACK':
            closeKeyboard();
            break;
    }
}

function sendModKey(_e){
    var mod = _e.target.getAttribute('data-key-mod');
    var lock = _e.target.getAttribute('data-key-mod-lock');
    
    if(mod == null && lock != null){
        modLock = true;
        mod = lock;
    }
    
    if(mod == keyMod){
        keyMod = "";
        modLock = false;
        
        var list = document.querySelectorAll('#keyboard .active');
        for(var i=0; i < list.length; i++){
            list[i].classList.remove('active');
        }
    }else{
        keyMod = mod;
        _e.target.classList.add('active');
    }
    updateKeys();
}

function updateKeys(){    
    for(var i=0; i < keyboardKeys.length; i++){
        var value = keyboardKeys[i].getAttribute('data-key');
        var dataValue = keyboardKeys[i].getAttribute('data-key-' + keyMod);
        keyboardKeys[i].textContent = dataValue!=null?dataValue:value;
    }
}

var numpadTarget;
var numpadHasDecimal = false;
var numpadDecimals = 0;
var hasPlaceholder = false;

function displayNumpad(_e){
    var numpad = document.getElementById('numpad');
    document.getElementById('numpad-input').value = _e.getValue().toFixed(4);
    document.getElementById('numpad-input').classList.add("placeholder");

    numpadTarget = _e;
    numpadHasDecimal = false;
    numpadDecimals = 0;
    hasPlaceholder = true;

    numpad.classList.remove('hidden');
    numpad.classList.add('in');
}

var numpadKeys = document.querySelectorAll('.numpadButton');

for(var i=0; i < numpadKeys.length; i++){
    numpadKeys[i].addEventListener('mousedown', sendNumpadKey);
}

function sendNumpadKey(_e){
    var value = _e.target.getAttribute('data-value');
    var input = document.getElementById('numpad-input');
    var currentValue = parseFloat(input.value);
    if (hasPlaceholder) currentValue = 0;
    
    switch(value){
        case 'back':
            closeNumpad();
            break;
        case 'clear':
            input.value = 0;
            input.classList.remove("placeholder");
            hasPlaceholder = false;
            numpadHasDecimal = false;
            numpadDecimals = 0;
            break;
        case '-':
            currentValue *= -1;
            input.value = currentValue;
            break;
        case 'enter':
            numpadTarget.updateValue(currentValue);
            closeNumpad();
            break;
        case '.':
            if(!numpadHasDecimal) {
                input.classList.remove("placeholder");
                hasPlaceholder = false;
                numpadHasDecimal = true;
                numpadDecimals = 1;
                input.value = currentValue + ".";
            }
            break;
        default:
            input.classList.remove("placeholder");
            hasPlaceholder = false;
            if(!numpadHasDecimal){
                currentValue = currentValue * 10 + parseInt(value);
                input.value = currentValue;
            }else{
                currentValue = currentValue + (parseInt(value) / Math.pow(10, numpadDecimals));
                input.value = currentValue.toFixed(Math.min(numpadDecimals, 4));
                numpadDecimals++;
            }
            break;
    }
}

function closeNumpad(){
    var numpad = document.getElementById('numpad');
    numpad.classList.remove('in');
    numpad.classList.add('out');
    setTimeout(function(){
        numpad.classList.add('hidden');
        numpad.classList.remove('out');
    }, 200);
}