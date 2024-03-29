const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require("passport");


passport.use(new GoogleStrategy({
    clientID: "17012084038-dl9b9ejksdh7b1phcogas2v359v79cic.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
    if (req.error) {
        return done(req.error);
    }
    return done(null, profile);
}));


passport.serializeUser(function (
    user,done){
    done(null,user)
    console.log("serializeUser")
    console.log(user)
})

passport.deserializeUser(function (user, done) {

    console.log("deserializeUser")
    done(null,user)

});


