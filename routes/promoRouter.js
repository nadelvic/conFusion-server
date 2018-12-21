const express = require('express');
const bodyParser = require('body-parser');


const promoRouter  = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200 // everything is ok.
    res.setHeader('Content-type','text/plain');
    next();

})
.get((req,res,next) => {
    res.end('Will send all the promotions to you!');
})
.post((req,res,next)=> {
    res.end('Will add the promotion: ' + req.body.name + ' with the details: ' + req.body.description )

})
.put((req,res,next)=> {
    res.statusCode = 403;
    res.end('PUT operations is not supported on /promotion')

})
.delete((req,res,next) => {
    res.end('Delete all promotions');

});

promoRouter.route('/:promoId')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-type','text/plain');
    next();
})
.get((req,res,next) => {
    res.end('Will send the promotion: ' + req.params.promoId + ' to you !');
})
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operations is not supported on /promotion/'+ req.params.promoId);
})
.put((req,res,next) => {
    res.write('Updating the promotion : ' + req.params.promoId + '\n');
    res.end('Will update the promotion '+ req.body.name + ' with the details : ' + req.body.description);

})
.delete((req,res,next) => {
    res.end('Will delete the promotion : ' + req.params.promoId);

});

module.exports = promoRouter;

