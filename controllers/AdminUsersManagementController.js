//User Models
const User = require('../models/UserMoldel');
const bcrypt = require('bcrypt');
const Nodemailer = require('nodemailer');
const Randomstringgenrate = require('randomstring');
//backend validation
const Joi = require('joi');
// config
const config = require('../config/config')


//encrypt pass method
const securePasword = async (password) => {
    try {
        const HashedPasword = await bcrypt.hash(password, 10);
        return HashedPasword;
    } catch (error) {
        console.log(error.message)
    }
}

// verification mail
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
            subject: 'Verification Mail', // Email subject
            html: `<p>Hi ${name}, please click here to <a href="http://localhost:3000/verify?id=${user_id}">Verify</a> your email</p>`, // Email content
        };

        // Send email and return the result
        return new Promise((resolve, reject) => {
            Transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    reject({ success: false, error: error.message });
                } else {
                    console.log("Email sent: " + info.response);
                    resolve({ success: true });
                }
            });
        });
    } catch (error) {
        console.log(error.message);
        return { success: false, error: error.message };
    }
};

const index = async (req, res) => {
    try {
      
        // Optional: Fetch user data from DB to ensure it includes all required fields
        const user = await User.findById({ _id: req.session.user_id });
        if (!user) {
            return res.redirect('/login');
        }

        // Fetch users for the list
        const Users = await User.find({ 
            is_admin: 0, 
            isDeleted: false 
        });        
        console.log("Users:", Users);

        // Pass the full user data to the view
        res.render('users/index', { user, Users });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("An error occurred.");
    }
};

//show create page
const create = async (req, res) => {
    try {
        const loggedInUser = req.session.user;

        res.render('users/create', { user: loggedInUser });
    } catch (error) {
        console.log(error.message);
    }
}

// store new created user data
const store = async (req, res) => {
    // Define validation schema using Joi
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required().messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 3 characters',
            'string.max': 'Name must not exceed 30 characters'
        }),
        email: Joi.string().email().required().messages({
            'string.empty': 'Email is required',
            'string.email': 'Invalid email format'
        }),
        mobile: Joi.string().pattern(/^\d+$/).min(10).max(15).required().messages({
            'string.empty': 'Mobile number is required',
            'string.pattern.base': 'Mobile number must contain only digits',
            'string.min': 'Mobile number must be at least 10 digits',
            'string.max': 'Mobile number must not exceed 15 digits'
        }),
        password: Joi.string().min(6).required().messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters'
        }),
        image: Joi.string().required().messages({
            'string.empty': 'Image is required'
        })
    });

    try {
        // Validate request body and file
        const validationResult = schema.validate({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password,
            image: req.file ? req.file.filename : null
        });

        if (validationResult.error) {
            const errors = validationResult.error.details.map(err => err.message);
            return res.render('users/create', {
                message: errors[0],  // Show the first error message
                user: req.body       // Send back user input to populate form
            });
        }

        // Check if email already exists and is verified
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {

            console.log("existingUser", existingUser);

            // If user exists but is not verified, return an error message
            if (existingUser.is_verified) {
                return res.render('users/create', {
                    message: 'Email is already verified, you cannot use it again.',
                    user: req.body
                });
            } else {
                return res.render('users/create', {
                    message: 'Email is already registered, but not verified. Please verify your email first.',
                    user: req.body
                });
            }
        }
        // Hash password
        const EncryptedPassword = await securePasword(req.body.password);

        // Save user to database
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: EncryptedPassword,
            image: req.file.filename,
            mobile: req.body.mobile,
            is_admin: 0,
            is_verified: 0,
        });

        const UserData = await user.save();

        // Handle success or failure
        if (UserData) {
            // Call the sendVerifyMail function and check the result
            const emailResult = await sendVerifyMail(req.body.name, req.body.email, UserData._id);

            if (emailResult.success) {
                res.render('users/create', {
                    message: 'User created successfully, verification mail sent!',
                    user: req.body   // Send back the user data to retain values in the form
                });
            } else {
                res.render('users/create', {
                    message: 'User registration failed. Please try again later.',
                    user: req.body   // Send back the user input in case of failure
                });
            }
        } else {
            res.render('users/create', {
                message: 'User registration failed',
                user: req.body   // Send back user input in case of failure
            });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).render('users/create', {
            message: 'An error occurred during registration',
            user: req.body   // Send back user input in case of server error
        });
    }
};

