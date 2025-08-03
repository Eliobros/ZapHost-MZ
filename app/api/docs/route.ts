import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zaphost.topaziocoin.online"
  
  const apiDocs = {
    title: "ZapHost WhatsApp API Documentation",
    version: "1.0.0",
    baseUrl,
    authentication: {
      type: "Bearer Token + Secret Token",
      description: "Use API Key as Bearer token and Secret Token in X-Secret-Token header",
      example: {
        headers: {
          "Authorization": "Bearer zap_your_api_key_here",
          "X-Secret-Token": "sk_your_secret_token_here",
          "Content-Type": "application/json"
        }
      }
    },
    endpoints: {
      "Send Message": {
        url: `${baseUrl}/api/v1/send-message`,
        method: "POST",
        description: "Enviar mensagem de texto via WhatsApp",
        body: {
          to: "258840000000",
          message: "Sua mensagem aqui"
        },
        response: {
          success: true,
          messageId: "message_id_here",
          to: "258840000000",
          message: "Mensagem enviada com sucesso"
        }
      },
      "Chat Messages": {
        url: `${baseUrl}/api/v1/chat-messages`,
        methods: {
          POST: {
            description: "Enviar mensagem via chat",
            body: {
              to: "258840000000",
              message: "Sua mensagem aqui",
              type: "text"
            }
          },
          GET: {
            description: "Buscar mensagens enviadas",
            query: "?limit=50&offset=0"
          }
        }
      },
      "Send Media": {
        url: `${baseUrl}/api/v1/send-media`,
        method: "POST",
        description: "Enviar mídia (imagem, documento, etc.)",
        body: {
          to: "258840000000",
          media: "base64_encoded_media_or_url",
          type: "image",
          caption: "Legenda opcional"
        }
      },
      "Status": {
        url: `${baseUrl}/api/v1/status`,
        method: "GET",
        description: "Verificar status da conexão WhatsApp",
        response: {
          success: true,
          status: "connected",
          message: "WhatsApp conectado"
        }
      }
    },
    examples: {
      curl: {
        "Send Message": `curl -X POST ${baseUrl}/api/v1/send-message \\
  -H "Authorization: Bearer zap_your_api_key" \\
  -H "X-Secret-Token: sk_your_secret_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "258840000000",
    "message": "Olá! Esta é uma mensagem de teste."
  }'`,
        "Chat Messages": `curl -X POST ${baseUrl}/api/v1/chat-messages \\
  -H "Authorization: Bearer zap_your_api_key" \\
  -H "X-Secret-Token: sk_your_secret_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "258840000000",
    "message": "Mensagem via chat",
    "type": "text"
  }'`
      },
      javascript: {
        "Send Message": `const response = await fetch('${baseUrl}/api/v1/send-message', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer zap_your_api_key',
    'X-Secret-Token': 'sk_your_secret_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '258840000000',
    message: 'Olá! Esta é uma mensagem de teste.'
  })
});

const data = await response.json();
console.log(data);`
      }
    },
    errorCodes: {
      400: "Bad Request - Parâmetros inválidos",
      401: "Unauthorized - API Key ou Secret Token inválidos",
      403: "Forbidden - Trial expirado ou sem permissão",
      500: "Internal Server Error - Erro no servidor"
    },
    notes: [
      "Todos os números de telefone devem estar no formato internacional sem o +",
      "Exemplo: 258840000000 (Moçambique)",
      "A API Key e Secret Token são gerados no dashboard do ZapHost",
      "O Secret Token é mostrado apenas uma vez na criação do projeto"
    ]
  }

  return NextResponse.json(apiDocs, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
}