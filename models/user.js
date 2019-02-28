var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
   
    admin: {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose); // automaticly adds support for username and password.

module.exports = mongoose.model('User', User);

