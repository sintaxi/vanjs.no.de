var express = require("express")
var socketio = require("socket.io")
var redis = require("redis")

// redis clients
var store = redis.createClient()
var pub = redis.createClient()
var sub = redis.createClient()

var app = express.createServer(express.static(__dirname + '/public'))
app.set('view engine', 'jade')

app.get("/", function(req, rsp){
  rsp.render('index', { layout: false })
})

app.listen(process.env.PORT || 8001)
  
var socket = socketio.listen(app)

sub.subscribe("chat")

var getMessages = function(msgs, cb){
  var messages = []
  var counter = msgs.length
  var order = 0
  msgs.forEach(function(key){
    var i = order
    order ++
    store.hgetall(key, function(e, obj){
      counter --
      messages[i] = [obj.uid + ": " + obj.text]
      if(counter == 0) cb(messages) 
    })
  }) 
}

socket.on("connection", function(client){
  client.send(JSON.stringify(["welcome!"]))
  
  store.lrange("messages", -20, -1, function(e, results){
    getMessages(results, function(messages){
      client.send(JSON.stringify(messages))
      store.ltrim("messages" -100, -1, function(e,r){})
    })
  })

  client.on("message", function(text){
    store.incr("messageNextId", function(e, id){
      store.hmset("messages:" + id, { uid: client.sessionId, text: text },
        function(e, r){
          pub.publish("chat", "messages:" + id)
          store.rpush("messages", "messages:" + id) 
        }
      )
    })
  })
  
  client.on("disconnect", function(){
    client.broadcast(client.sessionId + " disconnected")
  })
    
})

sub.on("message", function(pattern, key){
  getMessages([key], function(obj){
    var obj = JSON.stringify(obj)
    socket.broadcast(obj)
  })
})
