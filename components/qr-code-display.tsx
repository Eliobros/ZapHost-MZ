"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import QRCodeLib from "qrcode"

interface QRCodeDisplayProps {
  onStatusChange: (status: "disconnected" | "connecting" | "connected" | "error") => void
}

export function QRCodeDisplay({ onStatusChange }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected")
  const [loading, setLoading] = useState(false)

  const generateQRCode = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success && data.qrCode) {
        // Gerar imagem do QR Code
        const qrCodeDataUrl = await QRCodeLib.toDataURL(data.qrCode, {
          width: 256,
          margin: 2,
        })
        setQrCodeUrl(qrCodeDataUrl)
        setStatus("connecting")
        onStatusChange("connecting")

        // Iniciar polling para verificar status
        startStatusPolling()
      } else if (data.success && !data.qrCode) {
        // Já conectado
        setStatus("connected")
        onStatusChange("connected")
      } else {
        setStatus("error")
        onStatusChange("error")
        alert(data.error || "Erro ao gerar QR Code")
      }
    } catch (error) {
      setStatus("error")
      onStatusChange("error")
      alert("Erro ao conectar com WhatsApp")
    } finally {
      setLoading(false)
    }
  }

  const startStatusPolling = () => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/whatsapp/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (data.success) {
          setStatus(data.status)
          onStatusChange(data.status)

          if (data.status === "connected") {
            setQrCodeUrl(null)
            clearInterval(interval)
          } else if (data.status === "error" || data.status === "disconnected") {
            clearInterval(interval)
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error)
      }
    }, 2000) // Verificar a cada 2 segundos

    // Limpar interval após 2 minutos
    setTimeout(() => clearInterval(interval), 120000)
  }

  const disconnect = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/whatsapp/disconnect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setStatus("disconnected")
        setQrCodeUrl(null)
        onStatusChange("disconnected")
      }
    } catch (error) {
      alert("Erro ao desconectar")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status da Conexão WhatsApp</CardTitle>
        <CardDescription>Gerencie sua conexão com o WhatsApp Web</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "disconnected" && (
          <div className="text-center py-8">
            <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">WhatsApp Desconectado</h3>
            <p className="text-gray-600 mb-4">Clique no botão abaixo para gerar o QR Code</p>
            <Button onClick={generateQRCode} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar QR Code"
              )}
            </Button>
          </div>
        )}

        {status === "connecting" && qrCodeUrl && (
          <div className="text-center py-8">
            <div className="mb-4">
              <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code WhatsApp" className="mx-auto border rounded-lg" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Escaneie o QR Code</h3>
            <p className="text-gray-600 mb-4">
              1. Abra o WhatsApp no seu celular
              <br />
              2. Toque em Menu (⋮) ou Configurações
              <br />
              3. Toque em "Aparelhos conectados"
              <br />
              4. Toque em "Conectar um aparelho"
              <br />
              5. Aponte seu telefone para esta tela para capturar o código
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={generateQRCode} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo QR Code
              </Button>
            </div>
          </div>
        )}

        {status === "connected" && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">WhatsApp Conectado</h3>
            <p className="text-gray-600 mb-4">Sua instância está ativa e pronta para receber requisições</p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={disconnect}>
                Desconectar
              </Button>
              <Button>Testar Conexão</Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro na Conexão</h3>
            <p className="text-gray-600 mb-4">Ocorreu um erro ao conectar com o WhatsApp</p>
            <Button onClick={generateQRCode} disabled={loading} className="bg-green-600 hover:bg-green-700">
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
