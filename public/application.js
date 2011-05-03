var q = function(s){ return document.getElementById(s) }

function send(){
  var input = q('text');
  socket.send(input.value);
  input.value = '';
}

var socket = new io.Socket(null, {
  port: window.port,
  rememberTransport: false
})


socket.on('message', function(data){
  var messages = JSON.parse(data)

  messages.forEach(function(msg){
    var el = document.createElement('p');
    el.innerHTML = msg;
    q('chat').appendChild(el);
    window.scrollBy(0, 9000000)
  })
})

socket.connect();
