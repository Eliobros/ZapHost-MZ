import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateJWT } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verificar se usuário já existe
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Criar usuário com 3 dias grátis
    const hashedPassword = await hashPassword(password)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 3)

    const user = {
      name,
      email,
      password: hashedPassword,
      plan: "free" as const,
      trialEndsAt,
      createdAt: new Date(),
      isActive: true,
    }

    const result = await db.collection("users").insertOne(user)
    const userId = result.insertedId.toString()

    const token = generateJWT(userId)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        name,
        email,
        plan: "free",
        trialEndsAt,
      },
    })
  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
