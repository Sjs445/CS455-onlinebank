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
const csp = require("helmet-csp");

// The session settings middleware	
app.use(sessions({
	cookieName: 'session',
	secret: 'some_secret_9000',
	duration: 180000,
	activeDuration: 5 * 60 * 1000,
	httpOnly: true,
  })); 
  
app.use(csp({
	directives:{
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'"],
	}
}))

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
	let currentUser = req.session.userid;			
		fs.readFile('users.json', (err, data) => {
			if (err) throw err;
			else {
				let pageStr =  "<!DOCTYPE html>";
					pageStr += "<html>";
					pageStr += "	<head>";
					pageStr += "		<title>View</title>";
					pageStr += "			<link rel='stylesheet' type='text/css' href='css/bootstrap.min.css'>";
					pageStr += "			<body style = 'background: url(https://download.hipwallpaper.com/desktop/1920/1080/39/73/6mVEKW.jpg)'>";
					pageStr += "			</body>";
					pageStr += "	</head>";
					pageStr += "	<body>";
					pageStr += "		<form id='ViewAccounts' action='/View' method='GET'>";
					pageStr += "			<h1 style='color:white'>View Accounts</h1>";

				let newData = JSON.parse(data);
				console.log("Accounts");
				for(let i=0; i<(newData.users.length); i++) {
					for (let j = 0; j<(newData.users[i].accounts.length); j++){
						if(newData.users[i].id === currentUser){
							console.log(newData.users[i].accounts[j]);
							pageStr += "<label for='Account Name' style='color:white'>Account Name   " + newData.users[i].accounts[j].name + " </label><br>";
							pageStr += "<label for='Account Type' style='color:white'>Account Type   " + newData.users[i].accounts[j].type + " </label><br>";
							pageStr += "<label for='Account Balance' style='color:white'>Account Balance   " + "$" + newData.users[i].accounts[j].initialBalance + " </label><br><br>";
						}
					}
				}	

					pageStr += " 			<a href='/'>Return to Homepage</a><br>";
					pageStr += "		</form>";
					pageStr	+= "	</body>";
					pageStr == "</html>";

				res.send(pageStr);
			}
		});	
	
});

app.get("/Deposit", function(req, res){
	let currentUser = req.session.userid;
	let userIndex = req.session.userIndex;

	fs.readFile('users.json', (err, data) => {
		if (err) throw err;
		else {
			let pageStr  = "<!DOCTYPE html>"
				pageStr += "<html>"
				pageStr += "	<head>"
				pageStr += "		<title>Deposit</title>"
				pageStr += "		<link rel='stylesheet' type='text/css' href='css/bootstrap.min.css'>";
				pageStr += "	<script>"
				pageStr += "		function checkAmount(form){"
				pageStr += "			amount = form.deposit.value;"
				pageStr += "			if (amount < 0 || amount > 9999) {"
				pageStr += "				alert('\nPlease enter an amount between 0 and 9999 dollars. ')"
				pageStr += "				return false;"
				pageStr += "			}"
				pageStr += "			else{"
				pageStr += "				return true;"
				pageStr += "			}"
				pageStr += "		}"
				pageStr += "	</script>"
				pageStr += "	</head>"
				pageStr += "		<body style = 'background: url(https://download.hipwallpaper.com/desktop/1920/1080/39/73/6mVEKW.jpg)'>"
				pageStr += "			<div>"
				pageStr += "				<form action= '/Deposit' method= 'POST' onsubmit= 'return checkAmount()''>"
				pageStr += "					<div class= 'container'>"
				pageStr += "						<h1 style='color:white'>Deposit</h1><br><br>"
				pageStr += "						<p style='color:white'>Please select an account.</p>"
				pageStr += "							<div class= 'accounts'>"
				pageStr += "								<select name = 'Account' placeholder='Account' required>"

				let newData = JSON.parse(data);

				for(let i=0; i<newData.users[userIndex].accounts.length; i++)
				{
					pageStr += "<option>" + newData.users[userIndex].accounts[i].name + "</option>";
				}

				pageStr += "								</select>"
				pageStr += "							</div>"
				pageStr += "						<br>"
				pageStr += "						<br>"
				pageStr += "						<p style='color:white'>Please enter the amount of the deposit.</p>"
				pageStr += "					<div class= 'amount' style ='color:white'>"
				pageStr += "						<input type='number' id= 'deposit' name='withdraw' min= '0' max='9999' value= '' required>"
				pageStr += "						<br>"
				pageStr += "						<br>"
				pageStr += "					</div>"
				pageStr += "					<div class = submit'>"
				pageStr += "						<input type='submit' id= 'confirm' name='done' value= 'Confirm'>"
				pageStr += "					</div>"
				pageStr += "					</div>"
				pageStr += "				</form>"
				pageStr += "			</div>"
				pageStr += "		<a href='/'>Return to Homepage</a>"
				pageStr += "		</body>"
				pageStr += "</html>"	

			res.send(pageStr);
		}
		
	});

});

