import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getDatabase } from "./mongodb"
import type { ObjectId } from "mongodb"

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
  selectedPlan: string
  trialEndsAt: Date
  createdAt: Date
  isActive: boolean
  projectType: "personal" | "business"
}

export interface Project {
  _id?: ObjectId
  userId: ObjectId
  name: string
  apiKey: string
  secretToken: string // Hashed secret token
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

export async function hashSecretToken(token: string): Promise<string> {
  return bcrypt.hash(token, 12)
}

export async function compareSecretToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash)
}

export function generateProjectApiKey(): string {
  const prefix = "zap_"
  const randomString =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  return prefix + randomString
}

export function generateSecretToken(): string {
  const prefix = "sk_"
  const randomString =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  return prefix + randomString
}

export async function validateProjectCredentials(
  apiKey: string,
  secretToken: string,
): Promise<{ userId: string; projectId: string } | null> {
  try {
    const db = await getDatabase()
    const project = await db.collection("projects").findOne({
      apiKey,
      isActive: true,
    })

    if (!project) return null

    const isSecretValid = await compareSecretToken(secretToken, project.secretToken)
    if (!isSecretValid) return null

    // Verificar se o usuário ainda tem acesso (trial ou pago)
    const user = await db.collection("users").findOne({ _id: project.userId })
    if (!user || !user.isActive) return null

    if (user.plan === "free" && new Date() > new Date(user.trialEndsAt)) {
      return null
    }

    // Atualizar último uso do projeto
    await db.collection("projects").updateOne({ _id: project._id }, { $set: { lastUsed: new Date() } })

    return { userId: project.userId.toString(), projectId: project._id.toString() }
  } catch (error) {
    console.error("Erro ao validar credenciais do projeto:", error)
    return null
  }
}
