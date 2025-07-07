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
      .project({
        key: 0, // NÃO retornar a chave real
      })
      .sort({ createdAt: -1 })
      .toArray()

    const formattedKeys = apiKeys.map((key) => ({
      id: key._id.toString(),
      name: key.name,
      keyPreview: `${key.key?.substring(0, 12)}...`, // Apenas preview
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
    }))

    return NextResponse.json({
      success: true,
      apiKeys: formattedKeys,
    })
  } catch (error) {
    console.error("Erro ao listar API keys:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
