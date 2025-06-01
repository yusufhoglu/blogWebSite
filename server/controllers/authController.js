const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const path = require('path');

exports.getSigninPage = (req, res) => {
    if(!req.session.loggedIn) {
        res.render("signin", {title: "Sign-in", message: "Welcome!"});
    } else {
        res.redirect("/alert");
    }
};

exports.signin = async (req, res) => {
    try {
        const nickName = req.body.nickName;
        const password = req.body.password;
        const password2 = req.body.password2;

        if(password.length < 8) {
            return res.render("signin", {title: "Sign-in", message: "password length must be greater than 7!"});
        }
        
        if(nickName.length < 4) {
            return res.render("signin", {title: "Sign-in", message: "username length must be greater than 3!"});
        }

        if(password !== password2) {
            return res.render("signin", {title: "Sign-in", message: "passwords doesn't match!"});
        }

        const hash = await bcrypt.hash(password, saltRounds);
        const user = new User({
            userId: nickName,
            userPassword: hash
        });

        await user.save();
        res.render("signin", {title: "Sign-in", message: "You have successfully registered"});
    } catch (err) {
        if(err.code === 11000) {
            res.render("signin", {title: "Sign-in", message: "Username already exist!"});
        } else {
            res.status(500).send(err);
        }
    }
};

exports.getLoginPage = (req, res) => {
    if(!req.session.loggedIn) {
        res.render("login", {title: "Log-in", message: "Welcome!"});
    } else {
        res.redirect("/alert");
    }
};

exports.login = async (req, res) => {
    try {
        const nickName = req.body.nickName;
        const password = req.body.password;

        const user = await User.findOne({userId: nickName});
        if (!user) {
            return res.render("login", {title: "Log-in", message: "Username is not registered"});
        }

        const result = await bcrypt.compare(password, user.userPassword);
        if (result === true) {
            req.session.userName = nickName;
            req.session.loggedIn = true;
            res.render("login", {title: "Log-in", message: "You have successfully logged in"});
        } else {
            res.render("login", {title: "Log-in", message: "Wrong password"});
        }
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.getAlertPage = (req, res) => {
    res.render("alert", {title: "ALERT"});
};

exports.logout = (req, res) => {
    req.session.loggedIn = false;
    res.redirect("/signin");
};

exports.getAlert2Page = (req, res) => {
    res.render("alert2", {title: "ALERT"});
};

exports.redirectToLogin = (req, res) => {
    res.redirect("/login");
}; 