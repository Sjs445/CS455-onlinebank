'use strict'

const express = require("express");
const fs = require("fs");
const app = express();
const cookieParser = require("cookie-parser");


function register(form){

}


// Read from text file of usernames and passwords
function checkLogin(form){
	let form.username = username;
	let form.password = password;

	fs.readFile('../login.txt', (err) => {
		if (err) throw err;
		else {
			if(form.)

		}
	});

}

app.listen(4000);