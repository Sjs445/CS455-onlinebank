'use strict'

const xssFilters = require("xss-filters");
const express = require("express");
const fs = require("fs");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
//const csp = require("helmet-csp");


function contains(password, allowedChars) {
    for (i = 0; i < password.length; i++) {
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

app.post("/register", function(req, res){
	if (isStrongPassword(req.body.password)) {
		fs.writeFile('../login.txt', (req.body.username, req.body.password), (err) => {
			if (err) throw err;
		})
	}
	else {
		alert("Password must meet requirements...");
	}

});


// Read from text file of usernames and passwords
app.post("/login", function(req, res) {
	
	//	Read the logins.txt file and parse into Array newData
	let data = fs.readFileSync('../login.txt', {encoding:'utf8', flag:'r'});
	let newData = data.split(";");
	
	if(newData[0]===req.body.username && newData[1]===req.body.password)
	{
		console.log("Authenticated!");

		let randomNumber=Math.random().toString();
		randomNumber=randomNumber.substring(2,randomNumber.length);


		// Set the cookie session ID
		// Date.now() + 10000 sets the expiration date of the cookie 300000 milliseconds (300 sec) from now
		res.cookie('loggedin',randomNumber, { expires: new Date(Date.now() + 300000), httpOnly: false});
		let pageHTML="<html><body bgcolor=white><h1>Welcome back: "+req.body.username+"!</h1><br><a href='/bank'>Bank</a></body></html>";
		res.send(pageHTML);
	}
	else
	{
		alert("Invalid Username and/or Password");
	}
});

app.listen(4000);
