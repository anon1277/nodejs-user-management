const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            return next(); // Proceed to the next route or middleware
        } else {
            res.redirect('admin/login'); // Redirect to login if not logged in
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const islogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            return res.redirect('/admin/home'); // Redirect to home if logged in
        } else {
            return next(); // Proceed to next middleware if not logged in
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    isLogin,
    islogout,
};
