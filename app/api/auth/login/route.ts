import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { comparePassword, generateJWT } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const db = await getDatabase()
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const token = generateJWT(user._id.toString())

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
        trialEndsAt: user.trialEndsAt,
      },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
