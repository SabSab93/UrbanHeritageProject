"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptional = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET;
function authOptional(req, res, next) {
    var _a;
    const auth = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (auth) {
        try {
            // si le token est valide, on le pose dans req.decoded
            const payload = jsonwebtoken_1.default.verify(auth, SECRET);
            req.decoded = payload;
        }
        catch (err) {
            // token invalide → on l'ignore, pas de blocage
            console.warn('authOptional: token invalide, on continue en invité');
        }
    }
    // si pas de header, on ne fait rien, on continue en invité
    next();
}
exports.authOptional = authOptional;
