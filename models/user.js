const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;

userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.plugin(passportLocalMongoose); //this adds on to our schema: a username, password, ensures usernames are unique, gives us methods, etc.

module.exports=mongoose.model('User', userSchema);