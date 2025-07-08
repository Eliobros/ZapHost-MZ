"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Zap, Building, User } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [projectType, setProjectType] = useState<"personal" | "business">("personal")
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
        body: JSON.stringify({
          name,
          email,
          password,
          projectType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("token", data.token)
        // Redirecionar para seleção de planos
        window.location.href = "/plans"
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
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Comece sua jornada com nossa API do WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Tipo de Projeto */}
            <div>
              <Label className="text-base font-medium">Tipo de Projeto</Label>
              <RadioGroup
                value={projectType}
                onValueChange={(value) => setProjectType(value as "personal" | "business")}
                className="mt-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="personal" id="personal" />
                  <User className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="personal" className="flex-1 cursor-pointer">
                    <div className="font-medium">Projeto Pessoal</div>
                    <div className="text-sm text-gray-500">Para uso individual</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="business" id="business" />
                  <Building className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="business" className="flex-1 cursor-pointer">
                    <div className="font-medium">Projeto Empresarial</div>
                    <div className="text-sm text-gray-500">Para empresas e organizações</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Nome/Empresa */}
            <div>
              <Label htmlFor="name">{projectType === "business" ? "Nome da Empresa" : "Nome Completo"}</Label>
              <Input
                id="name"
                type="text"
                placeholder={projectType === "business" ? "Nome da sua empresa" : "Seu nome completo"}
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
              {loading ? "Criando conta..." : "Criar conta"}
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
