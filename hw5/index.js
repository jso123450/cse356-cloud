/* library imports */
const express = require('express');
const multer = require('multer');
const cassandra = require('cassandra-driver');

/* project imports */
const constants = require('./constants');

/* initialize libraries */
var upload = multer();
var client = new cassandra.Client({ contactPoints: [constants.LOCALHOST + ':' + constants.CASSANDRA_PORT], 
                                    localDataCenter: constants.CASSANDRA_DATACENTER, 
                                    keyspace: constants.CASSANDRA_KEYSPACE });
const INSERT_STATEMENT = `INSERT INTO ${constants.CASSANDRA_TABLE} (${constants.KEY_FILENAME}, ${constants.KEY_CONTENTS}, ${constants.KEY_MIMETYPE}) VALUES (?, ?, ?)`;
const SELECT_STATEMENT = `SELECT ${constants.KEY_CONTENTS}, ${constants.KEY_MIMETYPE} FROM ${constants.CASSANDRA_TABLE} WHERE ${constants.KEY_FILENAME} = ?`;

/* initialize express application */
const app = express();
app.use(express.json());

const PORT = constants.EXPRESS_PORT;

/* helper funcs */
function generateOK(){
    let response = {};
    response[constants.STATUS_KEY] = constants.STATUS_OK;
    return response;
}

function generateERR(){
    let response = {};
    response[constants.STATUS_KEY] = constants.STATUS_ERR;
    response[constants.STATUS_ERR] = '';
    return response;
}

/* endpoints */
app.post('/deposit', upload.single(constants.KEY_CONTENTS), async(req, res) => {
    // the file specified as constants.KEY_CONTENTS in the form is in req.file
    let response = generateERR();

    let filename = req.body.filename;
    let file = req.file.buffer;
    let mime = req.file.mimetype;

    console.log(`Received /deposit request with ${filename}, ${mime}`);

    if (filename == undefined || file == undefined || mime == undefined){
        response[constants.STATUS_ERR] = constants.ERR_MISSING_PARAMS;
        return res.json(response);
    }

    const params = [filename, file, mime];
    client.execute(INSERT_STATEMENT, params, { prepare: true})
        .then(result => console.log(`Uploaded ${filename} with mimetype ${mime}`));

    response = generateOK();
    return res.json(response);
});

app.get('/retrieve', async(req, res) => {
    let response = generateERR();

    let filename = req.body.filename;

    console.log(`Received /retrieve request with ${filename}`);

    if (filename == undefined){
        response[constants.STATUS_ERR] = constants.ERR_MISSING_PARAMS;
        return res.json(response);
    }

    const params = [filename];

    let file = undefined;
    let mime = undefined;
    console.log(`${SELECT_STATEMENT}, ${params}`);
    let results = await client.execute(SELECT_STATEMENT, params, {prepare: true});
    file = results[0].contents;
    mime = results[0].mime;

    if (file == undefined || mime == undefined){
        response[constants.STATUS_ERR] = constants.ERR_FILE_DOESNT_EXIST;
        return res.json(response);
    }

    res.contentType(mime);
    res.send(file);
});

/* Start the server. */
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
