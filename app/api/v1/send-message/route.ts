import { type NextRequest, NextResponse } from "next/server"
import { validateProjectCredentials } from "@/lib/auth"
import { WhatsAppManager } from "@/lib/whatsapp"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Validar credenciais do projeto
    const authorization = request.headers.get("authorization")
    const apiKey = authorization?.replace("Bearer ", "")
    const secretToken = request.headers.get("x-secret-token")

    if (!apiKey || !secretToken) {
      return NextResponse.json({ error: "API Key e Secret Token são obrigatórios" }, { status: 401 })
    }

    const projectValidation = await validateProjectCredentials(apiKey, secretToken)
    if (!projectValidation) {
      return NextResponse.json({ error: "Credenciais inválidas ou projeto expirado" }, { status: 401 })
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
    const result = await WhatsAppManager.sendMessage(projectValidation.userId, to, message)

    if (result.success) {
      // Log da API call
      const db = await getDatabase()
      await db.collection("api_logs").insertOne({
        userId: new ObjectId(projectValidation.userId),
        projectId: new ObjectId(projectValidation.projectId),
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
