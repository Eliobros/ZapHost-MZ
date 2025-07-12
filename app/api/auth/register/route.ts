import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateJWT } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, projectType } = await request.json()

    if (!email || !password || !name || !projectType) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const db = await getDatabase()
    const existingUser = await db.collection("users").findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7) // 7 dias de trial gratuito

    const newUser = {
      email,
      password: hashedPassword,
      name,
      projectType,
      plan: "free",
      selectedPlan: "free",
      trialEndsAt,
      createdAt: new Date(),
      isActive: true,
    }

    const result = await db.collection("users").insertOne(newUser)
    const token = generateJWT(result.insertedId.toString())

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
