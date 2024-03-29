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
import jsonwebtoken from 'jsonwebtoken';
import User from '../database_operations/userSchema.js';
import * as utils from '../lib/utils.js';
const router = Router();
function verifyToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const token = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwtToken) === null || _b === void 0 ? void 0 : _b.token;
        //const expiresIn = req.cookies?.jwtToken?.expires;
        //console.log(expiresIn);
        if (token) {
            const [, accessToken] = token.split(' ');
            const decodedToken = jsonwebtoken.decode(accessToken, { complete: true });
            const sub = decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.payload.sub;
            const neededUser = yield User.findOne({ _id: sub });
            if (neededUser) {
                next();
            }
            else {
                console.log('No such user');
            }
        }
        else if (req.user) {
            next();
        }
        else {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }
    });
}
;
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
            const refreshObject = utils.issueRefresh(user);
            res.cookie('jwtToken', tokenObject, { maxAge: 60 * 1000, httpOnly: true, secure: true });
            res.cookie('refreshToken', refreshObject, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true });
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
router.post('/refresh-jwt', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const token = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwtToken) === null || _b === void 0 ? void 0 : _b.token;
        const refreshToken = (_d = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.refreshToken) === null || _d === void 0 ? void 0 : _d.token;
        const [, accessToken] = token.split(' ');
        const decodedToken = jsonwebtoken.decode(accessToken, { complete: true });
        const sub = decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.payload.sub;
        const neededUser = yield User.findOne({ _id: sub });
        console.log(neededUser);
        if (refreshToken) {
            const tokenObject = utils.issueJWT(neededUser);
            res.cookie('jwtToken', tokenObject, { maxAge: 60 * 1000, httpOnly: true, secure: true });
            res.redirect('/add-holiday');
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