app.post("/Deposit", function(req, res){
	let currentUser = req.session.userid;
	let userIndex = req.session.userIndex;

	fs.readFile('users.json', (err, data) => {
		if (err) throw err;
		else {
			let newData = JSON.parse(data);

			let accountName = xssFilters.inHTMLData(req.body.Account);
			let amount = xssFilters.inHTMLData(req.body.withdraw);
			parseInt(amount);

			if(amount === NaN || amount===Infinity || amount<=0)
			{
				res.send("Invalid amount selected!");
				return;
			}

			for(let i=0; i<newData.users[userIndex].accounts.length; i++)
			{
				if(accountName === newData.users[userIndex].accounts[i].name)
				{
					parseInt(newData.users[userIndex].accounts[i].initialBalance)+=amount;
				}
			}

			fs.writeFile('users.json', JSON.stringify(newData), (err) => {
				if (err) throw err;
				res.send("Success!<br><a href='/Deposit'>Deposit again.</a><br><a href='/'>Return to Homepage</a><br><br>");

			});
		}
	});
});



app.get("/Withdraw", function(req, res){
	let currentUser = req.session.userid;
	let userIndex = req.session.userIndex;

	fs.readFile('users.json', (err, data) => {
		if (err) throw err;
		else {
			let pageStr  = "<!DOCTYPE html>"
				pageStr += "<html>"
				pageStr += "	<head>"
				pageStr += "		<title>Withdraw</title>"
				pageStr += "		<link rel='stylesheet' type='text/css' href='css/bootstrap.min.css'>";
				pageStr += "	<script>"
				pageStr += "		function checkAmount(form){"
				pageStr += "			amount = form.withdraw.value;"
				pageStr += "			if (amount < 0 || amount > 9999) {"
				pageStr += "				alert('\nPlease enter an amount between 0 and 9999 dollars. ')"
				pageStr += "				return false;"
				pageStr += "			}"
				pageStr += "			else{"
				pageStr += "				return true;"
				pageStr += "			}"
				pageStr += "		}"
				pageStr += "	</script>"
				pageStr += "	</head>"
				pageStr += "		<body style = 'background: url(https://download.hipwallpaper.com/desktop/1920/1080/39/73/6mVEKW.jpg)'>"
				pageStr += "			<div>"
				pageStr += "				<form action= '/Withdraw' method= 'POST' onsubmit= 'return checkAmount()''>"
				pageStr += "					<div class= 'container'>"
				pageStr += "						<h1 style='color:white'>Withdraw</h1><br><br>"
				pageStr += "						<p style='color:white'>Please select an account.</p>"
				pageStr += "							<div class= 'accounts'>"
				pageStr += "								<select name = 'Account' placeholder='Account' required>"

				let newData = JSON.parse(data);

				for(let i=0; i<newData.users[userIndex].accounts.length; i++)
				{
					pageStr += "<option>" + newData.users[userIndex].accounts[i].name + "</option>";
				}

				pageStr += "								</select>"
				pageStr += "							</div>"
				pageStr += "						<br>"
				pageStr += "						<br>"
				pageStr += "						<p style='color:white'>Please enter the amount of the withdraw.</p>"
				pageStr += "					<div class= 'amount' style ='color:white'>"
				pageStr += "						<input type='number' id= 'deposit' name='withdraw' min= '0' max='9999' value= '' required>"
				pageStr += "						<br>"
				pageStr += "						<br>"
				pageStr += "					</div>"
				pageStr += "					<div class = submit'>"
				pageStr += "						<input type='submit' id= 'confirm' name='done' value= 'Confirm'>"
				pageStr += "					</div>"
				pageStr += "					</div>"
				pageStr += "				</form>"
				pageStr += "			</div>"
				pageStr += "		<a href='/'>Return to Homepage</a>"
				pageStr += "		</body>"
				pageStr += "</html>"	

			res.send(pageStr);
		}
		
	});

});

