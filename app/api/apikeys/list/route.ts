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

    const db = await getDatabase()

    const apiKeys = await db
      .collection("apikeys")
      .find({
        userId: new ObjectId(decoded.userId),
        isActive: true,
      })
      .project({ key: 0 }) // Não retornar a chave completa
      .toArray()

    const formattedApiKeys = apiKeys.map((key) => ({
      id: key._id.toString(),
      name: key.name,
      keyPreview: key.key.substring(0, 8) + "...", // Mostrar apenas um preview
      createdAt: key.createdAt.toISOString(),
      lastUsed: key.lastUsed ? key.lastUsed.toISOString() : undefined,
    }))

    return NextResponse.json({ success: true, apiKeys: formattedApiKeys })
  } catch (error) {
    console.error("Erro ao listar API keys:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
