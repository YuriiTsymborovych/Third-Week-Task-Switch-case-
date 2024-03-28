import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import User from '../database_operations/userSchema.js';
import * as utils from '../lib/utils.js';

const router = Router();

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.jwtToken?.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }
    next();
};

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res, next) => {
    try {
        const user = await User.findOne({username: req.body.username});

        if(!user) {
            return res.status(401).json({success: false, msg: "Could not find user"});
        }
        
        const isValid = utils.validPassword(req.body.password, user.hash, user.salt);

        if(isValid){
            const tokenObject = utils.issueJWT(user);
            res.cookie('jwtToken', tokenObject, { httpOnly: true, secure: true });
            res.status(200).redirect("/add-holiday");
        } else {
            console.log("Password entered incorrectly!");
            return res.status(401).json({success: false, msg: "You entered the wrong password"});
        }
    } catch (err) {
        return next(err);
    }
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res, next) => {
    const saltHash = utils.genPassword(req.body.password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;
    
    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt,
    });

    newUser.save()
    .then((user) => {
        const jwt = utils.issueJWT(user);
        res.status(200).redirect("/login");
    })
    .catch(err => next(err));
});

router.post('/logout', (req, res, next) => {
    res.clearCookie('jwtToken');
    res.redirect('/login');
});

//export default router;
export {
    router,
    verifyToken,
}