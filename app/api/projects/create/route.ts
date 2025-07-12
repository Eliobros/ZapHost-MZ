import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT, generateProjectApiKey, generateSecretToken, hashSecretToken } from "@/lib/auth"
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
      return NextResponse.json({ error: "Nome do projeto é obrigatório" }, { status: 400 })
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

    // Verificar limite de projetos (máximo 5 por usuário)
    const existingProjects = await db.collection("projects").countDocuments({
      userId: new ObjectId(decoded.userId),
      isActive: true,
    })

    if (existingProjects >= 5) {
      return NextResponse.json({ error: "Limite máximo de 5 projetos atingido" }, { status: 400 })
    }

    // Gerar nova API key e Secret Token
    const apiKey = generateProjectApiKey()
    const rawSecretToken = generateSecretToken()
    const hashedSecretToken = await hashSecretToken(rawSecretToken)

    const newProject = {
      userId: new ObjectId(decoded.userId),
      name,
      apiKey,
      secretToken: hashedSecretToken,
      isActive: true,
      createdAt: new Date(),
    }

    const result = await db.collection("projects").insertOne(newProject)

    return NextResponse.json({
      success: true,
      project: {
        id: result.insertedId.toString(),
        name,
        apiKey,
        secretToken: rawSecretToken, // Mostrado apenas uma vez!
        createdAt: newProject.createdAt,
      },
    })
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
