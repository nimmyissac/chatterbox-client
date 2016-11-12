var app = {
  // INIT app components
  init: () => {

    app.server = 'https://api.parse.com/1/classes/messages';

    app.renderRoom('secret!!!');
    let room = $('#roomSelect').val();
    app.fetch(room);

    $('.username').on('click', function() {
      app.handleUsernameClick();
    });

    $('.submit').on('click', function() {
      app.handleSubmit();
    });

    $('#roomSelect').on('click', function() {
      let room = $('#roomSelect').val();
      app.clearMessages();
      app.fetch(room);
    });
  },

  send: (message) => {
    $.ajax({
      url: 'https://api.parse.com/1/classes/messages',
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
    var obj = {
     "roomname": roomname,
    };
    var query = encodeURIComponent('where='+ JSON.stringify(obj));
    $.ajax({
      url: 'https://api.parse.com/1/classes/messages?' + query,
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
        console.log('fetched:', data);
        app.populateChat(data.results);
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
    posting.append('<div class="username">' + message.username + '</div>');
    posting.append('<div class="postTxt">' + message.text + '</div>');
    $('#chats').append(posting);
  },

  renderRoom: (name) => {
    let allRoomNames = $('.roomChoice').map(function() {
      return this.value;
    }).toArray();
    if (!_.contains(allRoomNames, name)) {
      let roomz = $('<option class="roomChoice" value="' + name + '">' + name + '</option>');
      $('#roomSelect').append(roomz);
    }
  },

  handleUsernameClick: () => {

  },

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

    _.each(chat, (msg) => {
      if (_.indexOf(allRooms, msg.roomname) === -1) allRooms.push(msg.roomname);
        app.renderMessage(msg);
    });

    _.each(allRooms, (room) => {
      app.renderRoom(room);
    });
  }
};

// Run INIT when done loading document
$(document).ready(() => {
  app.init();
});
