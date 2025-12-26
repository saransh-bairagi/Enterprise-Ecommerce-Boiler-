// src/middlewares/auth.js
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../modules/user/user.model"); // adjust path as per your project
const { ERRORS } = require("../core/constants");
const { UserService } = require("../modules/user/user.service");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, JWT_EXPIRES_IN } = require('../config/env');

// auth routes – verify token
const auth = async (req, res, next) => {
    let accessToken;

    // -------------------------------
    // 1. Try Access Token First
    // -------------------------------
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        accessToken = req.headers.authorization.split(" ")[1];
         
        try {
            const decoded = await promisify(jwt.verify)(
                accessToken,
                ACCESS_TOKEN_SECRET
            );

            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ error: ERRORS.PLEASE_LOGIN });
            }

            req.attachedSECRET = { userId: user._id };
           
            return next(); // Access token valid → DONE
        } catch (err) {
            // Token is TAMPERED / INVALID
            if (err.name === "JsonWebTokenError") {
                return res.status(401).json({ error: ERRORS.TEMPERED_TOKEN });
            }

            // Token NOT ACTIVE
            if (err.name === "NotBeforeError") {
                return res.status(401).json({ error: ERRORS.TOKEN_NOT_ACTIVE });
            }

            // Token EXPIRED → go to refresh flow below
            if (err.name !== "TokenExpiredError") {
                return res.status(401).json({ error: ERRORS.UNAUTHORIZED });
            }
            // If expired, continue to refresh token flow
        }
    }

    // -------------------------------
    // 2. ACCESS TOKEN EXPIRED → CHECK REFRESH TOKEN
    // -------------------------------
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: ERRORS.PLEASE_LOGIN });
    }

    try {
        const decodedRefresh = await promisify(jwt.verify)(
            refreshToken,
            REFRESH_TOKEN_SECRET
        );
        const isValidRefreshToken = await UserService.validateRefreshToken(
            decodedRefresh.userId,
            refreshToken
        );
        if (!isValidRefreshToken) {
            return res.status(401).json({ error: ERRORS.PLEASE_LOGIN });
        }
        const user = await UserService.findById(decodedRefresh.userId);
        
        if (!user) {
            return res.status(401).json({ error: "User no longer exists" });
        }

        // -------------------------------
        // 3. Generate NEW ACCESS TOKEN
        // -------------------------------
        const newAccessToken = jwt.sign(
            { userId: user._id },
            ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        // Send new access token in header
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        const generateNewRefreshToken = await UserService.createRefreshToken(
          user._id
        );
        // Send new refresh token in header
        res.cookie("refreshToken", generateNewRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        req.attachedSECRET = { userId: user._id };
        return next(); // Continue request
    } catch (err) {
        return res.status(401).json({
            error: "Session expired or invalid refresh token, login again",
        });
    }
};

// Role-based access
const restrictTo = (...roles) => {
    return async (req, res, next) => {
        if (!req.attachedSECRET.userId) {
            return res.status(403).json({ error: ERRORS.UNAUTHORIZED });
        }
        const USER_ROLE = await User.findById(req.attachedSECRET.userId).select(
            "role"
        );
        if (!roles.includes(req.attachedSECRET.userId.role)) {
            return res.status(403).json({ error: ERRORS.UNAUTHORIZED });
        }
        next();
    };
};

module.exports = { auth, restrictTo };
