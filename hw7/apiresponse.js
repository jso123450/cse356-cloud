const constants = require('./constants');

class APIResponse {

    constructor(){
        this.club = null;
        this.pos = null;
        this.max_assists = null;
        this.player = null;
        this.avg_assists = null;
        this.error = undefined;
    }

    get club(){
        return this._club;
    }

    get pos(){
        return this._pos;
    }

    get max_assists(){
        return this._max_assists;
    }

    get player(){
        return this._player;
    }

    get avg_assists(){
        return this._avg_assists;
    }

    get error(){
        return this._error;
    }

    set club(club){
        this._club = club;
    }

    set pos(pos){
        this._pos = pos;
    }

    set max_assists(ma){
        this._max_assists = ma;
    }

    set player(player){
        this._player = player;
    }

    set avg_assists(aa){
        this._avg_assists = aa;
    }

    set error(err){
        this._error = err;
    }

    toOBJ(){
        if (this.error === undefined){
            return {
                [contants.CLUB_KEY]: this.club,
                [contants.POS_KEY]: this.pos,
                [contants.MAX_ASSISTS_KEY]: this.max_assists,
                [contants.PLAYER_KEY]: this.player,
                [contants.AVG_ASSISTS_KEY]: this.avg_assists
            };
        }
        else {
            return {
                [constants.ERROR_KEY]: this.error
            };
        }
    }
}

module.exports = {
    APIResponse: APIResponse
}