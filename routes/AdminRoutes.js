// Importing required modules
const express = require('express');
const path = require('path');
const AdminController = require('../controllers/AdminController');
const Ums  = require('../controllers/AdminUsersManagementController');
const BodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const { config } = require('process');
const admin_route = express();

//backend validations
const { check , validationResult} = require('express-validator');

// Importing custom authentication middleware
const auth = require('../middeleware/AdminAuth');

// Importing configuration for session
const configSes = require("../config/config");

// Setting up the session middleware with a secret key for signing the session ID
admin_route.use(session({secret: configSes.sessionKey}));

// Allow access to static files in the 'public' directory
admin_route.use(express.static('public'));

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
admin_route.use(BodyParser.json());
admin_route.use(BodyParser.urlencoded({ extended: true }));

// Setting up the view engine and the location of views directory
admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

// Define routes for the application

// Register routes
admin_route.get('/register', auth.islogout, AdminController.LoadRegister);  // Load registration page
admin_route.post('/register', upload.single('image'), AdminController.InsertUser);  // Handle user registration

// Email verification route
admin_route.get('/verify', AdminController.verifyMail);  // Verify email link

// Routes for handling login
admin_route.get('/', auth.islogout, AdminController.LoginLoad); 

// Routes for handling the post-login actions
admin_route.post('/login', AdminController.VerifyLogin); 
// Admin home route (only accessible by logged-in admin)
admin_route.get('/home', auth.isLogin, AdminController.LoadDashboard); 
//logout
admin_route.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/admin'); // Redirect to the admin login page
    });
});


// Forgot password routes
admin_route.get('/forgot-password', auth.islogout, AdminController.ShowForgotPaasswordPage);  // Show forgot password page
admin_route.post('/forgot-password', auth.islogout, AdminController.ActionForgotPaasswordPage);  // Handle forgot password form submission
admin_route.get('/forget-password-view', auth.islogout, AdminController.ActionForgotPaasswordLinkPage);  // Show password reset form
admin_route.post('/reset-password', AdminController.ResetPassword);  // Handle password reset form submission

// email-verifcation
admin_route.get('/user-verification', auth.islogout, AdminController.UserVerification);  // Show Email verification page
admin_route.post('/send-verification-email', auth.islogout, AdminController.SendVerificationMail);  // Send verifcation mail 

//User profile Routes
admin_route.get('/edit', auth.isLogin, AdminController.Edit);  // Load user Edit page
admin_route.post('/user-update', auth.isLogin,upload.single('image') , AdminController.UserUpdate);  // Send verifcation mail 

//user List
admin_route.get('/users', auth.isLogin, Ums.index);  // Show User list page
//user create page
admin_route.get('/users/create', auth.isLogin, Ums.create);  // Show User Create page
//store user info
admin_route.post('/users/store', upload.single('image'), Ums.store);  // store User details
//show user edit page
admin_route.get('/users/edit/:id', auth.isLogin, Ums.edit); // Show User Edit page
//update user info
admin_route.post('/users/update/:id', upload.single('image'), Ums.update);  // store User details
//delete user
admin_route.get('/users/delete/:id',auth.isLogin, Ums.deleteUser);  // store User details

admin_route.get('*', (req, res) => {
    console.log('Unknown route accessed:', req.originalUrl);
    res.redirect('/admin');
});

// Export the configured admin_route
module.exports = admin_route;

