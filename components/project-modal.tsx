"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy, CheckCircle, AlertCircle } from "lucide-react"

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateProject: (name: string) => Promise<{ success: boolean; project?: any; error?: string }>
}

export function ProjectModal({ isOpen, onClose, onCreateProject }: ProjectModalProps) {
  const [projectName, setProjectName] = useState("")
  const [generatedProject, setGeneratedProject] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    setError("")
    setLoading(true)
    const result = await onCreateProject(projectName)
    if (result.success) {
      setGeneratedProject(result.project)
    } else {
      setError(result.error || "Erro ao criar projeto.")
    }
    setLoading(false)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCloseModal = () => {
    setProjectName("")
    setGeneratedProject(null)
    setError("")
    setCopied(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{generatedProject ? "Projeto Criado!" : "Criar Novo Projeto"}</DialogTitle>
          <DialogDescription>
            {generatedProject
              ? "Guarde suas credenciais com segurança. Elas não serão mostradas novamente."
              : "Dê um nome ao seu novo projeto para gerar as credenciais de API."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!generatedProject ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectName" className="text-right">
                  Nome
                </Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="col-span-3"
                  disabled={loading}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ATENÇÃO: Guarde estas credenciais!</AlertTitle>
                <AlertDescription>
                  O **Secret Token** abaixo só será exibido uma única vez. Certifique-se de copiá-lo e armazená-lo em um
                  local seguro.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="projectId" className="text-sm font-medium">
                  ID do Projeto
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input id="projectId" value={generatedProject.id} readOnly className="flex-1" />
                  <Button size="sm" variant="outline" onClick={() => handleCopy(generatedProject.id)}>
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="apiKey" className="text-sm font-medium">
                  API Key
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input id="apiKey" value={generatedProject.apiKey} readOnly className="flex-1" />
                  <Button size="sm" variant="outline" onClick={() => handleCopy(generatedProject.apiKey)}>
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="secretToken" className="text-sm font-medium">
                  Secret Token
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input id="secretToken" value={generatedProject.secretToken} readOnly className="flex-1" />
                  <Button size="sm" variant="outline" onClick={() => handleCopy(generatedProject.secretToken)}>
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Exemplo de Uso (Node.js)</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  <code>
                    {`const API_KEY = "${generatedProject.apiKey}";
const SECRET_TOKEN = "${generatedProject.secretToken}";
const ZAPHOST_URL = "http://93.127.129.84:3000"; // Sua URL

async function sendMessage(to, message) {
  const response = await fetch(\`\${ZAPHOST_URL}/api/v1/send-message\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${API_KEY}\`,
      "X-Secret-Token": SECRET_TOKEN,
    },
    body: JSON.stringify({ to, message }),
  });
  const data = await response.json();
  console.log(data);
}

// Exemplo de chamada
sendMessage("5511999999999", "Olá do meu bot ZapHost!");`}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {!generatedProject ? (
            <Button onClick={handleCreate} disabled={loading || !projectName.trim()}>
              {loading ? "Criando..." : "Gerar Credenciais"}
            </Button>
          ) : (
            <Button onClick={handleCloseModal}>Entendi</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
