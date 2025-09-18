import express from "express"
import authRouter from "./routes/auth.route.js"
import { config } from "dotenv"
import cookieParser from "cookie-parser"

config()
const app = express()

//variables
const port = process.env.PORT || 3000

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
//routes
app.use('/api', authRouter)


app.listen(port, (err) => {
  console.log('server is on port', port)
})