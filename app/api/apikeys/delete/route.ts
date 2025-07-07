import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest) {
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

    const { keyId } = await request.json()

    if (!keyId) {
      return NextResponse.json({ error: "ID da API key é obrigatório" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verificar se a key pertence ao usuário
    const apiKey = await db.collection("apikeys").findOne({
      _id: new ObjectId(keyId),
      userId: new ObjectId(decoded.userId),
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API key não encontrada" }, { status: 404 })
    }

    // Desativar a key (soft delete)
    await db.collection("apikeys").updateOne(
      { _id: new ObjectId(keyId) },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar API key:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
