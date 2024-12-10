const User = require('../models/UserMoldel');
const bcrypt = require('bcrypt');
const Nodemailer = require('nodemailer');
const Randomstringgenrate = require('randomstring');

// config
const config = require('../config/config')

const securePasword = async (password) => {
    try {
        const HashedPasword = await bcrypt.hash(password, 10);
        return HashedPasword;
    } catch (error) {
        console.log(error.message)
    }
}

// mail verification
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const Transport = Nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.EmailUser,
                pass: config.EmailPassword,
            }
        });


        const mailOptions = {
            from: 'joejemes40@gmail.com', // Sender address
            to: email, // Recipient's email
            subject: 'For verification mail', // Email subject
            html: `<p>Hi ${name}, please click here to <a href="http://localhost:3000/verify?id=${user_id}">Verify</a> your email</p>`, // Email content
        };

        Transport.sendMail(mailOptions, function (error, info) {

            if (error) {
                console.log(error)
            }
            else {
                console.log("email has been send-:", info.response);
            }


        });
    } catch (error) {
        console.log(error.message);

    }

}
//show register page
const LoadRegister = async (req, res) => {
    try {
        res.render('registration');
    } catch (error) {
        console.log(error.message)
    }
}

//create user
const InsertUser = async (req, res) => {
    try {

        const EncryptedPasword = await securePasword(req.body.password)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: EncryptedPasword,
            image: req.file.filename,
            mobile: req.body.mobile,
            is_admin: 0,
            is_varified: 0,

        });

        const UserData = await user.save()

        if (UserData) {
            sendVerifyMail(req.body.name, req.body.email, UserData._id);
            res.render('registration', { message: 'your registration has Been Successfully, Please verift your mail' });
        }
        else {
            res.render('registration', { message: 'your registration has Been Failed' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyMail = async (req, res) => {

    try {

        const UpdateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } })
        console.log("UpdateInfo", UpdateInfo);
        res.render("email-verified");

    } catch (error) {
        console.log(error.message);
    }
}

// login user methods
const LoginLoad = async (req, res) => {

    try {

        res.render('login');

    } catch (error) {
        console.log(error.message)
    }
}


// login user methods
const VerifyLogin = async (req, res) => {
    try {

        console.log("verifylogin called;")
        const { email, password } = req.body;

        // Find the user by email
        const UserData = await User.findOne({ email: email });
        if (!UserData) {
            return res.render('login', { message: "Email and password are incorrect" });
        }

        console.log("UserData:", UserData);

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, UserData.password);
        console.log("isPasswordValid",isPasswordValid);
        
        if (isPasswordValid) {
            
            // Check if user is verified
            if (UserData.is_varified === 0) {
                return res.render('login', { message: "Please verify your email" });
            }
            
            if(UserData.is_admin === 0){
                return res.render('login', { message: "Email and password are incorrect" });
            }
            req.session.user_id = UserData._id;
            // Redirect to the admin home page
            console.log("Redirecting to /admin/home");
            res.redirect('/admin/home');
        }
        else{
            return res.render('login', { message: "Email and password are incorrect" });
        }
    } catch (error) {
        console.error("Error in VerifyLogin:", error.message);
        res.status(500).send("An internal server error occurred.");
    }
};

const LoadDashboard = async (req, res) => {
    try {
        console.log("admin dashborad called");
        
        // Fetch user by session user_id
        const user = await User.findById({ _id: req.session.user_id });
        if (!user) {
            // Handle the case where the user is not found
            return res.redirect('/login');
        }
        console.log("user found in admin" ,user);

        // Render the home page with user data
        res.render('home', { user: user });
    } catch (error) {
        console.log("Error in LoadDashboard:", error.message);
        res.status(500).send("An error occurred while loading the home page.");
    }
};

// show password reste link age
const ShowForgotPaasswordPage = async (req, res) => {

    try {
        console.log("admin password called.");
        res.render('admin-forget-password');

    } catch (error) {
     console.log(error.message);
             
    }
}
// Function to send a reset password email
const ResetPasswordMail = async (name, email, token) => {
    try {

        // Create a transporter object using Gmail's SMTP server configuration
        const Transport = Nodemailer.createTransport({
            host: 'smtp.gmail.com',        // SMTP server host
            port: 587,                     // Port number
            secure: false,                 // Secure connection is false as we are using port 587
            requireTLS: true,              // Ensure TLS is used
            auth: {
                user: config.EmailUser,   // Email username from config
                pass: config.EmailPassword, // Email password from config
            }
        });

        // Email options (recipient, subject, content)
        const mailOptions = {
            from: config.EmailUser,   // Sender's email address
            to: email,                // Recipient's email address
            subject: 'Reset Password Link', // Subject of the email
            html: `<p>Hi ${name}, please click here to <a href="http://localhost:3000/admin/forget-password-view?token=${token}">Reset Password</a> To reset your password</p>`, // Email content with a reset link
        };

        // Send the email using the transport object
        Transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);  // Log any error if the email fails to send
            } else {
                console.log("Email has been sent: ", info.response);  // Log success message if the email is sent
            }
        });
    } catch (error) {
        // Catch and log any errors that occur during the execution
        console.log(error.message);
    }
}

