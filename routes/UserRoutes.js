// Importing required modules
const express = require('express');
const path = require('path');
const UserController = require('../controllers/UserController');
const BodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const { config } = require('process');
const user_route = express();

// Importing custom authentication middleware
const auth = require('../middeleware/auth');

// Importing configuration for session
const configSes = require("../config/config");

// Setting up the session middleware with a secret key for signing the session ID
user_route.use(session({secret: configSes.sessionKey}));

// Allow access to static files in the 'public' directory
user_route.use(express.static('public'));

// Configuring the file upload storage using multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Set the destination folder for uploaded files
        cb(null, path.join(__dirname, '../public/userimages'));
    },
    filename: function(req, file, cb) {
        // Create a unique filename using the current timestamp
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Using BodyParser to parse incoming JSON and URL-encoded data
user_route.use(BodyParser.json());
user_route.use(BodyParser.urlencoded({ extended: true }));

// Setting up the view engine and the location of views directory
user_route.set('view engine', 'ejs');
user_route.set('views', './views/users');

// Define routes for the application

// Register routes
user_route.get('/register', auth.islogout, UserController.LoadRegister);  // Load registration page
user_route.post('/register', upload.single('image'), UserController.InsertUser);  // Handle user registration

// Email verification route
user_route.get('/verify', UserController.verifyMail);  // Verify email link

// Login routes
user_route.get('/', auth.islogout, UserController.LoginLoad);  // Load login page
user_route.get('/login', auth.islogout, UserController.LoginLoad);  // Load login page (same as above)
user_route.post('/login', UserController.VerifyLogin);  // Handle login form submission

// logout
user_route.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/login');  // Redirect to login page or homepage
    });
});

// Home route (only accessible after successful login)
user_route.get('/home', auth.isLogin, UserController.Loadhome);  // Load user home page

// Forgot password routes
user_route.get('/forgot-password', auth.islogout, UserController.ShowForgotPaasswordPage);  // Show forgot password page
user_route.post('/forgot-password', auth.islogout, UserController.ActionForgotPaasswordPage);  // Handle forgot password form submission
user_route.get('/forget-password-view', auth.islogout, UserController.ActionForgotPaasswordLinkPage);  // Show password reset form
user_route.post('/reset-password', UserController.ResetPassword);  // Handle password reset form submission

// email-verifcation
user_route.get('/user-verification', auth.islogout, UserController.UserVerification);  // Show Email verification page
user_route.post('/send-verification-email', auth.islogout, UserController.SendVerificationMail);  // Send verifcation mail 

//User profile Routes
user_route.get('/edit', auth.isLogin, UserController.Edit);  // Load user Edit page
user_route.post('/user-update', auth.isLogin,upload.single('image') , UserController.UserUpdate);  // Send verifcation mail 



// Export the configured user_route
module.exports = user_route;
