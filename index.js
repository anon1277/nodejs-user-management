// #packages
const mongoose = require('mongoose');
const express = require('express');


mongoose.connect('mongodb://127.0.0.1:27017/');

const app = express(); 

// User Routes
const UsreRoute = require('./routes/UserRoutes');
app.use('/' ,UsreRoute);

//Admin Routes
const AdminRoute = require('./routes/AdminRoutes');
app.use('/admin' ,AdminRoute);


app.listen(3000,function(){
    console.log("Server is on Port 3000");
    
} )




