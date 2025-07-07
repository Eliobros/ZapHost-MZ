"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy, CheckCircle, AlertTriangle } from "lucide-react"

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateKey: (name: string) => Promise<{ success: boolean; apiKey?: any; error?: string }>
}

export function ApiKeyModal({ isOpen, onClose, onCreateKey }: ApiKeyModalProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return

    setLoading(true)
    try {
      const result = await onCreateKey(name)
      if (result.success && result.apiKey) {
        setCreatedKey(result.apiKey.key)
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
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setName("")
    setCreatedKey(null)
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
              ? "Copie sua API key agora. Ela não será mostrada novamente!"
              : "Crie uma nova API key para autenticar suas requisições"}
          </DialogDescription>
        </DialogHeader>

        {!createdKey ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da API Key</Label>
              <Input
                id="name"
                placeholder="Ex: Produção, Desenvolvimento..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim() || loading}>
                {loading ? "Criando..." : "Criar API Key"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Importante!</p>
                  <p>Esta é a única vez que você verá esta API key. Copie-a agora!</p>
                </div>
              </div>
            </div>

            <div>
              <Label>Sua API Key</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1 font-mono">{createdKey}</code>
                <Button size="sm" onClick={handleCopy} variant="outline">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>{copied ? "Fechar" : "Entendi, fechar"}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
