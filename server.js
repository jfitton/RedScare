var express = require('express');
var path = require('path');
var userField;
var searchingUsers = 0;
var makeGame = "false";
var favicon = require('serve-favicon');
//var favicon = require('serve-favicon');
//var bodyparser = require('body-parser');

//determining OS for file operations
var fileSlash;
if(process.platform === "win32")
	fileSlash = "\\";
else
	fileSlash = "/";



//firebase
//you should install firebase-admin for this to work
var firebase = require('firebase-admin');

//gets the private key from a file for database access
var serviceAccount = require(__dirname + fileSlash + "red-scare-firebase-adminsdk-uj34o-a75cb5d905.json");

//makes the inital connection
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://red-scare.firebaseio.com"
});
//connects to fileserver
var db = firebase.database();
//this is the same as "fopen("firedatabase/users", rw);"
//calling this with different names lets you store things in different folders
var ref = db.ref("users");

//sets a guy with username pants to have password also pants


//ref.push({username: "pants", password: "also pants"});


ref.on("child_added", function(snapshot) {
  var newUser = snapshot.val();
  console.log("username: " + newUser.username);
  console.log("password: " + newUser.password);
});


//console.log("query test");
//not needed anymore
/*
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
*/

var app = express();
var gameid = 0;
var games = [];



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






var chat = '<p>Weclome to the chat!</p>';

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
    res.json({player:curGame.players});
});