// Controller action to handle the forgot password form submission
const ActionForgotPaasswordPage = async (req, res) => {
    try {
        const email = req.body.email;  // Get the email from the form data
        const UserExsit = await User.findOne({ email: email }); // Check if the user exists in the database
        console.log("UserExsit", UserExsit);

        if (UserExsit) {
            // If the user exists, check if the email is verified
            if (UserExsit.is_varified === 0) {
                // If the user's email is not verified, return an error message
                console.log(13231);  // For debugging purposes
                return res.render('admin-forget-password', { message: "Email is inactive, please verify your mail" });
            }  else if(UserExsit.is_admin === 1) {
                // If the user is verified, generate a token for password reset
                const token = Randomstringgenrate.generate();  // Generate a random token
                // Update the user's document with the generated token
                const UpdatedData = await User.updateOne({ email: email }, { $set: { token: token } });
                // Send the reset password email with the generated token
                ResetPasswordMail(UserExsit.name, email, token);
                // Render the page with a success message
                return res.render('admin-forget-password', { message: "Please check your mail to reset your password" });
            }
        } else {
            // If the user is not found in the database, return an error message
            return res.render('forget-password', { message: "Email not found" });
        }

    } catch (error) {
        // Catch any errors that occur during the execution
        console.log(error.message); // Log the error message
    }
}
// show reset password view
const ActionForgotPaasswordLinkPage = async (req, res) => {
    try {
        const MailToken = req.query.token;  // Extract the token from the URL query parameters
        const Tokendata = await User.findOne({ token: MailToken });  // Find the user using the token

        if (Tokendata) {
            // If the token is valid, render the password reset page and pass user data
            return res.render('admin-forget-password-view', { user_id: Tokendata._id });
        } else {
            // If the token is invalid or expired, render a 404 page with an error message
            return res.render('404', { message: "Invalid or expired token" });
        }
    } catch (error) {
        console.log(error.message);  // Log any errors
        return res.status(500).send("Server error");
    }
};

// show reset password view
const ResetPassword = async (req, res) => {
        try {
            const { password, confirm_password, user_id } = req.body;
            
            if (password !== confirm_password) {
                console.log("Passwords do not match" ,password ,confirm_password);
                return res.render('forget-password-view', { message: "Passwords do not match", user_id });
            }
            
            // Hash the password before saving it (you can use bcrypt for hashing)
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Update the user's password in the database
            await User.updateOne({ _id: user_id }, { $set: { password: hashedPassword, token: null } });
    
            // Redirect the user to a login page after successful reset
            return res.redirect('/admin/login?message=Your password has been reset successfully.');
        } catch (error) {
            console.log(error.message);
            return res.status(500).send("Error resetting password");
        }
    };
    // Show user verification page
    const UserVerification = async (req, res) => {
        try {
            // Render the user-verification page when the user visits the route
            res.render('user-verification');
        } catch (error) {
            // Log any error that occurs while rendering the page
            console.log(error.message);
        }
    }

    // Send verification mail
    const SendVerificationMail = async (req, res) => {
        console.log("send-verification-email called");
        try {
            // Get the email provided in the form submission
            const email = req.body.email;

            // Find the user in the database based on the provided email
            UserData = await User.findOne({ email: email });

            // If user data exists for the provided email
            if (UserData) {
                // Check if the user's email is already verified
                if (UserData.is_varified != 1) {
                    // If the user is not verified, send the verification email
                    sendVerifyMail(UserData.name, UserData.email, UserData._id);
                    // Render the verification page with a success message
                    res.render('user-verification', { message: "Please check your mail, verification mail is sent." });
                } else {
                    // If the user is already verified, render the page with a relevant message
                    res.render('user-verification', { message: "User Already Verified" });
                }
            } else {
                // If no user is found with the provided email, render the page with an error message
                res.render('user-verification', { message: "User Does Not Exist" });
            }
        } catch (error) {
            // Log any error that occurs during the process of sending the verification mail
            console.log(error.message);
        }
    }

    //show User Profile page
    const Edit = async (req, res) => {
        // Access the 'id' from the query string, not from req.body
        const Id = req.query.id;  // Correct way to access query parameters
    
        try {
            // Find the user by the provided ID
            const user = await User.findById(Id);
            
            if (!user) {
                // If no user is found, redirect to home
                return res.redirect('/home');
            }
    
            // If user found, render the edit page with user data
            res.render('edit', { user: user });
    
        } catch (error) {
            console.log("Error in Edit:", error.message);
            res.status(500).send("An error occurred while fetching user data.");
        }
    };
    // user update code
    const UserUpdate = async  (req ,res)=> {
        try {
            console.log("ypate user called");
            // Handle the uploaded image (if any)
            if (req.file) {
                console.log("if called")
                let imagePath = req.file.filename; // Use existing image if not updating
                console.log("imagePath" ,imagePath)
                // Use req.file to get the uploaded file
                const file = req.file; // req.file contains the uploaded file, not req.files.image
                imagePath = file.filename; // Use file.filename or file.path to store the image path
                
                // Perform the update using the correct image path
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: req.body.id }, 
                    { 
                        $set: { 
                            name: req.body.name, 
                            email: req.body.email, 
                            mobile: req.body.mobile, 
                            image: imagePath // Store the image path correctly
                        }
                    }
                );
                if (!updatedUser) {
                    return res.status(404).send("User not found");
                }
            } else {
                console.log("else called");
                
                // If no file is uploaded, just update the other fields
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: req.body.id },
                    {
                        $set: {
                            name: req.body.name,
                            email: req.body.email,
                            mobile: req.body.mobile
                        }
                    }
                );
                if (!updatedUser) {
                    return res.status(404).send("User not found");
                }
            }
            
    
            
    
            // Redirect to the home page (or user profile page)
            res.redirect('/home');
        } catch (error) {
            console.error("Error updating profile:", error.message);
            res.status(500).send("Error updating profile");
        }
        
    }

module.exports = {

    LoadRegister,
    InsertUser,
    verifyMail,
    LoginLoad,
    VerifyLogin,
    LoadDashboard,
    ShowForgotPaasswordPage,
    ActionForgotPaasswordPage,
    ActionForgotPaasswordLinkPage,
    ResetPassword,
    UserVerification,
    SendVerificationMail,
    Edit,
    UserUpdate,

}