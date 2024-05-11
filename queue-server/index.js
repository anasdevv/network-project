const express = require('express');
const socketio = require('socket.io');
const uuid = require('uuid');

const app = express();
const tasks = [];

const server = app.listen(1337, () => {
  console.log('Server running!');
});

const io = socketio(server);

io.on('connection', (socket) => {
  console.log(`New connection with ID ${socket.id}`);
  socket.on('add_task', (data) => {
    // data.id = uuid.v5();
    console.log('data ', data);
    if (data) {
      tasks.push(data); // Add task to the queue
      console.log(`Task added`);
      io.emit('task_available');
    }
  });
  socket.on('request_task', () => {
    if (tasks.length > 0) {
      const nextTask = tasks.shift();
      socket.emit('receive_task', { ...nextTask });
    } else {
      socket.emit('no_task_available');
    }
  });
  //   socket.on('task_completed', (data) => {
  //     console.log(`task with ID : ${data.id} completed`);
  //   });
  // Handle disconnections gracefully (optional)
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
