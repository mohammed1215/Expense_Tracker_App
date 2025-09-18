import { Router, type NextFunction, type Request, type Response } from "express"
import { z } from "zod"
import validator from "validator"
import jwt from "jsonwebtoken"
import { PrismaClient } from "../../generated/prisma/index.js"
import { createToken } from "../utils.js"

const prisma = new PrismaClient()
//datatypes
type registerBody = {
  username: string,
  email: string,
  password: string,
  confirmPassword: string
}

type ENV = {
  DATABASE_URL: string,
  SECRET_JWT_KEY: string,
}

const strongPasswordSchema = z.string({ error: "Not A String" }).min(8, "Must be at least 8 letters").refine(val => validator.isStrongPassword(val, { minLength: 8 }), { error: "Not Strong Password" })

const userSchema = z.object({
  username: z.string({ error: "Must Be String" }),
  email: z.string().email({ error: "Not Valid Email" }),
  password: strongPasswordSchema,
  confirmPassword: z.string()
}).superRefine(({ password, confirmPassword }, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: "custom",
      message: "Password Must Match",
      path: ["confirmPassword"]
    })
  }
})

const loginSchema = userSchema.omit({ username: true, confirmPassword: true })
const authRouter: Router = Router()

authRouter.post('/register', async (req: Request<{}, {}, registerBody>, res: Response, next: NextFunction) => {
  try {

    const { username, email, password, confirmPassword } = req.body

    //validation
    const result = userSchema.safeParse({ username, email, password, confirmPassword })
    if (!result.success) {
      console.log(z.treeifyError(result.error))
      console.log(z.flattenError(result.error))
      return res.status(400).json({ status: 'fail', msg: "bad credintials", errors: z.flattenError(result.error).fieldErrors })
    }

    // check if user exists or not
    const user = await prisma.user.findFirst({ where: { email } })
    if (user) {
      return res.status(409).json({ status: 'fail', msg: "email already exists" })
    }

    //create user
    const newUser = await prisma.user.create({ data: { email, password, username } })

    //jsonwebtoken
    const { accessToken, refreshToken } = createToken({ userId: newUser.id })

    //send refreshtoken as cookie and accesstoken in response
    res.cookie("refreshToken", refreshToken, { maxAge: 5 * 24 * 60 * 60 * 1000, secure: true, sameSite: true, httpOnly: true })

    return res.json({ status: 'success', msg: "user has been registered successfully", accessToken })
  } catch (error) {
    console.error(error)
  }
})

authRouter.post('/login', async (req: Request<{}, {}, Omit<registerBody, "username" | "confirmPassword">>, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  const result = loginSchema.safeParse({ email, password })
  if (!result.success) {
    const errors = z.flattenError(result.error).fieldErrors
    return res.status(400).json({ status: "fail", errors })
  }
  // check if user exists or not
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) {
    return res.status(404).json({ status: 'fail', msg: "email Not Found" })
  }

  //jsonwebtoken
  const { accessToken, refreshToken } = createToken({ userId: user.id })

  //send refreshtoken as cookie and accesstoken in response
  res.cookie("refreshToken", refreshToken, { maxAge: 5 * 24 * 60 * 60 * 1000, secure: true, sameSite: true, httpOnly: true })

  return res.json({ status: 'success', msg: "user has logged in successfully", accessToken })


})



export default authRouter
