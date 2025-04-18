
import express from "express"
import home from "./routes/home.js"
import connectDb from "./models/config.js"
import compoundRouter from "./routers/compound.router.js"
import apartmentRouter from "./routers/apartment.router.js"
import userRouter from "./routers/user.router.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import fs from "fs"
// Middlewares
const app = express();
app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ limit: "1gb", extended: true }));
app.use(cors({ 
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
['uploads/images', 'uploads/videos', 'uploads/pdfs'].forEach((folder) => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }
});
app.use('/uploads', express.static('uploads'));

app.use(cookieParser())
app.use("/home", home);
app.use("/compound", compoundRouter);
app.use("/apartment", apartmentRouter); 
app.use("/user", userRouter);
// Routes
connectDb()
// connection
const port = process.env.PORT || 5000;
app.listen(port,"0.0.0.0", () => console.log(`Listening to port ${port}`));

