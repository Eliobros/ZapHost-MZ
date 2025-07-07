"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Gift } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("token", data.token)
        window.location.href = "/dashboard"
      } else {
        alert(data.error || "Erro ao criar conta")
      }
    } catch (error) {
      alert("Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold">ZapHost</span>
          </div>
          <CardTitle>Criar conta grátis</CardTitle>
          <CardDescription>Comece com 3 dias grátis para testar nossa API</CardDescription>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">3 dias grátis inclusos!</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Já tem uma conta? </span>
            <Link href="/login" className="text-green-600 hover:underline">
              Fazer login
            </Link>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Ao criar uma conta, você concorda com nossos{" "}
            <Link href="/terms" className="underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="underline">
              Política de Privacidade
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
