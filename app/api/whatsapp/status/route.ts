import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT, validateApiKey } from "@/lib/auth"
import { WhatsAppManager } from "@/lib/whatsapp"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authorization = request.headers.get("authorization")
    let userId: string

    if (authorization?.startsWith("Bearer ")) {
      const token = authorization.replace("Bearer ", "")

      const decoded = verifyJWT(token)
      if (decoded) {
        userId = decoded.userId
      } else {
        const apiKeyResult = await validateApiKey(token)
        if (!apiKeyResult) {
          return NextResponse.json({ error: "Token inválido" }, { status: 401 })
        }
        userId = apiKeyResult.userId
      }
    } else {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    // Obter status da sessão
    const status = await WhatsAppManager.getSessionStatus(userId)

    return NextResponse.json({
      success: true,
      ...status,
    })
  } catch (error) {
    console.error("Erro ao obter status:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
