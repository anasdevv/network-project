const express = require('express');
const app = express();
const supabase = require('@supabase/supabase-js');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:1337');
const UAParser = require('ua-parser-js');

require('dotenv').config();
const { verifyPassword, hashPassword } = require('./hash');
// Create a single supabase client for interacting with database
const db = supabase.createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_KEY
);
socket.on('connect', (socket) => {
  console.log('connected');
});
socket.on('connect_error', function (err) {
  console.log(err);
});

socket.on('connect_timeout', function () {
  console.log('connect_timeout');
});

socket.on('reconnect_attempt', function () {
  console.log('reconnect_attempt');
});

socket.on('reconnecting', function () {
  console.log('reconnecting');
});
function addTask(task) {
  socket.emit('add_task', task);
}

app.use(express.json());
app.get('/', (req, res) => {
  res.send('hello world !');
});

app.post('/login', async (req, res) => {
  try {
    console.log('body ', req.body);
    const { email, password } = req.body;
    if (!email || !password || !email.includes('@')) {
      return res.status(400).send('Bad Request');
    }
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (!user) {
      console.log('user ', user);
      return res.send('Not found');
    }
    if (error) {
      return res.send(error);
    }

    console.log('here ', error, user);
    const isValid = verifyPassword(password, user.salt, user.password);

    if (!isValid) {
      return res.status(401).send('Invalid email or password');
    }

    // const parser = new UAParser();
    const parsedUserAgent = UAParser(req.headers['user-agent']);
    console.log(parsedUserAgent);
    addTask({
      to: email,
      subject: 'Log in request ',
      message: `You have a login request from ${
        parsedUserAgent?.browser?.name ?? 'unknown'
      } browser and ${parsedUserAgent?.device?.vendor ?? 'unknown'} vendor`,
    });
    return res.status(200).send('logged in sucessfully !');
  } catch (error) {
    console.log('error ', error);
    return res.send(error);
  }
});
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || !email.includes('@')) {
    res.status(400).send('Bad Request');
  }
  console.log('email ', email);
  const { hash, salt } = hashPassword(password);
  const { data, error } = await db.from('users').insert({
    email,
    password: hash,
    salt,
  });
  console.log(data);
  if (error) {
    console.log('error ', error);
    return res.send(error);
  }
  return res.status(201).send('User signed in sucessfully');
});
app.listen(5000, () => {
  console.log('listening on *:5000');
});
