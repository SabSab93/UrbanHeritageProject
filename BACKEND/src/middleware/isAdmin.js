"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    if (!req.decoded || typeof req.decoded.id_role !== "number") {
        return res.status(403).json({ message: "Accès refusé" });
    }
    const idRole = req.decoded.id_role;
    if (idRole === 1) {
        next();
    }
    else {
        return res.status(403).json({ message: "Accès réservé aux administrateurs ou système" });
    }
};
exports.isAdmin = isAdmin;
