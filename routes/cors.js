const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000','https://localhost:3443'];
/*
We check to see if the origin belongs to the whitelist.
If so the reply will include the access control origin
*/
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if(whitelist.indexOf(req.header('Origin')) !== -1){
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false }
    }
    callback(null,corsOptions);
}

exports.cors = cors(); // standard cors
exports.corsWithOptions = cors(corsOptionsDelegate); // cors with our option.

