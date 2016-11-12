var app = {
  // INIT app components
  init: () => {

    app.server = 'https://api.parse.com/1/classes/messages';

    // INIT chat box
    app.renderRoom('secret!!!');
    app.renderRoom('lobby');
    let room = $('#roomSelect').val();
    app.fetch();

    // On Click Event Handlers
    

      // Sends a message with the txt in form field
    $('.submit').on('click', function() {
      app.handleSubmit();
    });

      // Room drop down menu
    $('#roomSelect').on('click', function() {
      let room = $('#roomSelect').val();
      app.clearMessages();
      app.fetch(room);
    });

    // Continues to call refreshTime and update Chat contents
    // only renders posts with unique IDs
    app.updater();

  },

  send: (message) => {
    // AJAX POST request, recieves JSON objects
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
        let room = $('#roomSelect').val();
        app.fetch(room);
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },

  fetch: (roomname) => {
    // Query Constraint: message's roomname value must match
    var obj = {
      'roomname': roomname,
    };
    var query = encodeURIComponent('where=' + JSON.stringify(obj));
    // var query = encodeURIComponent('where=' + JSON.stringify(obj) + 'order=-createdAt');
    // query = query + 'order=-createdAt';
     // console.log(query);
    // AJAX GET request with Query Constraint
    $.ajax({
      url: app.server + '?' + query,
      type: 'GET',
      contentType: 'application/json',
      data: 'order=-createdAt',
      success: function (data) {
       
        // console.log('fetched:', data);
        // debugger;
        // app.xssTest (data.results);
        app.populateChat(data.results);
        
        //Rebind click event handler
        // $('.username').on('click', function() {
        // //console.log('clicked username event');

        //   app.handleUsernameClick();
        // });

        // Styling for even messages
        $('.even').removeClass('even');
        $('.container').filter(':even').addClass('even');
        // console.log('chatterbox: Message recieved');
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to recieve message', data);
      }
    });
  },
  xssTest: (data) => { 
    var filteredData = _.filter( data, function(element) {
      return element.roomname === "lobby";
    }); 
    console.log (filteredData);
  },

  clearMessages: () => {
    $('#chats').children().remove();
  },

  renderMessage: (message) => {
    let posting = $('<div class="container" id="' + message.objectId + '"></div>');
    let timeCreated = message.createdAt;
    let symb = ('&raquo;' + ' ');
    let bult = ('&bull;' + ' ');

    //save old
    let oldtext = message.text;
    let olduser = message.username;
    let isXSS = false;
    // Escaping to prevent XSS attacks
    message.text = _.escape(message.text);
    message.username = _.escape(message.username);

    if (oldtext !== message.text || olduser !== message.username) {
      isXSS = true;
      console.log('Caught XSS Attack!');
    }

    message.text = symb + message.text;

    // Post Structure
      // User Name
    posting.append('<div class="username" data-user="' + message.username 
                                          + '">' + '@' + message.username + '</div>');
      // Time Created
    posting.append('<div class="timePosted" data-time="' + timeCreated + '">'
                  + ' - ' + moment(message.createdAt).startOf('minute').fromNow() + '</div>');
      // Message Text
    posting.append('<div class="postTxt">' + message.text + '</div>');
      // Hidden unique post ID
    posting.append('<div class="postID" data-ID="' + message.objectId + '"></div>');

    // prepend to have most recent posts at top
    // if santization changes either username or message, dont appen
  
    if (!isXSS) {
      $('#chats').append(posting);
    }
    
    
    //////////////////////////////////////////////////////////
    //Bind click event handler to container for unique messages
    $('#' + message.objectId).on('click', function() {
        //console.log('clicked username event');
      let friend = $('#' + message.objectId).find('.username').data('user');
      $('.friend').removeClass('friend');
      app.addFriend(friend);
      // $('#' + message.objectId).addClass('friend');
      app.handleUsernameClick();
    });
  },

  renderRoom: (name) => {
    // ROOM ESCAPE TO PREVENT XSS ATTACKS
    let originalName = name;
    name = _.escape(name);
    if (name !== originalName) name = 'INVALID ROOM NAME';
    // collects the roomnames of all rooms added to DOM
    let allRoomNames = $('.roomChoice').map(function() {
      return this.value;
    }).toArray();
    // console.log(allRoomNames);
    // only appends 'name' if the room doesnt exist in DOM
    if (!_.contains(allRoomNames, name)) {
      let roomz = $('<option class="roomChoice" data="' + name + '">' + name + '</option>');
      $('#roomSelect').append(roomz);
    }
  },

  handleUsernameClick: () => {
    console.log('clicked username');
  },

  // uses on Click event handler to circumvent refresh from submit forms
  handleSubmit: () => {
    let txt = $('#message').val();
    // console.log('txt', txt.slice(0, 6));
    if (txt.slice(0, 6) === '!join ') {
      room = txt.slice(6);
      // console.log(room);
      app.renderRoom(room);
      $('#roomSelect').val(room);
      $('#roomSelect').trigger('click');
    } else {
      let user = window.location.search.slice(10);
      let room = $('#roomSelect').val();

      let message = {
        username: user,
        text: txt,
        roomname: room
      };

      app.send(message);
    }
    
  },

  populateChat: (chat) => {
    let allRooms = [];
    // Pulls id of posts from all displayed posts
    let allPostsID = $('.postID').map(function() {
      return $(this).data('id');
    }).toArray();
    // console.log(allPostsID);
    // Iterates over all recieved messages from fetch
    _.each(chat, (msg) => {
      // collects unique roomnames from messages
      if (_.indexOf(allRooms, msg.roomname) === -1) allRooms.push(msg.roomname);

      // only renders messages that arent currently displayed
      if (_.indexOf(allPostsID, msg.objectId) === -1) app.renderMessage(msg);
    });

    // renders unique rooms from fetch
    _.each(allRooms, (room) => {
      app.renderRoom(room);
    });
  },

  updater: function() {
    setTimeout(function() {
      let room = $('#roomSelect').val();
      app.fetch(room);

      app.refreshTime();
      app.updater();
    }, 8000); // refreshes every 8 seconds
  },

  refreshTime: () => {
    let allPosts = $('.timePosted');
    _.each(allPosts, (eachPost) => {
      let time = $(eachPost).data('time');
      $(eachPost).text(' -' + ' ' + moment(time).startOf('minute').fromNow());
    });
  },

  addFriend: (friend) => {
    let allPosts = $('.username').toArray();
    _.each(allPosts, (eachPost) => {
      let dataCheck = $(eachPost).data('user');
      if (dataCheck === friend) {
        $(eachPost).parent().addClass('friend');
      }
    });
  }
};

// Run INIT when done loading document
$(document).ready(() => {
  app.init();
});
