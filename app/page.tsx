import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Code, Smartphone, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">ZapHost</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/docs" className="text-gray-600 hover:text-gray-900">
              Documentação
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Preços
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">🚀 API WhatsApp Profissional</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Conecte seu WhatsApp
            <span className="text-green-600 block">via API</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para integração WhatsApp com endpoints REST, webhooks e gerenciamento de sessões.
            Simples como o Z-API, poderoso como você precisa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
              <Link href="/register">
                Começar Agora <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">Ver Documentação</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Por que escolher ZapHost?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Smartphone className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Conexão Estável</CardTitle>
                <CardDescription>
                  Baseado em whatsapp-web.js com reconexão automática e gerenciamento de sessão
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Code className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>API REST Completa</CardTitle>
                <CardDescription>Endpoints para envio de mensagens, mídia, grupos e muito mais</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Seguro & Confiável</CardTitle>
                <CardDescription>API Keys, webhooks seguros e monitoramento em tempo real</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* API Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">API Simples e Poderosa</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Envio de mensagens de texto e mídia</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Gerenciamento de grupos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Webhooks para eventos em tempo real</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Status de entrega e leitura</span>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono">POST /api/v1/send-message</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                  {`{
  "phone": "5511999999999",
  "message": "Olá! Mensagem via ZapHost API",
  "type": "text"
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl mb-8 opacity-90">Crie sua conta gratuita e conecte seu WhatsApp em minutos</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">
              Criar Conta Grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-6 w-6 text-green-500" />
                <span className="text-xl font-bold">ZapHost</span>
              </div>
              <p className="text-gray-400">Plataforma de API WhatsApp profissional e confiável.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/docs" className="hover:text-white">
                    Documentação
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Termos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ZapHost. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
