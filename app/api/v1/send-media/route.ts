import { type NextRequest, NextResponse } from "next/server"

function validateApiKey(apiKey: string): boolean {
  return apiKey && apiKey.startsWith("zap_")
}

async function sendWhatsAppMedia(phone: string, media: string, type: string, caption?: string) {
  console.log(`Enviando ${type} para ${phone}:`, { media, caption })

  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    messageId: `msg_${Date.now()}`,
    status: "sent",
    timestamp: new Date().toISOString(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    const apiKey = authorization?.replace("Bearer ", "")

    if (!apiKey || !validateApiKey(apiKey)) {
      return NextResponse.json({ error: "API Key inválida" }, { status: 401 })
    }

    const body = await request.json()
    const { phone, media, type, caption } = body

    if (!phone || !media || !type) {
      return NextResponse.json({ error: "Parâmetros phone, media e type são obrigatórios" }, { status: 400 })
    }

    const validTypes = ["image", "video", "audio", "document"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Tipo de mídia inválido. Use: image, video, audio ou document" },
        { status: 400 },
      )
    }

    const phoneRegex = /^55\d{10,11}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Formato de telefone inválido. Use: 5511999999999" }, { status: 400 })
    }

    const result = await sendWhatsAppMedia(phone, media, type, caption)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Erro ao enviar mídia:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
