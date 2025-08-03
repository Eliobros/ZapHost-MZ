import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[Test] Testando API...")
    
    let mongoStatus = "desabilitado"
    let collections = 0
    
    if (process.env.MONGODB_URI !== "disabled") {
      try {
        console.log("[Test] Testando conexão com MongoDB...")
        const db = await getDatabase()
        const collectionsList = await db.listCollections().toArray()
        collections = collectionsList.length
        mongoStatus = "conectado"
        console.log("[Test] MongoDB conectado, collections:", collections)
      } catch (mongoError) {
        console.error("[Test] Erro no MongoDB:", mongoError)
        mongoStatus = "erro"
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "API funcionando", 
      mongodb: mongoStatus,
      collections,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("[Test] Erro:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}