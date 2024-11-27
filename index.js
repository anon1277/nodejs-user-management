// #packages
const mongoose = require('mongoose');
const express = require('express');


mongoose.connect('mongodb://127.0.0.1:27017/');

const app = express(); 


const UsreRoute = require('./routes/UserRoutes');

app.use('/' ,UsreRoute);


app.listen(3000,function(){
    console.log("Server is on Port 3000");
    
} )




