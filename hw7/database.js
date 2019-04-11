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
    let aa_cache = `aa,${club},${pos}`.toString();
    let ma_cache = `ma,${club},${pos}`.toString();
    let player_cache = `player,${club},${pos}`.toString();
    let cnxn;
    return mysql.createConnection(config)
        .then(async function(conn){
            cnxn = conn;
            try {
                avg_assists = await mc.get(aa_cache);
                avg_assists = avg_assists.value;
                if (avg_assists){
                    avg_assists = avg_assists.readDoubleLE(0);
                    //console.log(`found cached ${aa_cache} ${avg_assists}`)
                    cached = true;
                }
            } catch(err){
                //console.log(`${aa_cache} not cached`);
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
                try {
                    let buf = Buffer.allocUnsafe(8);
                    buf.writeDoubleLE(avg_assists);
                    await mc.set('aa,' + club + ',' + pos, buf, {expires: 600});
                    //console.log(`cached ${aa_cache}`);
                } catch (err){
                    //console.log(`couldn't set aa_cache`);
                    //console.log(err);
                }
            }
            //console.log(`avg_assists ${avg_assists}`);

            try {
                max_assists = await mc.get(ma_cache);
                max_assists = max_assists.value;
                if (max_assists){
                    max_assists = max_assists.readUInt16LE(0);
                    //console.log(`found cached ${ma_cache} ${max_assists}`)
                    cached = true;
                }
            } catch(err) {
                //console.log(`${ma_cache} not cached`)
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
                try {
                    let buf = Buffer.allocUnsafe(2);
                    buf.writeUInt16LE(max_assists);
                    await mc.set('ma,' + club + ',' + pos, buf, {expires: 600});
                    //console.log(`cached ${ma_cache}`);
                } catch (err){
                    //console.log(`couldn't set ${ma_cache}`);
                    //console.log(err);
                }
            }
            //console.log(`max_assists ${max_assists}`);

            try {
                player = await mc.get(player_cache);
                player = player.value;
                if (player){
                    player = player.toString();
                    //console.log(`found cached ${player_cache} ${player}`)
                    cached = true;
                }
            } catch(err){
                //console.log(`${player_cache} not cached`)
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
                try {
                    await mc.set('player,' + club + ',' + pos, player, {expires: 600});
                    //console.log(`cached ${player_cache}`);
                } catch (err){
                    //console.log(`couldn't set ${ma_cache}`);
                    //console.log(err);
                }
            }
            //console.log(`player ${player}`);

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
            //console.log(err);
            if (cnxn && cnxn.end) cnxn.end();
        });
}

module.exports = {
    getStarPlayer: getStarPlayer
};