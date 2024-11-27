const User = require('../models/UserMoldel');
const bcrypt = require('bcrypt');
const Nodemailer = require('nodemailer');

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
                user: 'joejemes40@gmail.com',
                pass: 'xqevgiehmqwlluos',
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
        console.log("Request body:", req.body.email);

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
        
        if (!isPasswordValid) {
            return res.render('login', { message: "Email and password are incorrect" });
        }

        // Check if user is verified
        if (UserData.is_varified === 0) {
            return res.render('login', { message: "Please verify your email" });
        }

        req.session.user_id = UserData._id;

        // Redirect to the home page if everything is valid
        res.redirect('/home');
    } catch (error) {
        console.error("Error in VerifyLogin:", error.message);
        res.status(500).send("An internal server error occurred.");
    }
};

const Loadhome = async (req, res) => {

    try {
        res.render('index');

    } catch (error) {
     console.log(error.message);
             
    }
}
module.exports = {

    LoadRegister,
    InsertUser,
    verifyMail,
    LoginLoad,
    VerifyLogin,
    Loadhome,
}