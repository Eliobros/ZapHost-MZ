import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { userId, transactionId, status } = await request.json()

    const db = await getDatabase()

    if (status === "success") {
      // Atualizar usuário para plano pago
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            plan: "paid",
            updatedAt: new Date(),
          },
        },
      )

      // Atualizar transação
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        {
          $set: {
            status: "completed",
            completedAt: new Date(),
          },
        },
      )

      return NextResponse.json({ success: true })
    } else {
      // Marcar transação como falhou
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionId) },
        {
          $set: {
            status: "failed",
            failedAt: new Date(),
          },
        },
      )

      return NextResponse.json({ success: false, error: "Pagamento falhou" })
    }
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
