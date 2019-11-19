var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb');
var mc = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;

var User = require('../models/user');
var Project = require('../models/projectReg');




var projectCollection, usersCollection;

var connectToDBs = function(callback) {
    mc.connect('mongodb://localhost/loginapp', function(err, db) {
        if (err) {
            throw err;
        }
        
        projectCollection = db.collection('projectReg');
	usersCollection = db.collection('users');

        if (callback) {
            callback();
        }
    });
}

// connect to DB when file is loaded
connectToDBs();

/////////////////

router.post('/deleteProject', function(req, res) {
 
            	projectCollection.remove({projectName: req.body.projectName});
      req.flash('success_msg', 'Project Deleted');
        res.redirect('adminindex' );
    }
);










router.get('/getProjects', function(req, res, next) {
	var resultArray = []; 
	var cursor = projectCollection.find(); 
	cursor.forEach(function(doc, err){

		resultArray.push(doc);
	},function(){
		console.log(resultArray);
		res.render('adminindex', {layout: 'admindashboard', projects: resultArray});
	});      
});



router.get('/getStudentProjects', function(req, res, next) {

	var resultArray = []; 
	var cursor = projectCollection.find(); 
	cursor.forEach(function(doc, err){

		resultArray.push(doc);
	},function(){
		console.log(resultArray);
		res.render('studentprofile', {username: req.user.username, projects: resultArray});
	});      
});





// Register
router.post('/registerproject', function(req, res){
	
		var newProject = {
			projectName: req.body.projectname, 
			owner:"null"
		};

		projectCollection.insert(newProject);

		req.flash('success_msg', 'You Project is listed now');
		//conosle.log(db.projectReg.find().pretty());

		res.redirect('adminindex' );
	});


router.get('/register', function(req, res){
	res.render('register');
});


router.post('/registerinproject', function(req, res){
		var idd = req.body.projectid; 
		console.log("sssssssssssssssss");
		console.log(idd);
			var resultArray = []; 
	var cursor = projectCollection.find({projectName: idd}); 
	cursor.forEach(function(doc, err){

		resultArray.push(doc);
	},function(){

		console.log("tttttttttttttttt");
		if(resultArray[0].owner !=  "null"){

		req.flash('error_msg', 'Someone has already taken this project');

		res.redirect('/users/getStudentProjects' );
				}

				else{ 

					projectCollection.update({projectName: idd},
                                   {$set: {owner: req.user.username}}); 
					//req.flash('success_msg', 'You are now registered in a project' );
					res.render('registrationsuccess', {title: 'Success!', username: req.user.username, project: idd});



				}


		

		
	//	console.log(resultArray);
		//res.render('studentprofile', {username: req.user.username, projects: resultArray});
	});  





	
});




// Login
router.get('/login', function(req, res){
	res.render('login');
});



router.get('/adminindex', function(req, res){
	res.render('adminindex', { layout: 'admindashboard' });
});
// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;


	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});










router.post('/adminlogin',
//  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
  	//console.log(request.body.user.adminpassword);
  	var adminpass = req.body.adminpassword;
	var adminuser = req.body.adminname;
  	if (adminpass == "admin" & adminuser == "admin"){
    res.redirect('adminindex');

}
req.flash('error_msg','Enter valid admin username and password');


	res.redirect('/users/login');
  });




router.get('/studentprofile', function(req, res){
res.render('studentprofile', { username: req.user.username });
});




router.post('/login',
  passport.authenticate('local', {successRedirect:'studentprofile', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
  	// var data = {name: 'Gorilla'};
  //res.render('adminindex', data);
   // res.render('/',{currentUser: "eeeee"});

  });





router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;