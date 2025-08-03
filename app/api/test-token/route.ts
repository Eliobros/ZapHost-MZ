import { NextResponse } from "next/server"
import { generateJWT } from "@/lib/auth"

export async function GET() {
  try {
    // Gerar um token de teste com um userId fictício
    const testUserId = "test-user-123"
    const token = generateJWT(testUserId)
    
    return NextResponse.json({ 
      success: true, 
      token,
      userId: testUserId,
      message: "Token de teste gerado"
    })
  } catch (error) {
    console.error("[TestToken] Erro:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}