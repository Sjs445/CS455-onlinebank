'use strict'

const xssFilters = require("xss-filters");
const express = require("express");
const fs = require("fs");
const readline = require("readline");
const app = express();

// Import client sessions
const sessions = require('client-sessions');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
//const csp = require("helmet-csp");

// The session settings middleware	
app.use(sessions({
	cookieName: 'session',
	secret: 'some_secret_9000',
	duration: 180000,
	activeDuration: 5 * 60 * 1000,
	httpOnly: true,
  })); 
  

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

	if(phrase.length>=10 && ucaseFlag && lcaseFlag && digitsFlag && splCharsFlag)
   		return true;
    else
    	return false; 
}

//======================================================================
//Each of these post functions should be related to each bank feature


app.post("/View", function(req, res){
	let accountName = req.body.name;
});

app.get("/Deposit", function(req, res){
	let pageStr = "<!DOCTYPE html>"
	pageStr += "<html>"
	pageStr += "<head>"
	pageStr += "<title>DEPOSIT</title>"
	pageStr += "<link rel='stylesheet' type='text/css' href='css/bootstrap.min.css'>"
	pageStr += "<script>"
	pageStr += "function checkAmount(form){"
	pageStr += "amount = form.deposit.value;"
	pageStr += "if (amount < 0 || amount > 9999) {"
	pageStr += "alert('\nPlease enter an amount between 0 and 9999 dollars. ')"
	pageStr += "return false;"
	pageStr += "}"
	pageStr += "else{"
	pageStr += "return true;"
	pageStr += "}"
	pageStr += "}"
	pageStr += "</script>"
	pageStr += "</head>"
	pageStr += "<body style = 'background: url(https://download.hipwallpaper.com/desktop/1920/1080/39/73/6mVEKW.jpg)'>"
	pageStr += "<div>"
	pageStr += "<form action= '/Deposit' method= 'POST' onsubmit= 'return checkAmount()''>"
	pageStr += "<div class= 'container'>"
	pageStr += "<h1 style='color:white'>DEPOSIT</h1><br><br>"
	pageStr += "<p style='color:white'>Please select an account.</p>"
	pageStr += "<div class= 'accounts'>"
	pageStr += "<select name= 'Account' placeholder= 'Account' required><option>Account 1</option><option>Account 2</option><option>Account 3</option></select>"
	pageStr += "</div>"
	pageStr += "<br>"
	pageStr += "<br>"
	pageStr += "<p style='color:white'>Please enter the amount of the deposit.</p>"
	pageStr += "<div class= 'amount' style ='color:white'>"
	pageStr += "$<input type='text' id= 'deposit' name='deposit' min= '0' max='9999' value= '' required>"
	pageStr += "<br>"
	pageStr += "<br>"
	pageStr += "</div>"
	pageStr += "<div class = submit'>"
	pageStr += "<input type='submit' id= 'confirm' name='done' value= 'Confirm'>"
	pageStr += "</div>"
	pageStr += "</div>"
	pageStr += "</form>"
	pageStr += "</div>"
	pageStr += "</body>"
	pageStr += "</html>"

	res.send(pageStr)

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
	let currentUser = req.session.userid;
	let name = req.body.accountName;
	let type = req.body.accountType;
	let initialBalance = req.body.initialBalance;
	//let filePath = __dirname+"/users.txt"; commented this out since we're using .json
	console.log(req.session.userid);

	
	let filePath = __dirname+"/users.json"


	// allLines should read each line separated by "\n"
	fs.readFile('users.json', (err, data)=>{
		if (err) throw err;

		let newData = JSON.parse(data);
		// iterate through each index (in this case through each user)
		// and append their account info
		// check which user is logged on and append the info to that account
		for(let i=0; i<(newData.users.length); i++)
		{
			if(newData.users[i].id === currentUser)
			{
				console.log(newData);
				newData.users[i].accounts.push({name, type, initialBalance});
				fs.writeFile('./users.json', (JSON.stringify(newData)), (err) => {
					if (err) throw err;
				});
				console.log("test");
			}
		}
		
	});


	res.send("Account Registerd!<br><a href='/'>Return to Homepage</a><br><br><a href='/OpenNewAccount'>Add Another Account</a><br>");
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
	let username = req.body.username;	//	We will need to filter this data before processing
	let password1 = req.body.password1;
	let password2 = req.body.password2;
	
	if(password1 === password2)
	{
		if (isStrongPassword(password2)) {
			let myJson;	//	Declare json object
			fs.readFile("./users.json", function(err, data){
				if(err) throw err;
				myJson = JSON.parse(data);	//	parse the text file as JSON
				myJson.users.push({id:username, password:password2, accounts:[]});	//	write back with new account data
				fs.writeFile('./users.json', (JSON.stringify(myJson)), (err) => {
					if (err) throw err;
					res.send("User created!<br><a href='/'>Return to homepage</a>");
				})
				
			});
			
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


app.post("/login", function(req, res) {

	fs.readFile('./users.json',{encoding:'utf8', flag:'r'}, function(error, data)
	{
		//	Still need to sanitize user inputs 
		if(error)
		{
			console.log(error);
			return;
		}

		let newData = JSON.parse(data);

		for(let i=0; i<(newData.users.length); i++)
		{
			if(newData.users[i].id === req.body.userid && newData.users[i].password===req.body.password)
			{
				console.log("Authenticated!");

				//	Set the cookie session
				req.session.userid=newData.users[i].id;


				res.sendFile(__dirname+"/bank.html");
				return;
			}
		}
		res.send("Invalid username or password!<br><a href='/'>Try again?</a>");
	
	}); 

	
});

app.get("/", function(req, res){

	//	If the user does not have a session
	if(req.session.userid === undefined)
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
	req.session.reset();
	res.send("Logged out!<br><br><a href='/'>Login</a>");
})


app.listen(4000);
