var q = function(s){ return document.getElementById(s) }

function send(){
  var input = q('text');
  socket.send(input.value);
  input.value = '';
}

var socket = new io.Socket(null, {
  port: 80,
  rememberTransport: false
});

socket.on('message', function(message){
  var el = document.createElement('p');
  el.innerHTML = message;
  q('chat').appendChild(el);
  window.scrollBy(0, 9000000)
});

socket.connect();