app.get('/loginUser', function (req, res) {

    //verfiy login 
    var valid = false;
    userField = req.query.userField;
    //console.log(userField);
    var passField = req.query.passField;
    //console.log(passField);
    var combo = {username:userField, password:passField};
  
    
    //search for the username
    ref.orderByChild("username").equalTo(userField).on("child_added", function(snapshot) {

        console.log(snapshot.key);
        //search for the password
    ref.orderByChild("password").equalTo(passField).on("child_added", function(snapshot2) {
            console.log(snapshot2.key);
            if (snapshot.key == snapshot2.key)
                valid = true;
        });

    });


    if(valid) {
        console.log("login succeeded");
        // res.render('lobby.html',{name:userField});
        res.render('gameTest.html');
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

app.get('/gameInfo', function (req, res) {
    console.log('info requested');
    var thisUser = req.query.name;
    var role;
    console.log('info requested by: ' + thisUser);
    console.log(curGame.players[curGame.cia]);
    //res.json({role:'asdf', id:2});
    if(curGame.players[curGame.cia] == thisUser) role = 'CIA';
    else role = 'Communist';
    res.json({role:role, id:curGame.id})
})

var curGame = {id:undefined, players:[], votes:[0,0,0,0,0], cia:undefined};

app.get('/findGameFirefox', function (req, res) {
    console.log(searchingUsers);
    if(searchingUsers == 1) {
        if (curGame.id === undefined) {
            curGame.id = gameid;
            console.log('gameID::' + gameid);
            curGame.cia = Math.floor(Math.random()*2);
            console.log('CIA::' + curGame.cia);
            gameid++;
        }
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
        if (curGame.id === undefined) {
            curGame.id = gameid;
            console.log('gameID::' + gameid);
            curGame.cia = Math.floor(Math.random()*2);
            console.log('CIA::' + curGame.cia);
            gameid++;
        }
        makeGame = "true";
    } else if (searchingUsers == 0){
        curGame.id = undefined;
        curGame.players = [];
        makeGame = 'false'
    }
    searchingUsers++;
    console.log("find; no extra data");
    res.end('ok');
});

app.get('/allow', function (req, res) {
    if(searchingUsers > 0) {
        console.log('allow: ' + req.query.name)
        userField = req.query.name;
        curGame.players.push(req.query.name)
        //console.log(searchingUsers);
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
    //adding to users
    //search for the username
    var newUser = true;
    ref.orderByChild("username").equalTo(userField).on("child_added", function(snapshot) {
        //if you get here then the username is already taken
        newUser = false;  
    });
    //writing to file
    if(newUser)
    {
        ref.push({username: userField, password: passField});
        res.render('login.html');
    }
    else
    {
        res.render('newUser.html'); 
    }
});

app.get('/getChat', function (req, res) {

    var idNum = req.query.id;
    for (var i = 0; i < runningGames.length; i++){
        if(runningGames[i].id == idNum){
            gameById = runningGames[i];
            break;
        }
    }
    // console.log(gameById.chat)
    res.json({messages:gameById.chat})
})

var server = app.listen(process.env.PORT || 8081, function () {
    var host = server.address().address;
    var port = server.address().port;
});

app.get('/help', function (req, res) {
   res.send("Heres the help");
});





var readyUsers = [];

app.get('/game2', function (req, res) {
    res.render('gameTest.html');
});


var gameStartedHTML = '<div class="w3-display-left voteBlock">\n' +
    '    </div>\n' +
    '<div class="mainChat w3-display-right">' +
    '    <div class="chatBox ">\n' +
    '        <div class="w3-middle chatter">\n' +
    '            <p id="chatText"></p>\n' +
    '        </div>' +
    '    </div>' +
    '    <div>' +
    '       <textarea class="textBox" id="messagingArea"></textarea>' +
    '       <button class="textBox sendChat" id="sendButton">Send</button>' +
    '       ' +
    '    </div>' +
    '</div>';

app.get('/gameStart', function (req, res) {
    console.log("requested by " + req.query.name);
    readyUsers.push(req.query.name);
    res.json({html:gameStartedHTML});
});

var thisGame = {id:undefined, players:[], votes:[0,0], cia:undefined, round:undefined, gameOver:false};
var gamId = 0;
var runningGames = [];

function getGame(id) {
    var game;

    var i = 0;
    for(game in runningGames){
        if(game.id == id){
            // do stuff with data
        }
    }
}

function makeNewGame(){
    this.id = gamId;
    this.players = [];
    this.votes = [0,0,0,0,0];
    this.cia = undefined;
    this.round = undefined;
    this.voted = 0;
    this.chat = '<p>Weclome to the chat!</p>';
    this.allVoted = false;
    this.gameOver = false;
    this.timeLastVote = 0;
}

function newGame(){
    thisGame = new makeNewGame();
}


var numplayers = 5;

// If multiple players have same name, game will not run correctly

app.get('/ready', function (req, res) {
    // console.log('someone ready checked');
    // console.log('array length: ' + readyUsers.length)
    // console.log('user[0]: ' + readyUsers[0]);
    // console.log('this games player count: ' + thisGame.players.length);

    if(readyUsers.length >= numplayers && readyUsers[0] == req.query.name && thisGame.players.length == 0){
        newGame();
        console.log('first player')
        thisGame.id = gamId;
        gamId++;
        thisGame.round = 0;
        thisGame.players.push(readyUsers.shift());

        var i;
        for(i = 0; i < numplayers-1; i++) {
            thisGame.players.push(readyUsers[i]);
        }

        // console.log('The next player is: ' + readyUsers[0]);
        thisGame.cia = Math.floor(Math.random()*numplayers);
        // console.log(thisGame.cia);
        res.json({success:'success', id:thisGame.id, players:thisGame.players, votes:thisGame.votes, cia:thisGame.cia});
    } else if (readyUsers[0] == req.query.name && thisGame.players.length == numplayers && thisGame.players.length > 0) {
        console.log('next player')
        console.log('READY USERS:' + readyUsers);
        console.log('NEXT USER: ' + req.query.name);
        console.log('CURRENT NUM PLAYERS: ' + thisGame.players.length);
        // console.log("should send to: " + req.query.name);
        readyUsers.shift();
        res.json({
            success: 'success',
            id: thisGame.id,
            players: thisGame.players,
            votes: thisGame.votes,
            cia: thisGame.cia,
            round: thisGame.round
        });
        if (req.query.name == thisGame.players[numplayers-1]) {
            runningGames.push(thisGame);
            thisGame = new makeNewGame();

            console.log('<----NEW GAME MADE---->')
            console.log('READY USERS:' + readyUsers);
            console.log('NEXT USER: ' + req.query.name);
            console.log('CURRENT NUM PLAYERS: ' + thisGame.players.length);
        }
        console.log('game pushed: ' + thisGame.id + runningGames.length);
    }
    else {
        // console.log('ready failed')
        res.json({success:'fail'});
    }
});

var gameById = "";

app.get('/vote', function (req, res) {
    var theirID = req.query.id;
    var theirVote = req.query.vote;
    for (var i = 0; i < runningGames.length; i++){
        console.log(runningGames[i].id);
        console.log(theirID);
        if(runningGames[i].id == theirID){
            // console.log('found it')
            gameById = runningGames[i];
        }
    }
    var round = gameById.round;
    if(round%2 == 0){
        console.log("CIA ROUND")
        gameById.voted = 0;
        gameById.allVoted = false;
        gameById.players.splice(theirVote, 1);
        if(theirVote < gameById.cia) gameById.cia--;
        gameById.votes.shift();
        gameById.round++;
    }else {
        console.log(gameById);
        gameById.voted++;
        gameById.votes[theirVote]++;
        var playerCount = gameById.players.length;
        if(gameById.voted == gameById.players.length) {
            gameById.allVoted = true;
            console.log('everyone has voted')
            for(let i = 0; i < gameById.votes.length; i++){
                console.log(gameById.players[i] + ' has ' + gameById.votes[i] + ' votes from ' + playerCount + ' players')
                if(((10*gameById.votes[i])/playerCount) > 5){
                    console.log((10*gameById.votes[i])/playerCount);
                    if(i < gameById.cia) gameById.cia--;
                    else if(i == gameById.cia) {
                        gameById.gameOver = true;
                    }
                    gameById.players.splice(i, 1);
                }
            }
            gameById.votes = []
            for(p in gameById.players){
                gameById.votes.push(0);
            }
            voted = [];

            gameById.round++;
        }
    }
    console.log('final: ');
    console.log(gameById);
    let seconds = Math.floor(new Date().getTime() / 1000);
    gameById.timeLastVote = seconds;
    res.json({success:'success'});
});

app.get('/round', function (req, res) {
    var idNum = req.query.id;
    console.log("<---ROUND REQUESTED FOR GAME " + req.query.id + " BY " + req.query.name + "--->")
    for (var i = 0; i < runningGames.length; i++){
        if(runningGames[i].id == idNum){
            gameById = runningGames[i];
            break;
        }
    }
    console.log(gameById.players);
    gameById.voted = 0;
    // gameById.allVoted = false;
    if(gameById.round%2 == 1) {
        res.json({
            success: 'success',
            id: gameById.id,
            players: gameById.players,
            votes: gameById.votes,
            cia: gameById.cia,
            round: gameById.round
        });
    }
    else {
        res.json({success:'fail'});
    }
});

app.get('/sendMessage', function (req, res) {
    console.log('message recieved');
    var idNum = req.query.id;
    for (var i = 0; i < runningGames.length; i++){
        if(runningGames[i].id == idNum){
            gameById = runningGames[i];
            break;
        }
    }

    gameById.chat += '<p>' + req.query.user + ': ' + req.query.message + '</p>'
    res.json({success:'success'});
    console.log(gameById.chat)
});

app.get('/results', function (req, res) {
    // console.log('RESULTS REQUESTED');
    var idNum = req.query.id;
    for (var i = 0; i < runningGames.length; i++){
        if(runningGames[i].id == idNum){
            gameById = runningGames[i];
            break;
        }
    }
    console.log('<----LIST OF GAMES---->');
    console.log('GAME MATCHED: ' + gameById.id + '\nID GIVEN: ' + idNum)
    for (var i = 0; i < runningGames.length; i++) {
        console.log(runningGames[i] + '\n')
    }
        console.log(gameById.voted + "::" + gameById.players.length);
    if(gameById.allVoted) {
        console.log('<----SENDING RESULTS TO ' + req.query.name + '---->');
        console.log(gameById);
        if (gameById.gameOver == false) {
            res.json({success: 'success', players: gameById.players});
        } else {
            res.json({success:'game over'});
        }
    }else {
        let seconds = Math.floor(new Date().getTime() / 1000);
        if((seconds - gameById.timeLastVote) > 60){
            res.json({success:'timedOut'});
        }else {
            res.json({success:'fail'});
        }
    }
});
