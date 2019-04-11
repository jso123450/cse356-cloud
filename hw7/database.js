const mysql = require('promise-mysql');
const memjs = require('memjs');
const constants = require('./constants');

const config = {
    host: constants.MYSQL_HOST,
    user: constants.MYSQL_USER,
    password: constants.MYSQL_PW,
    database: constants.MYSQL_DB
};

const mc = memjs.Client.create(constants.MEMCACHED_SERVER);

const MAX_ASSISTS_STATEMENT = `SELECT MAX(a) as MA FROM ${constants.MYSQL_TABLE}`
const AVG_ASSISTS_STATEMENT = `SELECT AVG(a) as AA FROM ${constants.MYSQL_TABLE}`;
const QUERY_STATEMENT = `SELECT player, gs FROM ${constants.MYSQL_TABLE}`;

function generateAAQuery(club, pos){
    let query = AVG_ASSISTS_STATEMENT + ` WHERE club='${club}' and pos='${pos}'`;
    return query.replace(/\\"/g, '"');
}

function generateMAQuery(club, pos){
    let query = MAX_ASSISTS_STATEMENT + ` WHERE club='${club}' and pos='${pos}'`;
    return query.replace(/\\"/g, '"');
}

function generateQuery(club, pos, max){
    let query = QUERY_STATEMENT + ` WHERE club='${club}' and pos='${pos}' and a=${max} ORDER BY gs DESC LIMIT 1`;
    return query.replace(/\\"/g, '"');
}

async function getStarPlayer(club, pos){
    let avg_assists = null;
    let max_assists = null;
    let player = null;
    let query = null;
    let cached = false;
    let cnxn;
    return mysql.createConnection(config)
        .then(async function(conn){
            cnxn = conn;
            try {
                avg_assists = await mc.get(`aa,${club},${pos}`);
                cached = true;
            } catch(err){
                console.log(`aa,${club},${pos} not cached`);
            }
            if (cached){
                return avg_assists;
            }
            query = generateAAQuery(club,pos);
            return cnxn.query(query);
        }).then(async function(result){
            if (cached){
                cached = false;
            }
            else {
                avg_assists = result[0]['AA'];
            }

            try {
                await mc.set(`aa,${club},${pos}`, avg_assists);
            } catch (err){
                console.log(`couldn't set aa,${club},${pos}`);
                console.log(err);
            }

            try {
                max_assists = await mc.get(`ma,${club},${pos}`);
                cached = true;
            } catch(err) {
                console.log(`ma,${club},${pos} not cached`)
            }
            if (cached){
                return max_assists;
            }
            query = generateMAQuery(club,pos);
            return cnxn.query(query);
        }).then(async function(result) {
            if (cached){
                cached = false;
            }
            else {
                max_assists = result[0]['MA'];
            }

            try {
                await mc.set(`ma,${club},${pos}`, max_assists);
            } catch (err){
                console.log(`couldn't set ma,${club},${pos}`);
                console.log(err);
            }

            try {
                player = await mc.get(`player,${club},${pos}`);
                cached = true;
            } catch(err){
                console.log(`player,${club},${pos} not cached`)
            }
            if (cached){
                return player;
            }
            query = generateQuery(club,pos,max_assists);
            return cnxn.query(query);
        }).then(async function(result){
            if (cached){
                cached = false;
            }
            else {
                player = result[0]['player'];
            }

            try {
                await mc.set(`player,${club},${pos}`, player);
            } catch (err){
                console.log(`couldn't set ma,${club},${pos}`);
                console.log(err);
            }

            let star_player = {
                [constants.CLUB_KEY]: club,
                [constants.POS_KEY]: pos,
                [constants.MAX_ASSISTS_KEY]: max_assists,
                [constants.PLAYER_KEY]: player,
                [constants.AVG_ASSISTS_KEY]: avg_assists
            };
            cnxn.end();
            return star_player;
        }).catch(function(err){
            console.log(err);
            if (cnxn && cnxn.end) cnxn.end();
        });
}

module.exports = {
    getStarPlayer: getStarPlayer
};