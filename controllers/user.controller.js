const blogSchema = require("../models/blog.model")
const userSchema = require("../models/user.model")
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User', userSchema);


//signUp
pSignup = async (req, res) => {

    // console.log(req.body);
    User.find({ username: req.body.username }).then(async (data, err) => {

        if (err) {
            res.render('signup', { ALERT: true });

        } else {
            const newUser = new User({

                username: req.body.username,
                password: req.body.password

            });

            await newUser.save();

            // usernameSession = req.body.username;
            // passwordSession = req.body.password;
            const user = {username:req.body.username, password:req.body.password};
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.cookie('ACCESS_TOKEN',accessToken).redirect('/myblogs');
        }

    });



}

//login
pLogin = (req, res) => {

    User.findOne({ username: req.body.username }).then((data, err) => {


        if (data) {

            if (data.password == req.body.password) {

            
                const user = {username:req.body.username, password:req.body.password};
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                res.cookie('ACCESS_TOKEN',accessToken).redirect('/myblogs');
            } else {
                return res.render('login', { message: "Incorrect Password!", ALERT: true });
            }
        } else {
            console.log(err);
            return res.render('login', { message: "User Not Found!", ALERT: true });

        }

    });

}

// logout User
logOutUser = (req, res) => {

    try {
        const decoded = jwt.verify(req.cookies['ACCESS_TOKEN'], process.env.ACCESS_TOKEN_SECRET);

      } catch(err) {
        console.log(err);
      }
    res.res.clearCookie('ACCESS_TOKEN').redirect('/');
}

// login page
loginPage = (req, res) => {

    res.render('login', { ALERT: false });
}

//signupPage
signupPage = (req, res) => {

    res.render('signup', { ALERT: false });
}

module.exports = {pSignup, pLogin, logOutUser,
    loginPage, signupPage
};