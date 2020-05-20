'use strict'

const xssFilters = require("xss-filters");
const express = require("express");
const fs = require("fs");
const readline = require("readline");
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
	let currentUser = req.body.username;
	let name = req.body.accountName;
	let type = req.body.accountType;
	let initialBalance = req.body.initialBalance;
	let filePath = __dirname+"/users.txt"


	// allLines should read each line separated by "\n"
	fs.readFile('users.txt', (err, data)=>{
		if (err) throw err;

		// array holds each user's username+password separated by a "\n"
		let array = data.toString().split("\n");

		

		// iterate through each index (in this case through each user)
		// and append their account info
		// check which user is logged on and append the info to that account
		for (let i = 0; i < array.length-1; ++i){
			if(req.body.hasClass('loggedin')) {
				let newLine = array[i]+name+";"+type+";"+initialBalance+";"+"\n";

				// then write to a new file called accounts.txt
				fs.writeFileSync('accounts.txt', newLine, {flag: 'a+'}, (err) =>{
					if (err) throw err;
				});
			}
			else {
				;
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



// Read from text file of usernames and passwords
// In this function, I want to add a feature where if the user selects "register on the login page
// then another webpage will open with the boxes to creae a username and password.
// So currently the link "should" be http://localhost/4000/login.
// Then if user clicks on register (still need to implement that), then they will be 
// redirected to http://localhost/4000/register
app.post("/login", function(req, res) {

	fs.readFile('./users.json',{encoding:'utf8', flag:'r'}, function(error, data)
	{
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
