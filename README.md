# CS455-onlinebank

This web application is a secure online banking application developed in express.js. It follows the practices of secure coding OWASP  principles such as filtering against xss attacks, http cookies, CSP headers, and proper escaping and encoding.


##  Packages required:

install using ```npm install <module>```

-express

-xss-filters

-cookie-parser

-body-parser

-express-session

##  How to run

To run it just type ```node onlinebank.js```

## Routes

### /

Sends the user to the login page. The user can login or select register to make an account.

### /OpenNewAccount 

Allows the user to create a new bank account.

### /Withdraw

Allows the user to withdraw money from the specified.

### /Deposit

Allows the user to deposit money into the specified account.

### /Transfer

Allows the user to transfer funds from one bank account to another.

### /RemoveAccount

Allows the user to remove a bank account.

### /logout

Ends the users session and logs them out.

##  Database Format

All data is stored in a json text file called ```users.json```


##  Contributors

Andrew Nomura drew97.nomura@csu.fullerton.edu

Andrew Ta andrewman8798@csu.fullerton.edu

Shane Spangenberg sjs445@csu.fullerton.edu

Tuan Lai tlai23@csu.fullerton.edu
