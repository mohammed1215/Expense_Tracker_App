import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"


function createToken(payload: string | object | Buffer<ArrayBufferLike>) {
  if (!process.env.SECRET_JWT_KEY || !process.env.REFRESH_SECRET_JWT_KEY) {
    throw new Error("FATAL ERROR: SECRET_JWT_KEY or REFRESH_SECRET_JWT_KEY is not defined in .env file")
  }
  const accessToken = jwt.sign(payload, process.env.SECRET_JWT_KEY, { expiresIn: '1h' })
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_JWT_KEY, { expiresIn: '5d' })

  return { accessToken, refreshToken }
}

function isAuth(req: Request, res: Response, next: NextFunction) {
  try {

    const authHead = req.headers['authorization'] || req.headers['Authorization']

    if (!authHead || Array.isArray(authHead)) {
      return res.status(401).json({ status: 'fail', msg: "No Token Found" })
    }

    const token = authHead.split(' ')[1]

    if (!token) {
      return res.status(401).json({ status: 'fail', msg: "No Token Found" })
    }

    if (!process.env.SECRET_JWT_KEY) {
      throw new Error("FATAL ERROR: Secret jwt key not defined")
    }

    const result = jwt.verify(token, process.env.SECRET_JWT_KEY)

    console.log(result)
    if (typeof result === "string" || !result.userId) {
      return res.status(401).json({ status: 'fail', msg: 'Invalid token payload' });
    }
    req.userId = result.userId

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ status: 'fail', msg: "invalid token" })
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ status: 'fail', msg: "token expired" })
    } else {
      return res.sendStatus(500)
    }
  }
}


export { createToken }

