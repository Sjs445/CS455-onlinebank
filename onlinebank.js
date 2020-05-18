'use strict'

const xssFilters = require("xss-filters");
const express = require("express");
const fs = require("fs");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
//const csp = require("helmet-csp");


function contains(password, allowedChars) {
    for ( let i = 0; i < password.length; i++) {
        let char = password.charAt(i);
 			if (allowedChars.indexOf(char) >= 0) 
 				return true;
 	}
 	return false;
}

function isStrongPassword(phrase){
	let uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let lowercase = "abcdefghijklmnopqrstuvwxyz";
	let digits = "0123456789";
	let splChars = "!@#$%^&*()";
	let ucaseFlag = contains(phrase, uppercase);
	let lcaseFlag = contains(phrase, lowercase);
	let digitsFlag = contains(phrase, digits);
	let splCharsFlag = contains(phrase, splChars);

	if(phrase.length>=8 && ucaseFlag && lcaseFlag && digitsFlag && splCharsFlag)
   		return true;
    else
    	return false; 
}



app.use(cookieParser());

app.get("/register", function(req, res){
	res.sendFile(__dirname+"/register.html");
});

app.post("/register", function(req, res){
	let username = req.body.username;
	let password1 = req.body.password1;
	let password2 = req.body.password2;
	
	if(password1 === password2)
	{
		if (isStrongPassword(password2)) {

			fs.writeFile('login.txt', (username+";"+password2), {flag: 'a+'}, (err) => {
				if (err) throw err;
			})
			res.send("User created!<br><a href='/'>Return to homepage</a>");
		}
		else {
			console.log("Password must meet requirements...");
		}
	}
	else
	{
		res.send("Passwords do not match!");
	}
});



// Read from text file of usernames and passwords
// In this function, I want to add a feature where if the user selects "register on the login page
// then another webpage will open with the boxes to creae a username and password.
// So currently the link "should" be http://localhost/4000/login.
// Then if user clicks on register (still need to implement that), then they will be 
// redirected to http://localhost/4000/register
app.post("/login", function(req, res) {

	let data = fs.readFileSync('./login.txt', 
			{encoding:'utf8', flag:'r'}); 

	let newData = data.split(";");
	
	if(newData[0]===req.body.userid && newData[1]===req.body.password)
	{
		console.log("Authenticated!");

		let randomNumber=Math.random().toString();
		randomNumber=randomNumber.substring(2,randomNumber.length);


		// Set the cookie session ID
		// Date.now() + 180000 sets the expiration date of the cookie 180000 milliseconds (3 mins) from now
		res.cookie('loggedin',randomNumber, { expires: new Date(Date.now() + 180000), httpOnly: true});
		res.sendFile(__dirname+"/bank.html");
	}
	else
	{
		res.send("Invalid username or password!<br><a href='/'>Try again?</a>");
	}
});

app.get("/", function(req, res){

	let cookie = req.cookies['loggedin'];

	//	If the user does not have a login cookie
	if(cookie === undefined)
	{
		//	Show them the startup page
		res.sendFile(__dirname+"/startup.html");
	}
	else
	{
		// Send them to the bank app
		res.sendFile(__dirname+"/bank.html")
	}
});

app.post("/logout", function(req, res){
	res.clearCookie('loggedin');
	res.send("Logged out!<br><br><a href='/'>Login</a>");
})



app.listen(4000);
