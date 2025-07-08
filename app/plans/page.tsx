"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Star, Rocket } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Grátis",
    price: "0 MT",
    duration: "7 dias",
    icon: Zap,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    features: ["100 mensagens por dia", "1 API Key", "Suporte básico", "Documentação completa"],
    limitations: ["Sem webhooks", "Sem logs avançados"],
  },
  {
    id: "weekly",
    name: "Semanal",
    price: "50 MT",
    duration: "7 dias",
    icon: Crown,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    popular: false,
    features: ["1.000 mensagens por dia", "3 API Keys", "Webhooks inclusos", "Logs básicos", "Suporte prioritário"],
  },
  {
    id: "monthly",
    name: "Mensal",
    price: "100 MT",
    duration: "30 dias",
    icon: Star,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    popular: true,
    features: [
      "5.000 mensagens por dia",
      "5 API Keys",
      "Webhooks avançados",
      "Logs completos",
      "Suporte 24/7",
      "Analytics detalhados",
    ],
  },
  {
    id: "quarterly",
    name: "Trimestral",
    price: "250 MT",
    duration: "3 meses",
    icon: Rocket,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    popular: false,
    discount: "17% OFF",
    features: [
      "Mensagens ilimitadas",
      "10 API Keys",
      "Webhooks premium",
      "Logs avançados",
      "Suporte dedicado",
      "Analytics premium",
      "Backup automático",
    ],
  },
]

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [numero, setNumero] = useState("")
  const [metodoPagamento, setMetodoPagamento] = useState("mpesa") // padrão

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setUser(payload)
    } catch (error) {
      window.location.href = "/login"
    }
  }, [])

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      // Plano grátis - ir direto para dashboard
      selecionarPlanoFree()
      return
    }

    // Abrir modal para planos pagos
    setSelectedPlan(planId)
    setModalOpen(true)
  }

  const selecionarPlanoFree = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/select-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: "free" }),
      })

      if (response.ok) {
        window.location.href = "/dashboard"
      } else {
        alert("Erro ao selecionar plano")
      }
    } catch {
      alert("Erro ao selecionar plano")
    }
  }

  const handlePagamento = async () => {
    if (!numero || numero.length < 9) {
      alert("Por favor, insira um número válido")
      return
    }
    if (!metodoPagamento) {
      alert("Selecione um método de pagamento")
      return
    }
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numero,
          nome: user?.name || "Usuário",
          email: user?.email || "",
          metodoPagamento,
          planId: selectedPlan,
        }),
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank")
        setModalOpen(false)
        setSelectedPlan(null)
        setNumero("")
        setMetodoPagamento("mpesa")
      } else {
        alert("Erro ao criar pagamento")
      }
    } catch (error) {
      alert("Erro ao processar pagamento")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold">ZapHost</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Escolha seu plano</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione o plano que melhor se adequa às suas necessidades
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`relative ${plan.borderColor} ${
                  plan.popular ? "ring-2 ring-green-500 ring-offset-2" : ""
                } hover:shadow-lg transition-shadow`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white">Mais Popular</Badge>
                  </div>
                )}

                {plan.discount && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="destructive">{plan.discount}</Badge>
                  </div>
                )}

                <CardHeader className={`${plan.bgColor} text-center`}>
                  <div className="flex justify-center mb-2">
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{plan.price}</div>
                    <div className="text-sm text-gray-600">por {plan.duration}</div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations?.map((limitation, index) => (
                      <li key={index} className="flex items-center space-x-2 text-gray-400">
                        <span className="h-4 w-4 flex-shrink-0">✗</span>
                        <span className="text-sm line-through">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading && selectedPlan === plan.id}
                    className={`w-full ${
                      plan.popular
                        ? "bg-green-600 hover:bg-green-700"
                        : plan.id === "free"
                        ? "bg-gray-600 hover:bg-gray-700"
                        : ""
                    }`}
                  >
                    {loading && selectedPlan === plan.id
                      ? "Processando..."
                      : plan.id === "free"
                      ? "Começar Grátis"
                      : "Selecionar Plano"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Detalhes do Pagamento</h2>

              <label className="block mb-2 font-medium">Número de Telefone</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                placeholder="Ex: 258840000000"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />

              <label className="block mb-2 font-medium">Método de Pagamento</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
              >
                <option value="mpesa">Mpesa</option>
                <option value="emola">Emola</option>
              </select>

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => setModalOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handlePagamento} disabled={loading}>
                  {loading ? "Processando..." : "Confirmar Pagamento"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