app.post("/Withdraw", function(req, res){
	let currentUser = req.session.userid;
	let userIndex = req.session.userIndex;

	fs.readFile('users.json', (err, data) => {
		if (err) throw err;
		else {
			let newData = JSON.parse(data);

			let accountName = xssFilters.inHTMLData(req.body.Account);
			let amount = xssFilters.inHTMLData(req.body.withdraw);
			let currentBalance = newData.users[userIndex].accounts.initialBalance;

			if(amount === NaN || amount===Infinity || amount<=0 || (currentBalance-amount < 0))
			{
				res.send("Invalid amount selected!");
				return;
			}
			parseInt(amount);

			for(let i=0; i<newData.users[userIndex].accounts.length; i++)
			{
				if(accountName === newData.users[userIndex].accounts[i].name)
				{
					newData.users[userIndex].accounts[i].initialBalance-=amount;
				}
			}

			fs.writeFile('users.json', JSON.stringify(newData), (err) => {
				if (err) throw err;
				res.send("Success!<br><a href='/Withdraw'>Withdraw again.</a><br><a href='/'>Return to Homepage</a><br><br>");

			});
		}
	});
});



app.get("/Transfer", function(req, res){
	let currentUser = req.session.userid;
	let userIndex = req.session.userIndex;

	fs.readFile('users.json', (err, data) => {
		if (err) throw err;
		else {
			let pageStr  = "<!DOCTYPE html>"
				pageStr += "<html>"
				pageStr += "	<head>"
				pageStr += "		<title>Transfer</title>"
				pageStr += "		<link rel='stylesheet' type='text/css' href='css/bootstrap.min.css'>";
				pageStr += "	<script>"
				pageStr += "		function checkAmount(form){"
				pageStr += "			amount = form.transfer.value;"
				pageStr += "			if (amount < 0 || amount > 9999) {"
				pageStr += "				alert('\nPlease enter an amount between 0 and 9999 dollars. ')"
				pageStr += "				return false;"
				pageStr += "			}"
				pageStr += "			else{"
				pageStr += "				return true;"
				pageStr += "			}"
				pageStr += "		}"
				pageStr += "	</script>"
				pageStr += "	</head>"
				pageStr += "		<body style = 'background: url(https://download.hipwallpaper.com/desktop/1920/1080/39/73/6mVEKW.jpg)'>"
				pageStr += "			<div>"
				pageStr += "				<form action= '/Transfer' method= 'POST' onsubmit= 'return checkAmount()'>"
				pageStr += "					<div class= 'container'>"
				pageStr += "						<h1 style='color:white'>Transfer</h1><br><br>"
				pageStr += "						<p style='color:white'>Please select From account.</p>"
				pageStr += "							<div class= 'accountsFROM'>"
				pageStr += "								<select name = 'AccountFROM' placeholder='Account' required>"

				let newData = JSON.parse(data);

				for(let i=0; i<newData.users[userIndex].accounts.length; i++)
				{
					pageStr += "<option>" + newData.users[userIndex].accounts[i].name + "</option>";
				}

				pageStr += "								</select>"
				pageStr += "							</div>"
				pageStr += "						<p style='color:white'>Please select TO account.</p>"
				pageStr += "							<div class= 'accountsTo'>"
				pageStr += "								<select name = 'AccountTO' placeholder='Account' required>"


				for(let i=0; i<newData.users[userIndex].accounts.length; i++)
				{
					pageStr += "<option>" + newData.users[userIndex].accounts[i].name + "</option>";
				}

				pageStr += "								</select>"
				pageStr += "							</div>"
				pageStr += "						<br>"
				pageStr += "						<br>"
				pageStr += "						<p style='color:white'>Please enter the amount of the transfer.</p>"
				pageStr += "					<div class= 'amount' style ='color:white'>"
				pageStr += "						<input type='number' id= 'deposit' name='transfer' min= '0' max='9999' value= '' required>"
				pageStr += "						<br>"
				pageStr += "						<br>"
				pageStr += "					</div>"
				pageStr += "					<div class = submit'>"
				pageStr += "						<input type='submit' id= 'confirm' name='done' value= 'Confirm'>"
				pageStr += "					</div>"
				pageStr += "					</div>"
				pageStr += "				</form>"
				pageStr += "			</div>"
				pageStr += "		<a href='/'>Return to Homepage</a>"
				pageStr += "		</body>"
				pageStr += "</html>"	

			res.send(pageStr);
		}
		
	});

});




