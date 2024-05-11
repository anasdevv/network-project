const crypto = require('crypto');

// just playing with crypto dont do this in prod
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return { hash, salt };
}
function verifyPassword(userPassword, salt, hash) {
  const userHash = crypto
    .pbkdf2Sync(userPassword, salt, 1000, 64, 'sha512')
    .toString('hex');
  console.log('userHash ', userHash);
  console.log('hash ', hash);
  return userHash === hash;
}

exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
