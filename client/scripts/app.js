var app = {
  // INIT app components
  init: () => {

    app.server = 'https://api.parse.com/1/classes/messages';

    // INIT chat box
    app.renderRoom('secret!!!');
    app.renderRoom('lobby');
    let room = $('#roomSelect').val();
    app.fetch(room);

    // On Click Event Handlers
    $('.username').on('click', function() {
      app.handleUsernameClick();
    });

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
     "roomname": roomname,
    };
    var query = encodeURIComponent('where='+ JSON.stringify(obj));

    // AJAX GET request with Query Constraint
    $.ajax({
      url: app.server + '?' + query,
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
        // console.log('fetched:', data);
        app.populateChat(data.results);

        // Styling for even messages
        $('.even').removeClass('even');
        $('.container').filter(':even').addClass('even');
        console.log('chatterbox: Message recieved');
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to recieve message', data);
      }
    });
  },

  clearMessages: () => {
    $('#chats').children().remove();
  },

  renderMessage: (message) => {
    let posting = $('<div class="container"></div>');
    let timeCreated = message.createdAt;
    let symb = ('&raquo;' + ' ');
    let bult = ('&bull;' + ' ');
    message.text = symb + message.text;

    // Post Structure
      // User Name
    posting.append('<div class="username">' + '@' + message.username + '</div>');
      // Time Created
    posting.append('<div class="timePosted" data-time="'+ timeCreated +'">'
                  + '- ' + moment(message.createdAt).startOf('minute').fromNow() + '</div>');
      // Message Text
    posting.append('<div class="postTxt">' + message.text + '</div>');
      // Hidden unique post ID
    posting.append('<div class="postID" data-ID="'+ message.objectId + '"></div>');

    // prepend to have most recent posts at top
    $('#chats').prepend(posting);
  },

  renderRoom: (name) => {
    // collects the roomnames of all rooms added to DOM
    let allRoomNames = $('.roomChoice').map(function() {
      return this.value;
    }).toArray();

    // only appends 'name' if the room doesnt exist in DOM
    if (!_.contains(allRoomNames, name)) {
      let roomz = $('<option class="roomChoice" data="' + name + '">' + name + '</option>');
      $('#roomSelect').append(roomz);
    }
  },

  handleUsernameClick: () => {

  },

  // uses on Click event handler to circumvent refresh from submit forms
  handleSubmit: () => {
    let txt = $('#message').val();
    let user  = window.location.search.slice(10);
    let room = $('#roomSelect').val();

    let message = {
      username: user,
      text: txt,
      roomname: room
    };

    app.send(message);
  },

  populateChat: (chat) => {
    let allRooms = [];
    // Pulls id of posts from all displayed posts
    let allPostsID = $('.postID').map(function() {
      return $(this).data('id');
    }).toArray();

    // Iterates over all recieved messages from fetch
    _.each(chat, (msg) => {
      // collects unique roomnames from messages
      if (_.indexOf(allRooms, msg.roomname) === -1) allRooms.push(msg.roomname);

      // only renders messages that arent currently displayed
      if (_.indexOf(allPostsID, msg.objectId) === -1)  app.renderMessage(msg);
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
    }, 8000);
  },

  refreshTime: () => {
    let allPosts = $('.timePosted');
    _.each(allPosts, (eachPost) => {
      let time = $(eachPost).data('time');
      $(eachPost).text('-' + ' ' + moment(time).startOf('minute').fromNow());
    });
  }
};

// Run INIT when done loading document
$(document).ready(() => {
  app.init();
});
