import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    const token = authorization?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    if (process.env.MONGODB_URI === "disabled") {
      // Retornar dados mockados quando MongoDB está desabilitado
      return NextResponse.json({
        success: true,
        user: {
          id: decoded.userId,
          name: "Usuário Teste",
          email: "teste@zaphost.com",
          plan: "free",
          selectedPlan: "free",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          projectType: "personal",
        },
      })
    }

    const db = await getDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
        selectedPlan: user.selectedPlan,
        trialEndsAt: user.trialEndsAt,
        projectType: user.projectType,
        createdAt: user.createdAt,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}