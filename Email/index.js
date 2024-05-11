const io = require('socket.io-client');

const socket = io.connect('http://localhost:1337');

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Configure Nodemailer with your Outlook credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Function to send email
function sendEmail(emailData) {
  console.log('inside send email');
  transporter.sendMail(
    {
      from: process.env.EMAIL,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.message,
    },
    (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
        // socket.emit('task_completed', { id: emailData.id });
        // socket.emit();
      }
    }
  );
}
const isValidEmailTask = (obj) => {
  const keys = Object.keys(obj);
  return (
    keys.includes('to') && keys.includes('message') && keys.includes('subject')
  );
};
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

socket.on('task_available', () => {
  socket.emit('request_task'); // Request a task when available
});
socket.on('receive_task', (data) => {
  console.log(data);
  if (data && isValidEmailTask(data)) {
    sendEmail(data);
  } else {
    console.log('No task available currently');
  }
});
