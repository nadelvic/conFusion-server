const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-type','text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will get all the the leaders.');

})
.post((req,res,next) => {
    res.end('Will add the leader : ' + req.body.name + ' with the details: ' + req.body.description);
})
.put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operations not supported on /leaders');
})
.delete((req,res,next) => {
    res.end('Will delete all the leaders.');

});


leaderRouter.route('/:leaderId')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-type','text/plain');
    next();

})
.get((req,res,next) => {
    res.end('Will get the leader: ' + req.params.leaderId);

})
.post((req,res,next)=> {
    res.statusCode = 403;
    res.end('POST operation is not supported on /leader/' + req.params.leaderId);

})
.put((req,res,next) => {
    res.write('Updating the leader: ' + req.params.leaderId + '\n');
    res.end('Update the leader ' + req.body.name + ' with the details: ' + req.body.description);

})
.delete((req,res,next) => {
    res.end('Will delete the leader: ' + req.params.leaderId);
});

module.exports = leaderRouter;