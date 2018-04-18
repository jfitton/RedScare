var express = require('express');
var path = require('path');
var userField;
var searchingUsers = 0;
var makeGame = "false";
var favicon = require('serve-favicon');
//var favicon = require('serve-favicon');
//var bodyparser = require('body-parser');


// load list of users from users.db
//TODO: when writing users to the file, do not include admin
var users = [{username:"ADMIN", password:"yes"}]; 

var fs = require("fs");
console.log('reading users from file...');
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('file.db')
});

lineReader.on('line', function (line) {
    console.log('Line from file:', line);
    //split the line into a array with two elements
    var user_string = line.split(":");
    var user = {username:user_string[0], password:user_string[1]};
    users.push(user);
    
});


var app = express();


//helper functions
function containsObject(obj, list) { //used for verifying logins
    var i;
    for (i = 0; i < list.length; i++) {
        //console.log(list[i]);
        if (JSON.stringify(list[i]) === JSON.stringify(obj)) {
            return true;
        }
    }

    return false;
}

//determining OS for file operations
var fileSlash;
if(process.platform === "win32")
	fileSlash = "\\";
else
	fileSlash = "/";





var chat = '<p>here are some messages</p><p>wazzup???</p><p>this messkhsdfkjhgkhegrage is not a real message</p><p>enjoy these fake' +
    ' messages</p><p>here are some messages</p><p>wazzup???</p><p>this message is not a real message</p><p>enjoy these' +
    ' fake messages</p><p>here are some messages</p><p>wazzup???</p><p>this message is not a real message</p>' +
    '<p>enjoy these fake messages</p>';

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('images'));
app.use(express.static('css'));
app.use(favicon(__dirname + fileSlash + 'images' + fileSlash + 'hammer-sickle-logo-8BA54A789D-seeklogo.com.png'))

// Page requests
app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/login', function (req, res) {
    res.render('login.html');
});

app.get('/newUser', function (req, res) {
    res.render('newUser.html');
});

app.get('/start', function (req, res) {
    console.log('start requested');
    res.render('game.html');
});
// Actions

var players = [];

app.get('/players', function (req, res) {
    res.json({player:players});
});

app.get('/loginUser', function (req, res) {

    //verfiy login 
    var valid = true;
    userField = req.query.userField;
    //console.log(userField);
    var passField = req.query.passField;
    //console.log(passField);
    var combo = {username:userField, password:passField};
    valid = containsObject(combo, users); 
    if(valid) {
        console.log("login succeeded");
        res.render('lobby.html',{name:userField});
    } else {
        console.log("login failed");
        res.render('login.html');
    }
});

app.get('/getuser', function (req, res) {
    res.json({name:userField})
});

app.get('/makeGame', function (req, res) {
    res.json({make: makeGame});
    console.log(searchingUsers);
});

app.get('/findGameFirefox', function (req, res) {
    console.log(searchingUsers);
    if(searchingUsers == 1) {
        makeGame = "true";
    } else if (searchingUsers == 0){
        makeGame = 'false'
    }
    searchingUsers++;
    console.log("find");
});

app.get('/findGameChrome', function (req, res) {
    console.log(searchingUsers);
    if(searchingUsers == 1) {
        makeGame = "true";
    } else if (searchingUsers == 0){
        makeGame = 'false'
    }
    searchingUsers++;
    console.log("find");
    res.end('wtf') //json({test:'plz work'});
});

app.get('/allow', function (req, res) {
    if(searchingUsers > 0) {
        console.log(req.query.name)
        players.push(req.query.name)
        console.log(searchingUsers);
        res.json({allow:'true'});

        console.log(players)

        searchingUsers--;
    }else {
        console.log(searchingUsers);
        res.json({allow:'false'});
    }
});

app.get('/create', function (req, res) {
    userField = req.query.userField;
    console.log(userField);
    var passField = req.query.passField;
    console.log(passField);
    //adding to users
    var combo = {username:userField, password:passField};
    users.push(combo); 
    //writing to file
    fs.appendFile('file.db', userField + ":" + passField + "\n", function (err) {
        if (err) throw err;
        console.log('User added');
    }); 
    res.render('login.html');
});

app.get('/getChat', function (req, res) {
    res.json({messages:chat})
})

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
});

app.get('/help', function (req, res) {
   res.send("Heres the help");
});
