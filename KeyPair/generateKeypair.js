"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var crypto_1 = require("crypto");
function genKeyPair() {
    var keyPair = crypto_1.default.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });
    fs_1.default.writeFileSync(process.cwd() + '/id_rsa_pub.pem', keyPair.publicKey);
    fs_1.default.writeFileSync(process.cwd() + '/id_rsa_priv.pem', keyPair.privateKey);
}
genKeyPair();
