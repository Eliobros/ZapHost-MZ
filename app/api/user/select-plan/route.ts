import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
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

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: "Plano não especificado" }, { status: 400 })
    }

    const db = await getDatabase()

    // Definir duração baseada no plano
    const trialEndsAt = new Date()
    let plan = "free"

    switch (planId) {
      case "free":
        trialEndsAt.setDate(trialEndsAt.getDate() + 7)
        plan = "free"
        break
      case "weekly":
        trialEndsAt.setDate(trialEndsAt.getDate() + 7)
        plan = "paid"
        break
      case "monthly":
        trialEndsAt.setDate(trialEndsAt.getDate() + 30)
        plan = "paid"
        break
      case "quarterly":
        trialEndsAt.setDate(trialEndsAt.getDate() + 90)
        plan = "paid"
        break
      default:
        return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    // Atualizar usuário
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          plan,
          selectedPlan: planId,
          trialEndsAt,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao selecionar plano:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
