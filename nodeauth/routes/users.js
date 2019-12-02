var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var User = require('../models/user');
var Component = require('../models/component');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function (req, res, next) {
  res.render('register', {title: 'Register'});
});

router.get('/login', function (req, res, next) {
  res.render('login', {title:'Login'});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function (req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
});

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function (err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message: 'Invalid Password'});
      }
    });
  });
}));

router.post('/register', upload.single('profileimage'), function (req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  if(req.file){
    console.log('Uploading File...');
    var profileimage = req.file.filename;
  } else {
    console.log('No File Detected');
    var profileimage = 'noimage.jpg';
  }
  
  // Form Validator
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username  field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    })
    console.log('Errors');
  } else{
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });

  User.createUser(newUser, function(err, user){
    if(err) throw err;
    console.log(user);
  });

  req.flash('success', 'You are now registered and can login');


  res.location('/');
  res.redirect('/');

  }

});

router.get('/profile', function (req, res, next) {
  res.render('profile', { title: 'Profile', pageData: { user: req.user} });
});

router.get('/component', function (req, res, next) {
  Component.getAllComponents(function (err, user) {
    if (err) throw err;
    if (!user) {
      return done(null, false, { message: 'Unknown User' });
    }
  });

  res.render('component', { title: 'Component', pageData: { user: req.user } });
});

router.post('/component', function (req, res, next) {
  var name = req.body.name;
  var quantity = req.body.quantity;

  // Form Validator
  req.checkBody('name', 'Quantity field is required').notEmpty();
  req.checkBody('quantity', 'Quantity field is required').notEmpty();
  req.checkBody('quantity', 'Quantity field must be a number').isDecimal();

  // Check Errors
  var errors = req.validationErrors();

  if (errors) {
    res.render('component', {
      errors: errors
    })
    console.log('Errors');
  } else {
    var newComponent = new Component({
      name: name,
      quantity: quantity
    });

    Component.createComponent(newComponent, function (err, component) {
      if (err) throw err;
      console.log(component);
    });

    req.flash('success', 'The component has been registered');

    res.location('/');
    res.redirect('/');

  }

});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
