import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT, validateApiKey } from "@/lib/auth"
import { WhatsAppManager } from "@/lib/whatsapp"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (pode ser JWT ou API Key)
    const authorization = request.headers.get("authorization")
    let userId: string

    if (authorization?.startsWith("Bearer ")) {
      const token = authorization.replace("Bearer ", "")

      // Tentar JWT primeiro
      const decoded = verifyJWT(token)
      if (decoded) {
        userId = decoded.userId
      } else {
        // Tentar API Key
        const apiKeyResult = await validateApiKey(token)
        if (!apiKeyResult) {
          return NextResponse.json({ error: "Token inválido" }, { status: 401 })
        }
        userId = apiKeyResult.userId
      }
    } else {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    // Criar sessão WhatsApp
    const result = await WhatsAppManager.createSession(userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        qrCode: result.qrCode,
        message: result.qrCode ? "QR Code gerado" : "Já conectado",
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao conectar WhatsApp:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
