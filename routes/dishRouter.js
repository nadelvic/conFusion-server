const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

// get route with no restrictions
// post, put, delete have restrictions with authentification ( jwt )

dishRouter.route('/') // declaring the end point one single location
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
	Dishes.find({})
		.populate('comments.author')
		.then((dishes) => {
			res.StatusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dishes);
		}, (err) => next(err))
		.catch((err) => next(err));
})
// we first execute authenticate middleware. If authentification is successfull
// then we can proceed for the next function.
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	Dishes.create(req.body)
		.then((dish) => {
			console.log('Dish Created ', dish);
			res.StatusCode = 200;
			res.setHeader('Content-type', 'application/json');
			res.json(dish);
		}, (err) => next(err))
		.catch((err) => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	res.statusCode = 403; // not supported status code.
	res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	Dishes.remove({})
		.then((resp) => {
			res.StatusCode = 200;
			res.setHeader('Content-type', 'application/json');
			res.json(resp);
		}, (err) => next(err))
		.catch((err) => next(err));
});


dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish) => {
		res.StatusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req,res,next) => {
	res.statusCode = 403; // not supported status code.
	res.end('POST operations not supported on /dishes/' + req.params.dishId);

})
.put(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req,res,next) => {
	Dishes.findByIdAndUpdate(req.params.dishId, {
		$set: req.body
	}, {new: true})
	.then((dish) => {
		res.StatusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(dish);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser,  authenticate.verifyAdmin, (req,res,next) => {
	Dishes.findByIdAndRemove(req.params.dishId)
		.then((resp) => {
			res.StatusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});


dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish) => {
		if(dish != null){
			res.StatusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish.comments);
		} else {
			err = new Error('Dish ' + req.params.dishId + 'not found');
			err.status = 404;
			return next(err);
		}		
	}, (err) => next(err))
	.catch((err) => next(err));
})
// can be done by logged in users.
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
	Dishes.findById(req.params.dishId)
	.then((dish) => {
		if (dish != null){	
			// here we get the author information, the authenticate user load user information in
			// the form of req.user. Thus we can assign the user id to the body.author field.
			req.body.author = req.user._id;
			dish.comments.push(req.body);
			dish.save()
			.then((dish) => {
				// we receive the updated dish here
				Dishes.findById(dish._id)
					// I need to populate with the comment before sending the result.
					.populate('comments.author')
					.then((dish) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish);
					})				
			})
		} else {
			err = new Error('Dish ' + req.params.dishId + ' not found');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
})
// for the moment a verified user can delete any comment. This will change.
// it should be only done by the author of the comment.
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
	Dishes.findByIdAndRemove(req.params.dishId)
	.then((dish) => {
		if(dish != null) {
			for (var i= (dish.comments.length -1); i>=0; i++){
				var authorId = dish.comments.id(dish.comments[i]._id).author._id;
				var userId = req.user._id;
				if(authorId === userId){
					dish.comments.id(dish.comments[i]._id).remove();		
				}
				else{
					err = new Error("You are not authorized to delete the comment : " + dish.comments[i].comment);
					err.status = 403;
					return next(err);
				}			
			}
			dish.save()
			.then((dish) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(dish);
			}, (err) => next(err))
		} else {
			err = new Error('Dish ' + req.params.dishId + ' not found');
			err.status = 404;
			return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
});

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish) => {
		if(dish != null && dish.comments.id(req.params.commentId) != null){
			res.StatusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(dish.comments.id(req.params.commentId));
		} else if (dish == null) {
			err = new Error('Dish ' + req.params.dishId + 'not found');
			err.status = 404;
			return next(err);
		} else {
			err = new Error('Comment ' + req.params.commentId + 'not found');
			err.status = 404;
			return next(err);
		}		
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next) => {
	res.statusCode = 403; // not supported status code.
	res.end('POST operations not supported on /dishes/' + req.params.dishId
	+ '/comments/' + req.params.commentId);

})
// only for the author.
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
	Dishes.findById(req.params.dishId)
	.then((dish) => {
		if(dish != null && dish.comments.id(req.params.commentId) != null){
			console.log('author Id : ' + dish.comments.id(req.params.commentId).author);
			console.log('User Id : ' + req.user._id);
			if(dish.comments.id(req.params.commentId).author.equals(req.user._id)){
				
				if(req.body.rating){
					dish.comments.id(req.params.commentId).rating = req.body.rating;
				}
				if(req.body.comment){
					dish.comments.id(req.params.commentId).comment = req.body.comment
				}
				dish.save()
				.then((dish) => {
					Dishes.findById(dish._id)
					.populate('comments.author')
					.then((dish) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish);
					});
				}, (err) => next(err))
			}
			else {
				err = new Error('You are not authorized to modify this comment');
				err.status = 403;
				return next(err);
			}
			
		} else if (dish == null) {
			err = new Error('Dish ' + req.params.dishId + 'not found');
			err.status = 404;
			return next(err);
		} else {
			err = new Error('Comment ' + req.params.commentId + 'not found');
			err.status = 404;
			return next(err);
		}		
	}, (err) => next(err))
	.catch((err) => next(err));
})
// here the deletion right should be more restricted, to the comment creator.
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
	Dishes.findById(req.params.dishId)
	.then((dish) => {
		if(dish != null && dish.comments.id(req.params.commentId) != null) {
			if(dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
				dish.comments.id(req.params.commentId).remove();
				dish.save()
				.then((dish) => {
					Dishes.findById(dish._id)
					.populate('comments.author')
					.then((dish) => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish);
					});
				}, (err) => next(err))	
			}
			else {
				err = new Error('You are not authorized to delete this comment');
				err.status = 403;
				return next(err);
			}	
		} else if (dish == null) {
			err = new Error('Dish ' + req.params.dishId + 'not found');
			err.status = 404;
			return next(err);
		} else {
			err = new Error('Comment ' + req.params.commentId + 'not found');
			err.status = 404;
			return next(err);
		}	
	}, (err) => next(err))
	.catch((err) => next(err));
});

module.exports = dishRouter;