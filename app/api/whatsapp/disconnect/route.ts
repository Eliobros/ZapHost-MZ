import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import { WhatsAppManager } from "@/lib/whatsapp"

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

    // Destruir sessão WhatsApp
    await WhatsAppManager.destroySession(decoded.userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao desconectar WhatsApp:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
