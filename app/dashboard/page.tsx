"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiKeyModal } from "@/components/api-key-modal"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { Smartphone, Activity, MessageSquare, Users, Settings, Plus, Trash2, CreditCard } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  plan: "free" | "paid"
  selectedPlan: string
  trialEndsAt: string
  projectType: "personal" | "business"
}

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  createdAt: string
  lastUsed?: string
}

export default function DashboardPage() {
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting" | "error">(
    "disconnected",
  )
  const [user, setUser] = useState<User | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
    loadApiKeys()
  }, [])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      // Decodificar token para pegar dados do usuário (simplificado)
      const payload = JSON.parse(atob(token.split(".")[1]))

      // Em produção, fazer uma chamada para /api/user/me
      setUser({
        id: payload.userId,
        name: "Usuário Teste",
        email: "teste@zaphost.com",
        plan: "free",
        selectedPlan: "free",
        trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        projectType: "personal",
      })
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error)
      window.location.href = "/login"
    } finally {
      setLoading(false)
    }
  }

  const loadApiKeys = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/apikeys/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error("Erro ao carregar API keys:", error)
    }
  }

  const handleCreateApiKey = async (name: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/apikeys/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (data.success) {
        await loadApiKeys() // Recarregar lista
        return { success: true, apiKey: data.apiKey }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Erro ao criar API key" }
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta API key?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/apikeys/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ keyId }),
      })

      if (response.ok) {
        await loadApiKeys()
      } else {
        alert("Erro ao deletar API key")
      }
    } catch (error) {
      alert("Erro ao deletar API key")
    }
  }

  const handleUpgrade = () => {
    window.location.href = "/plans"
  }

  const isTrialExpired = user && user.plan === "free" && new Date() > new Date(user.trialEndsAt)
  const trialDaysLeft = user
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const getPlanName = (planId: string) => {
    const plans: Record<string, string> = {
      free: "Grátis",
      weekly: "Semanal",
      monthly: "Mensal",
      quarterly: "Trimestral",
    }
    return plans[planId] || planId
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold">ZapHost Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            {user?.plan === "free" && (
              <Badge variant={isTrialExpired ? "destructive" : "secondary"}>
                {isTrialExpired ? "Trial Expirado" : `${trialDaysLeft} dias restantes`}
              </Badge>
            )}
            <Badge variant={connectionStatus === "connected" ? "default" : "secondary"}>
              {connectionStatus === "connected" ? "Conectado" : "Desconectado"}
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Trial Warning */}
      {user?.plan === "free" && (
        <div
          className={`${isTrialExpired ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"} border-b px-4 py-3`}
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className={`h-4 w-4 ${isTrialExpired ? "text-red-600" : "text-yellow-600"}`} />
              <span className={`text-sm ${isTrialExpired ? "text-red-800" : "text-yellow-800"}`}>
                {isTrialExpired
                  ? "Seu trial expirou. Faça upgrade para continuar usando a API."
                  : `Você tem ${trialDaysLeft} dias restantes no seu plano ${getPlanName(user.selectedPlan)}.`}
              </span>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleUpgrade}>
              Fazer Upgrade
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% desde ontem</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,678</div>
              <p className="text-xs text-muted-foreground">+8% desde ontem</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Keys Ativas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeys.length}</div>
              <p className="text-xs text-muted-foreground">Máximo 5</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPlanName(user?.selectedPlan || "")}</div>
              <p className="text-xs text-muted-foreground">
                {user?.plan === "free" ? `${trialDaysLeft} dias restantes` : "Ativo"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="connection" className="space-y-6">
          <TabsList>
            <TabsTrigger value="connection">Conexão</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6">
            {isTrialExpired ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="h-16 w-16 mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Trial Expirado</h3>
                  <p className="text-gray-600 mb-4">Faça upgrade para continuar usando o WhatsApp</p>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpgrade}>
                    Fazer Upgrade
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <QRCodeDisplay onStatusChange={setConnectionStatus} />
            )}
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">API Keys</h2>
                <p className="text-gray-600">Gerencie suas chaves de API para autenticação</p>
              </div>
              <Button onClick={() => setShowApiKeyModal(true)} disabled={isTrialExpired || apiKeys.length >= 5}>
                <Plus className="h-4 w-4 mr-2" />
                Nova API Key
              </Button>
            </div>

            <div className="space-y-4">
              {apiKeys.map((key) => (
                <Card key={key.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{key.name}</CardTitle>
                        <CardDescription>
                          Criada em: {new Date(key.createdAt).toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge>Ativa</Badge>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteApiKey(key.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm flex-1">{key.keyPreview}</code>
                    </div>
                    {key.lastUsed && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Último uso: {new Date(key.lastUsed).toLocaleString("pt-BR")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {apiKeys.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500 mb-4">Nenhuma API key criada ainda</p>
                    <Button onClick={() => setShowApiKeyModal(true)} disabled={isTrialExpired}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira API Key
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Webhooks</h2>
                <p className="text-gray-600">Configure endpoints para receber eventos em tempo real</p>
              </div>
              <Button disabled={isTrialExpired}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Webhook
              </Button>
            </div>

            {isTrialExpired ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <p className="text-gray-500 mb-4">Trial expirado. Faça upgrade para usar webhooks.</p>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpgrade}>
                    Fazer Upgrade
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Principal</CardTitle>
                  <CardDescription>Recebe todos os eventos de mensagens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">URL do Endpoint</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                          https://meuapp.com/webhook/whatsapp
                        </code>
                        <Button size="sm" variant="outline">
                          Testar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Atividade</CardTitle>
                <CardDescription>Histórico de requisições e eventos</CardDescription>
              </CardHeader>
              <CardContent>
                {isTrialExpired ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <p className="text-gray-500 mb-4">Trial expirado. Faça upgrade para ver os logs.</p>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpgrade}>
                      Fazer Upgrade
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center space-x-3">
                        <Badge variant="default">POST</Badge>
                        <span className="text-sm">/api/v1/send-message</span>
                        <Badge variant="outline">200</Badge>
                      </div>
                      <span className="text-sm text-gray-500">há 2 min</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center space-x-3">
                        <Badge variant="default">GET</Badge>
                        <span className="text-sm">/api/v1/status</span>
                        <Badge variant="outline">200</Badge>
                      </div>
                      <span className="text-sm text-gray-500">há 5 min</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onCreateKey={handleCreateApiKey}
      />
    </div>
  )
}
