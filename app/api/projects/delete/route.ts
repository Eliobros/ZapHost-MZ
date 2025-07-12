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

    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: "ID do projeto é obrigatório" }, { status: 400 })
    }

    const db = await getDatabase()

    const result = await db.collection("projects").updateOne(
      {
        _id: new ObjectId(projectId),
        userId: new ObjectId(decoded.userId),
      },
      {
        $set: { isActive: false }, // Soft delete
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Projeto não encontrado ou não pertence ao usuário" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Projeto deletado com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar projeto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
