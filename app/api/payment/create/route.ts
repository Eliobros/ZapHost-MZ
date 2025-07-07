import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    const token = authorization?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { numero, nome, email, metodoPagamento } = await request.json()

    if (!numero || !nome || !email || !metodoPagamento) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Criar checkout no MozPayment
    const response = await fetch("https://mozpayment.co.mz/api/1.1/wf/white-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carteira: process.env.NEXT_PUBLIC_CARTEIRA_ID,
        numero,
        nome,
        valor: "10",
        meio_de_pagamento: metodoPagamento,
        email,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
      }),
    })

    const checkoutUrl = await response.text()

    if (!checkoutUrl) {
      return NextResponse.json({ error: "Erro ao criar checkout" }, { status: 500 })
    }

    // Salvar transação pendente no banco
    const db = await getDatabase()
    await db.collection("transactions").insertOne({
      userId: new ObjectId(decoded.userId),
      amount: 10,
      status: "pending",
      paymentMethod: metodoPagamento,
      customerInfo: { numero, nome, email },
      checkoutUrl,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      checkoutUrl,
    })
  } catch (error) {
    console.error("Erro ao criar pagamento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
