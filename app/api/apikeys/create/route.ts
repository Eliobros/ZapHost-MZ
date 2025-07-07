import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT, generateApiKey } from "@/lib/auth"
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

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Nome da API key é obrigatório" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verificar se usuário tem acesso
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Usuário inválido" }, { status: 401 })
    }

    // Verificar se ainda está no trial ou é pago
    if (user.plan === "free" && new Date() > new Date(user.trialEndsAt)) {
      return NextResponse.json({ error: "Trial expirado. Faça upgrade para continuar." }, { status: 403 })
    }

    // Verificar limite de API keys (máximo 5 por usuário)
    const existingKeys = await db.collection("apikeys").countDocuments({
      userId: new ObjectId(decoded.userId),
      isActive: true,
    })

    if (existingKeys >= 5) {
      return NextResponse.json({ error: "Limite máximo de 5 API keys atingido" }, { status: 400 })
    }

    // Gerar nova API key
    const apiKey = generateApiKey()

    const newKey = {
      userId: new ObjectId(decoded.userId),
      key: apiKey,
      name,
      isActive: true,
      createdAt: new Date(),
    }

    const result = await db.collection("apikeys").insertOne(newKey)

    return NextResponse.json({
      success: true,
      apiKey: {
        id: result.insertedId.toString(),
        key: apiKey, // Mostrado apenas uma vez!
        name,
        createdAt: newKey.createdAt,
      },
    })
  } catch (error) {
    console.error("Erro ao criar API key:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