// Show Edit User Page
const edit = async (req, res) => {
    try {

        console.log("req.session", req.session.user_id);

        // Fetch the user to be edited by their ID from the URL parameter
        const userId = req.params.id;
        const userToEdit = await User.findById(userId);

        // Check if the user exists
        if (!userToEdit) {
            return res.status(404).send("User not found.");
        }

        // Render the 'edit' page with the user's information
        res.render('users/edit', { user: userToEdit });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("An error occurred while fetching user details.");
    }
}

// Edit user details method
const update = async (req, res) => {

    const userId = req.params.id;

    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required().messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 3 characters',
            'string.max': 'Name must not exceed 30 characters'
        }),
        email: Joi.string().email().required().messages({
            'string.empty': 'Email is required',
            'string.email': 'Invalid email format'
        }),
        mobile: Joi.string().pattern(/^\d+$/).min(10).max(15).required().messages({
            'string.empty': 'Mobile number is required',
            'string.pattern.base': 'Mobile number must contain only digits',
            'string.min': 'Mobile number must be at least 10 digits',
            'string.max': 'Mobile number must not exceed 15 digits'
        }),
        password: Joi.string().min(6).allow(''),
        image: Joi.string().allow('') // Allow empty image if not updated
    });


    try {
    const validationResult = schema.validate({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: req.body.password,
        image: req.file ? req.file.filename : ''  // Set to empty string if no image is uploaded
    });

    // Handle validation errors
    if (validationResult.error) {
        const errors = validationResult.error.details.map(err => err.message);
        return res.render('users/edit', {
            message: errors[0],
            user: req.body
        });
    }

    console.log("test called1", validationResult);

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser && existingUser._id.toString() !== userId) {
        return res.render('users/edit', {
            message: 'Email is already in use by another user.',
            user: req.body
        });
    }


    if (req.file) {
        console.log("if called")
        let imagePath = req.file.filename; // Use existing image if not updating
        console.log("imagePath", imagePath)
        // Use req.file to get the uploaded file
        const file = req.file; // req.file contains the uploaded file, not req.files.image
        imagePath = file.filename; // Use file.filename or file.path to store the image path

        // Perform the update using the correct image path
        const updatedUser = await User.findByIdAndUpdate(
            { _id: userId },
            {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    image: imagePath, // Store the image path correctly
                    password: req.body.password,
                }
            }
        );
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
    } else {
        console.log("else called");

        // If no file is uploaded, just update the other fields
        const updatedFields = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            image: req.file ? req.file.filename : undefined, // Include image only if uploaded
        };

        // Only include the password if it's provided
        if (req.body.password) {
            updatedFields.password = await securePasword(req.body.password); // Hash the new password
        }

        console.log('updatedFields', updatedFields);
        const updatedUser = await User.findByIdAndUpdate(
            { _id: userId },
            { $set: updatedFields }, // Dynamically include fields to update
            { new: true } // Return the updated user document
        );

        if (!updatedUser) {
            return res.status(404).send('User not found.');
        }

        res.redirect('/admin/users');

    }

    } catch (error) {
        console.error(error.message);
        res.status(500).render('users/edit', {
            message: 'An error occurred while updating the user',
            user: req.body
        });
    }
};


const deleteUser = async (req, res) => {
    try {

        console.log("deleted called");
        
        const userId = req.params.id;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's status to soft delete
        user.isDeleted = true; // Assuming `isDeleted` is a field in your schema
        await user.save();

        res.redirect('/admin/users');
    } catch (error) {
        console.error("Error in deleteUser:", error.message);
        res.status(500).json({ message: "An internal server error occurred." });
    }
};

module.exports = ({
    index,
    create,
    store,
    edit,
    update,
    deleteUser,
});