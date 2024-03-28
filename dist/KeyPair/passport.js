import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../database_operations/userSchema.js';
import { Strategy, ExtractJwt } from 'passport-jwt';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToKey = path.join(__dirname, '.', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};
const strategy = new Strategy(options, (payload, done) => {
    User.findOne({ _id: payload.sub })
        .then((user) => {
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    })
        .catch(err => done(err, null));
});
export default (passport) => {
    passport.use(strategy);
};
