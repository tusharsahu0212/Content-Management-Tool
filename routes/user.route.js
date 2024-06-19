const {pSignup, pLogin, logOutUser, loginPage, signupPage} = require("../controllers/user.controller");

module.exports = (app) => {

    //signUp
    app.post('/signUp', pSignup);

    //login
    app.post('/login', pLogin);

    // logout User
    app.get('/logout', logOutUser);

    // login page
    app.get('/login', loginPage);

    //signup page
    app.get('/signUp', signupPage);
};