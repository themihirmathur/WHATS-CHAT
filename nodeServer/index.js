//Node server which will handle socket.io connections
const io = require('socket.io')(8000)

const users = {};

io.on('connection', socket =>{
    // If a new user joins, let other users connected to the server know!
    socket.on('new-user-joined', name =>{ 
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });
    // If someone sends a message, show it to all the other users joined!
    socket.on('send', message =>{
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    });
    // If someone leaves the chat, let others know!
    socket.on('disconnect', message =>{
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id]
    });
})
