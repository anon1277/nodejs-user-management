
```markdown
# User Management System

A simple user management system built with Node.js, Express.js, EJS, MongoDB, and MVC architecture. This application allows users to register, log in, reset passwords, and verify their email addresses. Admin users have the ability to manage regular users (create, update, delete users) and perform administrative tasks.

## Features

### User Features
- **Register:** Users can register with an email and password.
- **Login:** Users can log in using their email and password.
- **Forgot Password:** Users can request a password reset email.
- **Password Reset:** Users can reset their password via a token sent to their email.
- **Email Verification:** Users will need to verify their email after registration.

### Admin Features
- **Admin Login:** Admins can log in to access the admin dashboard.
- **User Management:** Admins can create, update, and delete user accounts.
- **Admin Authentication:** Admin access is protected and requires authentication.

## Technologies Used
- **Node.js** for server-side scripting
- **Express.js** for the web framework
- **EJS** for templating
- **MongoDB** for the database
- **Bcrypt.js** for password hashing
- **Nodemailer** for sending emails (for verification and password reset)
- **Express-Session** for session management

## Project Setup

### Prerequisites
- **Node.js** and **npm** must be installed.
- **MongoDB** should be installed locally or use a cloud database like MongoDB Atlas.

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/user-management-system.git
   ```

2. Navigate to the project directory:

   ```bash
   cd user-management-system
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add your environment variables:

   ```plaintext
   MONGO_URI=mongodb://localhost:27017/user-management
   SESSION_SECRET=your_session_secret
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=587
   EMAIL_USER=your_mailtrap_user
   EMAIL_PASS=your_mailtrap_password
   ```

### Running the Application

To start the application:

```bash
npm start
```

By default, the application will be accessible at `http://localhost:3000`.

### Routes

- **POST /register**: Registers a new user.
- **POST /login**: Logs in a user.
- **GET /logout**: Logs out a user.
- **POST /reset-password**: Sends a password reset email.
- **GET /reset-password/:token**: Opens the reset password page.
- **POST /update-password**: Updates the password.
- **GET /admin/home**: Admin dashboard.
- **GET /admin/manage-users**: Admin can view and manage users.
- **POST /admin/create-user**: Admin can create a new user.
- **POST /admin/delete-user/:id**: Admin can delete a user.

### Database

The application uses MongoDB to store user data, including emails, hashed passwords, and verification statuses. MongoDB should be running locally or via a cloud service like MongoDB Atlas.

## Contributing

If you would like to contribute to this project, feel free to fork the repository, create a new branch, and submit a pull request. Please ensure your code follows the existing coding style and includes tests if applicable.

## License

This project is open-source and available under the [MIT License](LICENSE).
```

This **README.md** file includes all the steps to set up and run your project in one place, including dependencies installation, environment variables, and application setup.
