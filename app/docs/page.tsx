import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, MessageSquare, ImageIcon, Users, Webhook } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Documentação da API</h1>
          <p className="text-gray-600 mt-2">Guia completo para integrar sua aplicação com a ZapHost API</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="#getting-started" className="block text-sm text-blue-600 hover:underline">
                  Começando
                </a>
                <a href="#authentication" className="block text-sm text-blue-600 hover:underline">
                  Autenticação
                </a>
                <a href="#send-message" className="block text-sm text-blue-600 hover:underline">
                  Enviar Mensagem
                </a>
                <a href="#send-media" className="block text-sm text-blue-600 hover:underline">
                  Enviar Mídia
                </a>
                <a href="#groups" className="block text-sm text-blue-600 hover:underline">
                  Grupos
                </a>
                <a href="#webhooks" className="block text-sm text-blue-600 hover:underline">
                  Webhooks
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Getting Started */}
            <section id="getting-started">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>Começando</span>
                  </CardTitle>
                  <CardDescription>Configure sua primeira integração com a ZapHost API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Base URL</h3>
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm">https://api.zaphost.com/v1</code>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Exemplo de Requisição</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                      {`curl -X POST https://api.zaphost.com/v1/send-message \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "5511999999999",
    "message": "Olá! Mensagem via ZapHost API"
  }'`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <Card>
                <CardHeader>
                  <CardTitle>Autenticação</CardTitle>
                  <CardDescription>Como autenticar suas requisições usando API Keys</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Todas as requisições devem incluir sua API Key no header Authorization:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded text-sm">
                    Authorization: Bearer zap_prod_1234567890abcdef...
                  </pre>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Dica:</strong> Mantenha sua API Key segura e nunca a exponha em código client-side.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Endpoints */}
            <Tabs defaultValue="messages" className="space-y-6">
              <TabsList>
                <TabsTrigger value="messages">Mensagens</TabsTrigger>
                <TabsTrigger value="media">Mídia</TabsTrigger>
                <TabsTrigger value="groups">Grupos</TabsTrigger>
                <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="space-y-6">
                <Card id="send-message">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Enviar Mensagem de Texto</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Badge>POST</Badge>
                      <code className="text-sm">/send-message</code>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Parâmetros</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <code>phone</code>
                          <span className="text-gray-600">string (obrigatório)</span>
                        </div>
                        <div className="flex justify-between">
                          <code>message</code>
                          <span className="text-gray-600">string (obrigatório)</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Exemplo</h4>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                        {`{
  "phone": "5511999999999",
  "message": "Olá! Como posso ajudar?"
}`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Resposta</h4>
                      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                        {`{
  "success": true,
  "messageId": "msg_1234567890",
  "status": "sent"
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <Card id="send-media">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ImageIcon className="h-5 w-5" />
                      <span>Enviar Mídia</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Badge>POST</Badge>
                      <code className="text-sm">/send-media</code>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Parâmetros</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <code>phone</code>
                          <span className="text-gray-600">string (obrigatório)</span>
                        </div>
                        <div className="flex justify-between">
                          <code>media</code>
                          <span className="text-gray-600">string (URL ou base64)</span>
                        </div>
                        <div className="flex justify-between">
                          <code>type</code>
                          <span className="text-gray-600">image | video | audio | document</span>
                        </div>
                        <div className="flex justify-between">
                          <code>caption</code>
                          <span className="text-gray-600">string (opcional)</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Exemplo</h4>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                        {`{
  "phone": "5511999999999",
  "media": "https://example.com/image.jpg",
  "type": "image",
  "caption": "Confira esta imagem!"
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="groups" className="space-y-6">
                <Card id="groups">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Gerenciar Grupos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Criar Grupo</h4>
                        <div className="flex space-x-2 mb-2">
                          <Badge>POST</Badge>
                          <code className="text-sm">/create-group</code>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Adicionar Participante</h4>
                        <div className="flex space-x-2 mb-2">
                          <Badge>POST</Badge>
                          <code className="text-sm">/add-participant</code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="webhooks" className="space-y-6">
                <Card id="webhooks">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Webhook className="h-5 w-5" />
                      <span>Webhooks</span>
                    </CardTitle>
                    <CardDescription>Receba eventos em tempo real em sua aplicação</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Eventos Disponíveis</h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          • <code>message.received</code> - Nova mensagem recebida
                        </li>
                        <li>
                          • <code>message.sent</code> - Mensagem enviada com sucesso
                        </li>
                        <li>
                          • <code>message.delivered</code> - Mensagem entregue
                        </li>
                        <li>
                          • <code>message.read</code> - Mensagem lida
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Exemplo de Payload</h4>
                      <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                        {`{
  "event": "message.received",
  "data": {
    "messageId": "msg_1234567890",
    "from": "5511999999999",
    "message": "Olá!",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
