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
    let star_player = null;
    let avg_assists = null;
    let max_assists = null;
    let player = null;
    let sp_cache = `sp,${club},${pos}`.toString();
    try {
        star_player = await mc.get(sp_cache);
        star_player = star_player.value;
        if (star_player){
            return star_player.toJSON();
        }
    } catch(err){
        // do nothing
    }
    let query = null;
    let cnxn;
    return mysql.createConnection(config)
        .then(function(conn){
            cnxn = conn;
            query = generateAAQuery(club,pos);
            return cnxn.query(query);
        }).then(function(rows){
            avg_assists = rows[0]['AA'];
            query = generateMAQuery(club,pos);
            return cnxn.query(query);
        }).then(function(rows) {
            max_assists = rows[0]['MA'];
            query = generateQuery(club,pos,max_assists);
            return cnxn.query(query);
        }).then(async function(rows){
            player = rows[0]['player'];
            let result = {
                [constants.CLUB_KEY]: club,
                [constants.POS_KEY]: pos,
                [constants.MAX_ASSISTS_KEY]: max_assists,
                [constants.PLAYER_KEY]: player,
                [constants.AVG_ASSISTS_KEY]: avg_assists
            };
            let cached_data = JSON.stringify(result);
            try {
                await mc.set('sp,' + club + ',' + pos, cached_data, {expires: 6000});
            } catch(err){
                // do nothing
            }
            cnxn.end();
            return result;
        }).catch(function(err){
            console.log(err);
            if (cnxn && cnxn.end) cnxn.end();
        });
}

module.exports = {
    getStarPlayer: getStarPlayer
};