app.post("/Transfer", function(req, res){
	let currentUser = req.session.userid;
	let userIndex = req.session.userIndex;

	fs.readFile('users.json', (err, data) => {
		if (err) throw err;
		else {
			let newData = JSON.parse(data);

			let accountNameFrom = xssFilters.inHTMLData(req.body.AccountFROM);
			let accountNameTo = xssFilters.inHTMLData(req.body.AccountTO);
			let amount = xssFilters.inHTMLData(req.body.transfer);
			let currentBalance = newData.users[userIndex].accounts.initialBalance;

			if(amount === NaN || amount===Infinity || amount<=0)
			{
				res.send("Invalid amount selected!");
				return;
			}
			parseInt(amount);

			for(let i=0; i<newData.users[userIndex].accounts.length; i++)
			{
				for (let j=0; j<newData.users[userIndex].accounts.length; j++)
				{
					if(accountNameFrom === newData.users[userIndex].accounts[i].name && accountNameTo === newData.users[userIndex].accounts[j].name)
					{

						newData.users[userIndex].accounts[i].initialBalance-=amount;
						newData.users[userIndex].accounts[j].initialBalance+=amount;
					}	
				}
			}

			fs.writeFile('users.json', JSON.stringify(newData), (err) => {
				if (err) throw err;
				res.send("Success!<br><a href='/Transfer'>Transfer again.</a><br><a href='/'>Return to Homepage</a><br><br>");

			});
		}
	});;
});

//For this I (Drew) was thinking of appending the user's account name 
//and account type (checking/savings) at the end of their username and password

//this is all I have for now
app.get("/OpenNewAccount", function(req, res){
	res.sendFile(__dirname+"/newaccount.html");
});

app.post("/OpenNewAccount", function(req, res){

	let currentUser = req.session.userid;
	let name = xssFilters.inHTMLData(req.body.accountName);
	let type = xssFilters.inHTMLData(req.body.accountType);
	let initialBalance = xssFilters.inHTMLData(req.body.initialBalance);
	parseInt(initialBalance);
	let filePath = __dirname+"/users.json"


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
				newData.users[i].accounts.push({ "name": name, "type": type, "initialBalance": initialBalance });
				//newData.users[i].accounts.push({ "name": name, "type": type, "initialBalance": initialBalance });
				fs.writeFile('./users.json', (JSON.stringify(newData)), (err) => {
					if (err) throw err;
				});
			}
		}
		
	});


	res.send("Account Registerd!<br><a href='/OpenNewAccount'>Add Another Account</a><br><a href='/'>Return to Homepage</a><br><br>");
});


