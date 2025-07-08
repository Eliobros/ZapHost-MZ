import { Client, LocalAuth } from "whatsapp-web.js"
import { getDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

interface WhatsAppSession {
  userId: string
  client: Client
  qrCode?: string
  status: "disconnected" | "connecting" | "connected" | "error"
}

// Armazenar sessões ativas em memória
const activeSessions = new Map<string, WhatsAppSession>()

export class WhatsAppManager {
  static async createSession(userId: string): Promise<{ success: boolean; qrCode?: string; error?: string }> {
    try {
      // Verificar se já existe uma sessão ativa
      if (activeSessions.has(userId)) {
        const session = activeSessions.get(userId)!
        if (session.status === "connected") {
          return { success: true }
        }
        // Destruir sessão anterior se não estiver conectada
        await this.destroySession(userId)
      }

      // Criar novo cliente WhatsApp
      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: `zaphost_${userId}`,
        }),
        puppeteer: {
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",
          ],
        },
      })

      const session: WhatsAppSession = {
        userId,
        client,
        status: "connecting",
      }

      activeSessions.set(userId, session)

      return new Promise((resolve) => {
        // Timeout de 60 segundos para gerar QR Code
        const timeout = setTimeout(() => {
          resolve({ success: false, error: "Timeout ao gerar QR Code" })
        }, 60000)

        // Evento de QR Code gerado
        client.on("qr", (qr: string) => {
          console.log(`QR Code gerado para usuário ${userId}`)
          session.qrCode = qr
          session.status = "connecting"
          clearTimeout(timeout)
          resolve({ success: true, qrCode: qr })
        })

        // Evento de cliente pronto (conectado)
        client.on("ready", async () => {
          console.log(`WhatsApp conectado para usuário ${userId}`)
          session.status = "connected"
          session.qrCode = undefined

          // Salvar status no banco
          const db = await getDatabase()
          await db.collection("whatsapp_sessions").updateOne(
            { userId: new ObjectId(userId) },
            {
              $set: {
                status: "connected",
                connectedAt: new Date(),
                updatedAt: new Date(),
              },
            },
            { upsert: true },
          )
        })

        // Evento de desconexão
        client.on("disconnected", async (reason: string) => {
          console.log(`WhatsApp desconectado para usuário ${userId}: ${reason}`)
          session.status = "disconnected"

          // Atualizar status no banco
          const db = await getDatabase()
          await db.collection("whatsapp_sessions").updateOne(
            { userId: new ObjectId(userId) },
            {
              $set: {
                status: "disconnected",
                disconnectedAt: new Date(),
                disconnectReason: reason,
                updatedAt: new Date(),
              },
            },
          )

          // Remover da memória
          activeSessions.delete(userId)
        })

        // Evento de erro de autenticação
        client.on("auth_failure", (message: string) => {
          console.log(`Falha na autenticação para usuário ${userId}: ${message}`)
          session.status = "error"
          clearTimeout(timeout)
          resolve({ success: false, error: "Falha na autenticação" })
        })

        // Inicializar cliente
        client.initialize().catch((error) => {
          console.error(`Erro ao inicializar cliente para usuário ${userId}:`, error)
          session.status = "error"
          clearTimeout(timeout)
          resolve({ success: false, error: "Erro ao inicializar WhatsApp" })
        })
      })
    } catch (error) {
      console.error("Erro ao criar sessão WhatsApp:", error)
      return { success: false, error: "Erro interno do servidor" }
    }
  }

  static async getSessionStatus(userId: string): Promise<{
    status: "disconnected" | "connecting" | "connected" | "error"
    qrCode?: string
  }> {
    const session = activeSessions.get(userId)
    if (!session) {
      return { status: "disconnected" }
    }

    return {
      status: session.status,
      qrCode: session.qrCode,
    }
  }

  static async sendMessage(
    userId: string,
    to: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const session = activeSessions.get(userId)
      if (!session || session.status !== "connected") {
        return { success: false, error: "WhatsApp não conectado" }
      }

      // Formatar número (adicionar @c.us se necessário)
      const chatId = to.includes("@") ? to : `${to}@c.us`

      // Enviar mensagem
      const sentMessage = await session.client.sendMessage(chatId, message)

      // Log da mensagem enviada
      const db = await getDatabase()
      await db.collection("message_logs").insertOne({
        userId: new ObjectId(userId),
        to: chatId,
        message,
        messageId: sentMessage.id.id,
        status: "sent",
        sentAt: new Date(),
      })

      return { success: true, messageId: sentMessage.id.id }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      return { success: false, error: "Erro ao enviar mensagem" }
    }
  }

  static async destroySession(userId: string): Promise<void> {
    const session = activeSessions.get(userId)
    if (session) {
      try {
        await session.client.destroy()
      } catch (error) {
        console.error("Erro ao destruir sessão:", error)
      }
      activeSessions.delete(userId)
    }

    // Atualizar status no banco
    const db = await getDatabase()
    await db.collection("whatsapp_sessions").updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          status: "disconnected",
          disconnectedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )
  }
}
