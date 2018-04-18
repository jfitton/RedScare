var express = require('express');
var path = require('path');
var userField;
var searchingUsers = 0;
var makeGame = "false";
var favicon = require('serve-favicon');
//var favicon = require('serve-favicon');
//var bodyparser = require('body-parser');

var app = express();

        // system
var fileSlash;
if(process.platform === "win32")
	fileSlash = "\\";
else
	fileSlash = "/";


var chat = 'here are some messages\nthis message is not a real message\nenjoy these fake messages';

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


app.get('/loginUser', function (req, res) {
    var valid = true;
    userField = req.query.userField;
    //console.log(userField);
    var passField = req.query.passField;
    //console.log(passField);
    if(valid) {
        res.render('lobby.html',{name:userField});
    } else {
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
        console.log(searchingUsers);
        res.json({allow:'true'});
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