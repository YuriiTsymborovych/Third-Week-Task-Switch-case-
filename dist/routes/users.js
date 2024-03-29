var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import User from '../database_operations/userSchema.js';
import * as utils from '../lib/utils.js';
const router = Router();
const verifyToken = (req, res, next) => {
    var _a, _b;
    const token = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwtToken) === null || _b === void 0 ? void 0 : _b.token;
    if (token) {
        next();
    }
    else if (req.user) {
        next();
    }
    else {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }
};
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).json({ success: false, msg: "Could not find user" });
        }
        const isValid = utils.validPassword(req.body.password, user.hash, user.salt);
        if (isValid) {
            const tokenObject = utils.issueJWT(user);
            //const refresh = utils.issueRefresh(user);
            //res.cookie('refreshToken', refresh, { httpOnly: true, secure: true });
            res.cookie('jwtToken', tokenObject, { httpOnly: true, secure: true });
            res.status(200).redirect("/add-holiday");
        }
        else {
            console.log("Password entered incorrectly!");
            return res.status(401).json({ success: false, msg: "You entered the wrong password" });
        }
    }
    catch (err) {
        return next(err);
    }
}));
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
        //const refresh = utils.issueRefresh(user);
        res.status(200).redirect("/login");
    })
        .catch(err => next(err));
});
router.post('/logout', (req, res, next) => {
    res.clearCookie('jwtToken');
    res.redirect('/login');
});
// router.post('/refresh', verifyToken, async (req, res, next) => {
//     try {
//         const user = await User.findOne({username: req.body.username});
//
//         if(!user) {
//             return res.status(401).json({success: false, msg: "Could not find user"});
//         }
//
//         const isValid = utils.validPassword(req.body.password, user.hash, user.salt);
//
//         if(isValid){
//             const tokenObject = utils.issueJWT(user);
//             const refresh = utils.issueRefresh(user);
//             res.cookie('refreshToken', refresh, { httpOnly: true, secure: true });
//             res.cookie('jwtToken', tokenObject, { httpOnly: true, secure: true });
//             res.status(200).redirect("/add-holiday");
//         } else {
//             console.log("Password entered incorrectly!");
//             return res.status(401).json({success: false, msg: "You entered the wrong password"});
//         }
//     } catch (err) {
//         return next(err);
//     }
// });
//export default router;
export { router, verifyToken, };
