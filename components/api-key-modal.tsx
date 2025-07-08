"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react"

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateKey: (name: string) => Promise<{ success: boolean; apiKey?: string; error?: string }>
}

export function ApiKeyModal({ isOpen, onClose, onCreateKey }: ApiKeyModalProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)

    try {
      const result = await onCreateKey(name.trim())

      if (result.success && result.apiKey) {
        setCreatedKey(result.apiKey)
        setName("")
      } else {
        alert(result.error || "Erro ao criar API key")
      }
    } catch (error) {
      alert("Erro ao criar API key")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!createdKey) return

    try {
      await navigator.clipboard.writeText(createdKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement("textarea")
      textArea.value = createdKey
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setName("")
    setCreatedKey(null)
    setShowKey(true)
    setCopied(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{createdKey ? "API Key Criada!" : "Nova API Key"}</DialogTitle>
          <DialogDescription>
            {createdKey
              ? "Sua API key foi criada com sucesso. Copie-a agora, pois ela não será mostrada novamente."
              : "Crie uma nova API key para autenticar suas requisições."}
          </DialogDescription>
        </DialogHeader>

        {!createdKey ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="keyName">Nome da API Key</Label>
              <Input
                id="keyName"
                placeholder="Ex: Produção, Desenvolvimento, App Mobile..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">Escolha um nome descritivo para identificar esta API key</p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? "Criando..." : "Criar API Key"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>IMPORTANTE:</strong> Esta é a única vez que você verá esta API key. Copie-a agora e guarde em
                local seguro!
              </AlertDescription>
            </Alert>

            <div>
              <Label>Sua API Key</Label>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 relative">
                  <Input
                    value={showKey ? createdKey : "•".repeat(createdKey.length)}
                    readOnly
                    className="font-mono text-sm pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center space-x-1 bg-transparent"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Como usar:</h4>
              <code className="text-xs bg-white p-2 rounded block">
                curl -H "Authorization: Bearer {createdKey.substring(0, 20)}..." \<br />
                &nbsp;&nbsp;&nbsp;&nbsp; https://zaphost.com/api/v1/send-message
              </code>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
