import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import http from "http"
import { Server } from "socket.io"

import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import itemRouter from "./routes/item.routes.js"
import shopRouter from "./routes/shop.routes.js"
import orderRouter from "./routes/order.routes.js"
import { socketHandler } from "./socket.js"

dotenv.config()
const app = express()
const server = http.createServer(app)

const FRONTEND_URL = "http://localhost:3000"

// Socket.io CORS
const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
})

app.set("io", io)

// Express CORS
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","OPTIONS"]
}))

app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter)

socketHandler(io)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    connectDb()
    console.log(`Server running on port ${PORT}`)
})
