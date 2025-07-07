import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Simulação de envio de mensagem via whatsapp-web.js
async function sendWhatsAppMessage(phone: string, message: string) {
  console.log(`Enviando mensagem para ${phone}: ${message}`)
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    messageId: `msg_${Date.now()}`,
    status: "sent",
    timestamp: new Date().toISOString(),
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validar API Key
    const authorization = request.headers.get("authorization")
    const apiKey = authorization?.replace("Bearer ", "")

    if (!apiKey) {
      return NextResponse.json({ error: "API Key não fornecida" }, { status: 401 })
    }

    const validation = await validateApiKey(apiKey)
    if (!validation) {
      return NextResponse.json(
        {
          error: "API Key inválida ou trial expirado. Faça upgrade para continuar.",
        },
        { status: 401 },
      )
    }

    // Parse do body
    const body = await request.json()
    const { phone, message } = body

    // Validações
    if (!phone || !message) {
      return NextResponse.json(
        {
          error: "Parâmetros phone e message são obrigatórios",
        },
        { status: 400 },
      )
    }

    // Validar formato do telefone
    const phoneRegex = /^55\d{10,11}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        {
          error: "Formato de telefone inválido. Use: 5511999999999",
        },
        { status: 400 },
      )
    }

    // Enviar mensagem
    const result = await sendWhatsAppMessage(phone, message)

    // Registrar log da API
    const db = await getDatabase()
    await db.collection("api_logs").insertOne({
      userId: new ObjectId(validation.userId),
      keyId: new ObjectId(validation.keyId),
      endpoint: "/send-message",
      method: "POST",
      phone,
      messageId: result.messageId,
      status: "success",
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
