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
import uploadRouter from "./routes/upload.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/upload", uploadRouter);

export { app };
