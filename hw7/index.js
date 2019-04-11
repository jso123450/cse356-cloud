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
app.get('/hw7', async(req, res) => {
    let response = new APIResponse();
    let club = req.query.club;
    let pos = req.query.pos;

    if (club == undefined || pos == undefined){
        response.error = constants.ERR_MISSING_PARAMS;
        return res.json(response.toOBJ());
    }

    let avg_assists = database.getAvgAssists(club, pos);
    console.log(avg_assists);
    let max_assists = database.getMaxAssists(club, pos);
    console.log(max_assists);
    let star_player = database.getStarPlayer(club, pos, max_assists);
    console.log(star_player);

    response.club = club;
    response.pos = pos;
    response.max_assists = max_assists;
    response.player = star_player;
    response.avg_assists = avg_assists;
    return res.json(response.toOBJ());
});

/* Start the server. */
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
