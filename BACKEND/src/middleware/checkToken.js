"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monMiddlewareBearer = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const monMiddlewareBearer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fullToken = req.headers.authorization;
        if (!fullToken)
            return res.status(401).send("No token provided");
        const [typeToken, token] = fullToken.split(" ");
        if (typeToken !== "Bearer")
            return res.status(401).send("Invalid token type");
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.token = token;
        req.decoded = decoded;
        next();
    }
    catch (error) {
        return res.status(401).send("Invalid or expired token");
    }
});
exports.monMiddlewareBearer = monMiddlewareBearer;
