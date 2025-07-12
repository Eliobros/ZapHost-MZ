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

    const projects = await db
      .collection("projects")
      .find({
        userId: new ObjectId(decoded.userId),
        isActive: true,
      })
      .project({ secretToken: 0 }) // Não retornar o secretToken
      .toArray()

    const formattedProjects = projects.map((project) => ({
      id: project._id.toString(),
      name: project.name,
      apiKey: project.apiKey,
      createdAt: project.createdAt.toISOString(),
      lastUsed: project.lastUsed ? project.lastUsed.toISOString() : undefined,
    }))

    return NextResponse.json({ success: true, projects: formattedProjects })
  } catch (error) {
    console.error("Erro ao listar projetos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
