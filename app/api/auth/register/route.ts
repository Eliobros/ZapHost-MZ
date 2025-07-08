import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateJWT } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, projectType } = await request.json()

    if (!name || !email || !password || !projectType) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    if (!["personal", "business"].includes(projectType)) {
      return NextResponse.json({ error: "Tipo de projeto inválido" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verificar se usuário já existe
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Criar usuário sem plano definido (será escolhido na próxima tela)
    const hashedPassword = await hashPassword(password)

    const user = {
      name,
      email,
      password: hashedPassword,
      projectType,
      plan: null, // Será definido na seleção de planos
      selectedPlan: null,
      trialEndsAt: null,
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
        projectType,
        plan: null,
      },
    })
  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
