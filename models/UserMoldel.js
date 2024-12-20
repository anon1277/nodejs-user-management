const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    }, 
    email:{
        type:String,
        required:true
    },

    mobile:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    image:{
        type:String,
        required:true
    },

    is_admin:{
        type:Number,
        required:true,
    },

    is_varified:{
        type:Number,
        defalt:0,
    },

    token:{
        type:String,
        defalt:'',
    },
    isDeleted: {
        type: Boolean,
        default: false, // Initially not deleted
    },

});

module.exports = mongoose.model('user',UserSchema);