app.get("/RemoveAccount", function(req,res){
	let currentUser = req.session.userid;
	let userIndex = req.session.userIndex;

	fs.readFile('users.json', (err, data) => {
		if (err) throw err;
		else {
			let pageStr  = "<!DOCTYPE html>"
				pageStr += "<html>"
				pageStr += "	<head>"
				pageStr += "		<title>RemoveAccount</title>"
				pageStr += "		<link rel='stylesheet' type='text/css' href='css/bootstrap.min.css'>";
				pageStr += "	</head>"
				pageStr += "		<body style = 'background: url(https://download.hipwallpaper.com/desktop/1920/1080/39/73/6mVEKW.jpg)'>"
				pageStr += "			<div>"
				pageStr += "				<form action= '/RemoveAccount' method= 'POST'>"
				pageStr += "					<div class= 'container'>"
				pageStr += "						<h1 style='color:white'>Remove Account</h1><br><br>"
				pageStr += "						<p style='color:white'>Please select account to DELETE.</p>"
				pageStr += "							<div class= 'accounts'>"
				pageStr += "								<select name = 'accountDELETE' placeholder='Account' required>"

				let newData = JSON.parse(data);

				for(let i=0; i<newData.users[userIndex].accounts.length; i++)
				{
					pageStr += "<option>" + newData.users[userIndex].accounts[i].name + "</option>";
				}

				pageStr += "								</select>"
				pageStr += "							</div>"
				pageStr += "						<br>"
				pageStr += "						<br>"
				pageStr += "						<br>"
				pageStr += "						<br>"
				pageStr += "					</div>"
				pageStr += "					<div class = submit'>"
				pageStr += "						<input type='submit' id= 'confirm' name='done' value= 'Delete'>"
				pageStr += "					</div>"
				pageStr += "					</div>"
				pageStr += "				</form>"
				pageStr += "			</div>"
				pageStr += "		<a href='/'>Return to Homepage</a>"
				pageStr += "		</body>"
				pageStr += "</html>"	

			res.send(pageStr);
		}
	});

});




app.post("/RemoveAccount", function(req, res){
	let currentUser = req.session.userid;
	let userIndex = req.session.userIndex;
	let name = xssFilters.inHTMLData(req.body.accountDELETE);


	fs.readFile('users.json', (err, data) => {
		if (err) throw err;

		let newData = JSON.parse(data);
		// iterate through each index (in this case through each user)
		// and append their account info
		// check which user is logged on and append the info to that account
		for(let i=0; i<(newData.users.length); i++) {
			if(newData.users[i].id === currentUser){
				for(let i=0; i<newData.users[userIndex].accounts.length; i++) {
					if(name === newData.users[userIndex].accounts[i].name) {
						newData.users[userIndex].accounts.splice(i, 1);

						fs.writeFile('./users.json', (JSON.stringify(newData)), (err) => {
							if (err) throw err;
						});
					}
				}	
			}
			
		}
	});
	res.send("Delete Successful<br><a href='/RemoveAccount'>Remove Another Account</a><br><a href='/'>Return to Homepage</a><br><br>")
});

//======================================================================



app.get("/bank", function(req,res){
	res.sendFile(__dirname+"/bank.html");
});



app.get("/register", function(req, res){
	res.sendFile(__dirname+"/register.html");
});

app.post("/register", function(req, res){
	let username = xssFilters.inHTMLData(req.body.username);
	let password1 = xssFilters.inHTMLData(req.body.password1);
	let password2 = xssFilters.inHTMLData(req.body.password2);
	
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
		if(error)
		{
			console.log(error);
			return;
		}

		let newData = JSON.parse(data);

		for(let i=0; i<(newData.users.length); i++)
		{
			if(newData.users[i].id === xssFilters.inHTMLData(req.body.userid) && newData.users[i].password===xssFilters.inHTMLData(req.body.password))
			{
				console.log("Authenticated!");

				//	Set the cookie session
				req.session.userid=newData.users[i].id;
				req.session.userIndex = i;

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
