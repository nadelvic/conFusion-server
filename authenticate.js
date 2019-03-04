var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config');

exports.local = passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user){
    // we supply the payloard of the jwt.
    return jwt.sign(user, config.secretKey,
         {expiresIn: 3600});

}

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

/**
 * Json web strategy passport.
 */
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT Payload " ,jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err) {
                // callback that passport is passing in the strategy object
                return done(err, false); 
            }
            else if(user){
                // user is not null
                return done(null,user); // user from mongodb
            }
            else {
                return done(null,false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});
// we are not really creating session
// to verify the user I use the jwt strategy. this jwt strategy will include
// a token in the header.

exports.verifyAdmin = (req,res,next) => {
    if(req.user.admin){
        next();
    }
    else {
        var err = new Error('You are not authorized to perform this operation');
        err.status = 403;
        return next(err);
    }    
};

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    },
    (accessToken, refreshToken, profile, done ) => {
        User.findOne({facebookId: profile.id}, (err,user) => {
            if(err) {
                return done(err,false);
            }
            if(!err && user !== null){
                return done(null,user);
            }
            else {
                // here we need to create a new user
                user = new User({username: profile.displayName});
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err,user) => {
                    if(err) return done(err,false);
                    else {
                        return done(null, user);
                    }
                });
            }
        })
    }
));

