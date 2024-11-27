const express = require('express');
const path = require('path');
const UserController = require('../controllers/UserController');
const BodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const { config } = require('process');
const user_route = express();

const auth = require('../middeleware/auth')

const configSes = require("../config/config");

user_route.use(session({secret:configSes.sessionKey}));

const storage = multer.diskStorage({
    destination:function(req ,file ,cb){
       cb(null,path.join(__dirname, '../public/userimages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
});

const upload = multer({storage:storage});

user_route.use(BodyParser.json());
user_route.use(BodyParser.urlencoded({extended:true}));

// Setting up the view engine and views directory
user_route.set('view engine', 'ejs');
user_route.set('views','./views/users');

// Define route
user_route.get('/register',auth.islogout, UserController.LoadRegister);

user_route.post('/register' ,upload.single('image'),UserController.InsertUser);

user_route.get('/verify', UserController.verifyMail);

user_route.get('/',auth.islogout, UserController.LoginLoad);

user_route.get('/login',auth.islogout, UserController.LoginLoad);
user_route.post('/login', UserController.VerifyLogin);

user_route.get('/home',auth.isLogin, UserController.Loadhome);

    

module.exports = user_route;
