/* library imports */
const express = require('express');

/* project imports */
const constants = require('./constants');
const database = require('./database');
const APIResponse = require('./apiresponse').APIResponse;

/* initialize express application */
const app = express();
const PORT = constants.EXPRESS_PORT;

app.use(express.json());

/* endpoints */

// /hw7?club=CLUB&pos=POS
app.post('/hw7', async(req, res) => {
    let response = new APIResponse();
    let club = req.query.club;
    let pos = req.query.pos;

    if (club == undefined || pos == undefined){
        response.error = constants.ERR_MISSING_PARAMS;
        return res.json(response.toOBJ());
    }

    let star_player = await database.getStarPlayer(club, pos);
    console.log(star_player);

    return res.json(star_player);
    // response.club = star_player[constants.CLUB_KEY];
    // response.pos = star_player[constants.POS_KEY];
    // response.max_assists = star_player[constants.MAX_ASSISTS_KEY];
    // response.player = star_player[constants.PLAYER_KEY];
    // response.avg_assists = star_player[constants.AVG_ASSISTS_KEY];

    // return res.json(response.toOBJ());
});

/* Start the server. */
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
