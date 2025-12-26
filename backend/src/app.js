// app.js

const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { apiLimiter, authLimiter } = require("./common middlewares/rateLimiter");
const errorHandler = require("./common middlewares/errorHandler");
const securityMiddleware = require("./common middlewares/security");
const express = require("./loaders/express");

const { ERRORS } = require("./core/constants");

// Common middlewares
const insideRouteSecretAttached =
    require("./common middlewares/insideRouteSecretAttached").insideRouteSecretAttached;


const app = express();
securityMiddleware(app);
// Middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api", apiLimiter);

app.use("/", insideRouteSecretAttached);
// API ROUTE MOUNTING
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
});

module.exports = app;
