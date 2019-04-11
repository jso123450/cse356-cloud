const mysql = require('mysql');
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

function genereateAAQuery(club, pos){
    let query = AVG_ASSISTS_STATEMENT + ` WHERE club=${club} and pos=${pos}`;
    return query;
}

function generateMAQuery(club, pos){
    let query = MAX_ASSISTS_STATEMENT + ` WHERE club=${club} and pos=${pos}`;
    return query;
}

function generateQuery(club, pos, max){
    let query = QUERY_STATEMENT + ` WHERE club=${club} and pos=${pos} and a=${max} ORDER BY gs DESC LIMIT 1`;
    return query;
}

async function getAvgAssists(club, pos){
    let result = null;
    try {
        await cnxn.connect();
        result = await cnxn.query(generateAAQuery(club,pos));
        console.log(result);
    }
    catch(err){
        console.log(err);
    }
    finally {
        await cnxn.end();
    }
    return result[0].aa;
}

async function getMaxAssists(club, pos){
    let result = null;
    try {
        await cnxn.connect();
        result = await cnxn.query(generateMAQuery(club,pos));
        console.log(result);
    }
    catch(err){
        console.log(err);
    }
    finally {
        await cnxn.end();
    }
    return result[0].ma;
}

async function getStarPlayer(club, pos, max_assists){
    let result = null;
    try {
        await cnxn.connect();
        result = await cnxn.query(generateQuery(club,pos,max_assists));
        console.log(result);
    }
    catch(err) {
        console.log(err);
    } 
    finally {
        await cnxn.end();
    }
    return result[0];
}

module.exports = {
    getAvgAssists: getAvgAssists,
    getMaxAssists: getMaxAssists,
    getStarPlayer: getStarPlayer
};