import express from "express";
import cors from "cors";

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(
    express.urlencoded({
        extended: true, // object inside object,
        limit: "16kb",
    })
);
app.use(express.static("public"));

// routes import
import userRouter from "./routes/user.routes.js";
import uploadRouter from "./routes/storage.routes.js";
import loginRouter from "./routes/loginInfo.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/storage", uploadRouter);
app.use("/api/v1/login-info", loginRouter);

export { app };
