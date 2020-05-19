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



//======================================================================
//Each of these post functions should be related to each bank feature




app.post("/View", function(req, res){
	let accountName = req.body.name;
});

app.post("/Deposit", function(req, res){
	let addBalance = req.body.depsoit;

});

app.post("/Withdraw", function(req, res){
	
});

app.post("/Transfer", function(req, res){
	
});

//For this I (Drew) was thinking of appending the user's account name 
//and account type (checking/savings) at the end of their username and password

//this is all I have for now
app.get("/OpenNewAccount", function(req, res){
	res.sendFile(__dirname+"/newaccount.html");
});

app.post("/OpenNewAccount", function(req, res){

	let accountName = req.body.accountname;
	let accountType = req.body.accounttype;

	let allLines = fs.readFileSync('./users.txt').toString().split(';');

	allLines.forEach(function (line) {
		let newLine = line + accountName + accountType;
		fs.appendFileSync("./users.txt", newLine.toString() + ";");
	});

	allLines = fs.readFileSync('./users.txt').toString().split(";");



	res.send("Account Registerd!<br><a href='/'>Return to Homepage</a>");
});


app.post("/RemoveAccount", function(req, res){
	
});

//======================================================================



app.get("/bank", function(req,res){
	res.sendFile(__dirname+"/bank.html");
});



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

			fs.writeFile('users.txt', (username+";"+password2+";"), {flag: 'a+'}, (err) => {
				if (err) throw err;
			})
			res.send("User created!<br><a href='/'>Return to homepage</a>");
		}
		else {
			console.log("Password must meet requirements...");
			res.send(__dirname+"/register.html")
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

	fs.readFile('./users.txt',{encoding:'utf8', flag:'r'}, function(error, data)
	{
		if(error)
		{
			console.log(error);
			return;
		}

		let newData = data.split(";");

		for(let i=0; i<(newData.length-1); i+=2)
		{
			if(newData[i]===req.body.userid && newData[i+1]===req.body.password)
			{
				console.log("Authenticated!");

				let randomNumber=Math.random().toString();
				randomNumber=randomNumber.substring(2,randomNumber.length);


				// Set the cookie session ID
				// Date.now() + 180000 sets the expiration date of the cookie 180000 milliseconds (3 mins) from now
				res.cookie('loggedin',randomNumber, { expires: new Date(Date.now() + 180000), httpOnly: true});
				res.sendFile(__dirname+"/bank.html");
				return;
			}
		}
		res.send("Invalid username or password!<br><a href='/'>Try again?</a>");
	
	}); 

	
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
