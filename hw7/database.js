const mysql = require('promise-mysql');
const constants = require('./constants');

const cnxn = mysql.createConnection({
    host: constants.MYSQL_HOST,
    user: constants.MYSQL_USER,
    password: constants.MYSQL_PW,
    database: constants.MYSQL_DB
});

const MAX_ASSISTS_STATEMENT = `SELECT MAX(a) as MA FROM ${constants.MYSQL_TABLE};`
const AVG_ASSISTS_STATEMENT = `SELECT AVG(a) as AA FROM ${constants.MYSQL_TABLE}`;
const QUERY_STATEMENT = `SELECT player, gs FROM ${constants.MYSQL_TABLE}`;

function generateAAQuery(club, pos){
    let query = AVG_ASSISTS_STATEMENT + ` WHERE club='${club}' and pos='${pos}'`;
    return query;
}

function generateMAQuery(club, pos){
    let query = MAX_ASSISTS_STATEMENT + ` WHERE club='${club}' and pos='${pos}'`;
    return query;
}

function generateQuery(club, pos, max){
    let query = QUERY_STATEMENT + ` WHERE club='${club}' and pos='${pos}' and a=${max} ORDER BY gs DESC LIMIT 1`;
    return query;
}

async function getStarPlayer(club, pos, max_assists){
    let result = null;
    let avg_assists = null;
    let max_assists = null;
    let player = null;
    cnxn.connect()
        .then(function(smth){
            return cnxn.query(generateAAQuery(club,pos));
        }).then(function(rows){
            console.log(rows);
            avg_assists = rows[0];
            return cnxn.query(generateMAQuery(club,pos));
        }).then(function(rows) {
            console.log(rows);
            max_assists = rows[0];
            return cnxn.query(generateQuery(club,pos,max_assists));
        }).then(function(rows){
            console.log(rows);
            player = rows[0];
            result = {
                [constants.CLUB_KEY]: club,
                [constants.POS_KEY]: pos,
                [constants.MAX_ASSISTS_KEY]: max_assists,
                [constants.PLAYER_KEY]: player,
                [constants.AVG_ASSISTS_KEY]: avg_assists
            };
        }).catch(function(err){
            console.log(err);
        });
    console.log(result);
    return result;
}

module.exports = {
    getStarPlayer: getStarPlayer
};