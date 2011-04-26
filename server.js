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

app.listen(8001)
  
var socket = socketio.listen(app)

sub.subscribe("chat")

socket.on("connection", function(client){
  client.send("welcome!")

  client.on("message", function(text){
    store.incr("messageNextId", function(e, id){
      store.hmset("messages:" + id, { uid: client.sessionId, text: text },
        function(e, r){
          pub.publish("chat", "messages:" + id)
        }
      )
    })
  })
  
  client.on("disconnect", function(){
    client.broadcast(client.sessionId + " disconnected")
  })

  sub.on("message", function(pattern, key){
    store.hgetall(key, function(e, obj){
      client.send(obj.uid + ": " + obj.text)
    })
  })
    
})

// meaningless
