import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/auth"
import { WhatsAppManager } from "@/lib/whatsapp"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Validar API Key
    const authorization = request.headers.get("authorization")
    const apiKey = authorization?.replace("Bearer ", "")

    if (!apiKey) {
      return NextResponse.json({ error: "API Key não fornecida" }, { status: 401 })
    }

    const keyValidation = await validateApiKey(apiKey)
    if (!keyValidation) {
      return NextResponse.json({ error: "API Key inválida ou expirada" }, { status: 401 })
    }

    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: "Parâmetros 'to' e 'message' são obrigatórios" }, { status: 400 })
    }

    // Verificar se o número está no formato correto
    const phoneRegex = /^[1-9]\d{1,14}$/
    if (!phoneRegex.test(to.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Número de telefone inválido" }, { status: 400 })
    }

    // Enviar mensagem via WhatsApp
    const result = await WhatsAppManager.sendMessage(keyValidation.userId, to, message)

    if (result.success) {
      // Log da API call
      const db = await getDatabase()
      await db.collection("api_logs").insertOne({
        userId: new ObjectId(keyValidation.userId),
        apiKeyId: new ObjectId(keyValidation.keyId),
        endpoint: "/api/v1/send-message",
        method: "POST",
        params: { to, message: message.substring(0, 100) + "..." },
        status: 200,
        timestamp: new Date(),
      })

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        to,
        message: "Mensagem enviada com sucesso",
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
