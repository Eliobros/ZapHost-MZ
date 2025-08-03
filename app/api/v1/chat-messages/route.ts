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

    const { to, message, type = "text" } = await request.json()

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
      // Log da API call (se MongoDB disponível)
      if (process.env.MONGODB_URI !== "disabled") {
        try {
          const db = await getDatabase()
          await db.collection("api_logs").insertOne({
            userId: new ObjectId(projectValidation.userId),
            projectId: new ObjectId(projectValidation.projectId),
            endpoint: "/api/v1/chat-messages",
            method: "POST",
            params: { to, message: message.substring(0, 100) + "...", type },
            status: 200,
            timestamp: new Date(),
          })
        } catch (dbError) {
          console.error("Erro ao salvar log:", dbError)
        }
      }

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        to,
        type,
        message: "Mensagem enviada com sucesso",
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem via chat-messages:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Endpoint para buscar mensagens (GET)
export async function GET(request: NextRequest) {
  try {
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

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get("limit") || "50")
    const offset = parseInt(url.searchParams.get("offset") || "0")

    if (process.env.MONGODB_URI === "disabled") {
      // Retornar mensagens mockadas
      return NextResponse.json({
        success: true,
        messages: [
          {
            id: "msg-1",
            to: "258840000000",
            message: "Mensagem de teste",
            type: "text",
            status: "sent",
            timestamp: new Date().toISOString(),
          },
        ],
        total: 1,
        limit,
        offset,
      })
    }

    const db = await getDatabase()
    const messages = await db
      .collection("message_logs")
      .find({ userId: new ObjectId(projectValidation.userId) })
      .sort({ sentAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    const total = await db
      .collection("message_logs")
      .countDocuments({ userId: new ObjectId(projectValidation.userId) })

    return NextResponse.json({
      success: true,
      messages: messages.map((msg) => ({
        id: msg._id.toString(),
        to: msg.to,
        message: msg.message,
        type: "text",
        status: msg.status,
        timestamp: msg.sentAt.toISOString(),
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}