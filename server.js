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

//determining OS for file operations
var fileSlash;
if(process.platform === "win32")
	fileSlash = "\\";
else
	fileSlash = "/";





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

var thisGame = {id:undefined, players:[], votes:[0,0], cia:undefined, round:undefined};
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

function newGame(){
    thisGame = {id:undefined, players:[], votes:[0,0,0,0,0], cia:undefined, round:undefined, voted:[]};
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
        // console.log("should send to: " + req.query.name);
        readyUsers.shift();
        res.json({success:'success', id:thisGame.id, players:thisGame.players, votes:thisGame.votes, cia:thisGame.cia, round:thisGame.round});
        runningGames.push(thisGame);
        console.log('game pushed: ' + thisGame.id + runningGames.length);
    }
    else {
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
            console.log('found it')
            gameById = runningGames[i];
        }
    }
    var round = gameById.round;
    if(round%2 == 0){
        gameById.players.splice(theirVote, 1);
        gameById.round++;
    }else {
        console.log(gameById);
        //gameById.voted.push(req.query.screenName);
        gameById.votes[theirVote]++;
        if(gameById.voted == gameById.players) {
            for(var i in gameById.votes){
                if((10*i)/players.length > 5){
                    gameById.players.splice(i, 1);
                }
            }
            gameById.votes = []
            for(p in gameById.players){
                gameById.votes.push(0);
            }
            voted = [];
        }
    }
    console.log(gameById)
});

app.get('/round', function (req, res) {
    var idNum = req.query.gameID;
    for (var i = 0; i < runningGames.length; i++){
        if(runningGames[i].id == idNum){
            gameById = runningGames[i];
            break;
        }
    }
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
    chat += '<p>' + req.query.user + ': ' + req.query.message + '</p>'
});