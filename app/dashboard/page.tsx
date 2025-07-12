"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectModal } from "@/components/project-modal" // Renomeado de ApiKeyModal
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

interface Project {
  id: string
  name: string
  apiKey: string
  createdAt: string
  lastUsed?: string
}

export default function DashboardPage() {
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting" | "error">(
    "disconnected",
  )
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([]) // Renomeado de apiKeys
  const [showProjectModal, setShowProjectModal] = useState(false) // Renomeado de showApiKeyModal
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
    loadProjects() // Renomeado
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

  const loadProjects = async () => {
    // Renomeado
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/projects/list", {
        // Nova rota
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || []) // Renomeado
      }
    } catch (error) {
      console.error("Erro ao carregar projetos:", error)
    }
  }

  const handleCreateProject = async (name: string) => {
    // Renomeado
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/projects/create", {
        // Nova rota
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (data.success) {
        await loadProjects() // Recarregar lista
        return { success: true, project: data.project } // Retorna o projeto completo com secretToken
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Erro ao criar projeto" }
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    // Renomeado
    if (!confirm("Tem certeza que deseja deletar este projeto?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/projects/delete", {
        // Nova rota
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      })

      if (response.ok) {
        await loadProjects()
      } else {
        alert("Erro ao deletar projeto")
      }
    } catch (error) {
      alert("Erro ao deletar projeto")
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
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
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
            <TabsTrigger value="projects">Projetos</TabsTrigger> {/* Renomeado */}
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

          <TabsContent value="projects" className="space-y-6">
            {/* Renomeado */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Projetos</h2> {/* Renomeado */}
                <p className="text-gray-600">Gerencie seus projetos e credenciais de API</p>
              </div>
              <Button onClick={() => setShowProjectModal(true)} disabled={isTrialExpired || projects.length >= 5}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </div>

            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>
                          Criado em: {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge>Ativo</Badge>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium">API Key</label>
                        <code className="bg-gray-100 px-3 py-1 rounded text-sm flex-1 block mt-1">
                          {project.apiKey}
                        </code>
                      </div>
                      {/* Secret Token não é exibido aqui por segurança, apenas no modal de criação */}
                    </div>
                    {project.lastUsed && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Último uso: {new Date(project.lastUsed).toLocaleString("pt-BR")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {projects.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500 mb-4">Nenhum projeto criado ainda</p>
                    <Button onClick={() => setShowProjectModal(true)} disabled={isTrialExpired}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Projeto
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

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}
