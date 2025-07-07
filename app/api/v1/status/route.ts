import { type NextRequest, NextResponse } from "next/server"

function validateApiKey(apiKey: string): boolean {
  return apiKey && apiKey.startsWith("zap_")
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    const apiKey = authorization?.replace("Bearer ", "")

    if (!apiKey || !validateApiKey(apiKey)) {
      return NextResponse.json({ error: "API Key inválida" }, { status: 401 })
    }

    // Simular status da conexão WhatsApp
    const status = {
      connected: true,
      phone: "5511999999999",
      battery: 85,
      lastSeen: new Date().toISOString(),
      qrCode: null,
      instance: "zaphost_001",
    }

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error("Erro ao verificar status:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
