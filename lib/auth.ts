import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getDatabase } from "./mongodb"

if (!process.env.JWT_SECRET) {
  throw new Error("Please add your JWT_SECRET to .env.local")
}

const JWT_SECRET = process.env.JWT_SECRET

export interface User {
  _id?: string
  email: string
  name: string
  password: string
  plan: "free" | "paid"
  trialEndsAt: Date
  createdAt: Date
  isActive: boolean
}

export interface ApiKey {
  _id?: string
  userId: string
  key: string
  name: string
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
}

export function generateJWT(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyJWT(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateApiKey(): string {
  const prefix = "zap_"
  const randomString =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  return prefix + randomString
}

export async function validateApiKey(apiKey: string): Promise<{ userId: string; keyId: string } | null> {
  try {
    const db = await getDatabase()
    const key = await db.collection("apikeys").findOne({
      key: apiKey,
      isActive: true,
    })

    if (!key) return null

    // Verificar se o usuário ainda tem acesso (trial ou pago)
    const user = await db.collection("users").findOne({ _id: key.userId })
    if (!user || !user.isActive) return null

    if (user.plan === "free" && new Date() > new Date(user.trialEndsAt)) {
      return null
    }

    // Atualizar último uso
    await db.collection("apikeys").updateOne({ _id: key._id }, { $set: { lastUsed: new Date() } })

    return { userId: key.userId, keyId: key._id.toString() }
  } catch (error) {
    console.error("Erro ao validar API key:", error)
    return null
  }
}
