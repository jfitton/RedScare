var express = require('express');
var path = require('path');
var userField;
var searchingUsers = 0;
var makeGame = "false";
//var favicon = require('serve-favicon');
//var bodyparser = require('body-parser');

var app = express();
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('images'));
app.use(express.static('css'));

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
});

app.get('/findGame', function (req, res) {
    searchingUsers++;
    console.log("find");
    if(searchingUsers == 2) {
        makeGame = "true";
    }
    res.json('success');
});

app.get('/create', function (req, res) {
    userField = req.query.userField;
    console.log(userField);
    var passField = req.query.passField;
    console.log(passField);
});

var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
});

app.get('/help', function (req, res) {
   res.send("Heres the help");
});