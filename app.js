var express 				= require('express'),
	bodyParser				= require('body-parser'),
	passport				= require('passport'),
	LocalStrategy			= require('passport-local'),
	User 					= require('./models/User'),
	passportLocalMongoose 	= require('passport-local-mongoose');



var app 			= express();
var mongoose		= require('mongoose');
// var expressSession 	= require('express-session');


mongoose.connect('mongodb://localhost/auth_demo');

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({ //require inline exp session
    secret: "be rich forever", //used to encode and decode data during session (it's encrypted)
    resave: false,          // required
    saveUninitialized: false   //required
}));


app.use(passport.initialize());
app.use(passport.session());
//plugins from passportlocalmongoose in user.js file
passport.use(new LocalStrategy(User.authenticate())); //creating new local strategy with user authenticate from passport-local-mongoose
passport.serializeUser(User.serializeUser()); //responsible for encoding it, serializing data and putting it back into session
passport.deserializeUser(User.deserializeUser()); //responsible for reading session, taking data from session that is encoded and unencoding it



//  html is statelesss it can't save the states of the user transaction 
//  to make html states sessions are used.
app.get('/',function(req,res)
{
	res.render('home');

});

app.get('/secret',isLoggedIn,function(req,res)
{
	res.render('secret');
});



//  Auth routes

// =================

// 	Register routes

// =================


app.get('/register',function(req,res)
{
	res.render('register');
});


app.post('/register',function(req,res)
{
	// res.send('reached the post route ');

	User.register(new User({username:req.body.username}),req.body.password,function(err,user)
	{
		if(err)
		{
			console.log(err);
			return res.render('register');
		}
			passport.authenticate('local')(req,res,function(){
				res.redirect('/secret');	
		});
	})
});




app.get('/error',function(req,res)
{
	res.send('error pafe');
})

app.get('/success',function(req,res)
{
	res.send('hi you are successfully logged in ');
})


// / login routes

app.get('/login',function(req,res)
{
	res.render('login');
});
//login logic
app.post("/login", passport.authenticate("local", { //used inside app.post as (middleware - code that runs before final callback)
        successRedirect: "/secret",
        failureRedirect: "/login",
    }), function(req, res){
});



//  logout route

app.get('/logout',function(req,res)
{
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
 //next is the next thing that needs to be called.
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(3000,function(req,res)
{
	console.log('authen server started !!!!');
});