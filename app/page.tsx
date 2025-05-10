"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, MessageSquare, FileText, Code, Lock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login")
    }
  }, [mounted, loading, user, router])

  if (loading || !mounted || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="quantum-animation">
          <Shield className="h-16 w-16 text-purple-500" />
          <p className="mt-4 text-xl font-bold">Loading QuantumSec...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 py-4">
          <div className="flex items-center mb-4 md:mb-0">
            <Shield className="h-10 w-10 text-purple-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-white glow-text">QuantumSec</h1>
              <p className="text-purple-400 text-sm">A chat application for HackBro's</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">Welcome, {user.email?.split("@")[0]}</p>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </Link>
          </div>
        </header>

        <section className="mb-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
              Secure Communication with Quantum Encryption
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              QuantumSec merges quantum encryption with collaborative hacking—so your team communicates and tests
              securely, leaving no trace for attackers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Link href="/chat" className="group">
              <div className="bg-gray-900 bg-opacity-60 rounded-xl p-6 border border-purple-800 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] h-full flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-purple-900 bg-opacity-30 flex items-center justify-center mb-4 group-hover:bg-purple-800 transition-colors">
                  <MessageSquare className="h-8 w-8 text-purple-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Secure Chat</h3>
                <p className="text-gray-400 text-sm">End-to-end encrypted messaging with QKD protocol</p>
                <Button className="mt-4 bg-purple-700 hover:bg-purple-600 w-full">Chat Now</Button>
              </div>
            </Link>

            <Link href="/hackmode" className="group">
              <div className="bg-gray-900 bg-opacity-60 rounded-xl p-6 border border-green-800 hover:border-green-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(74,222,128,0.5)] h-full flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-green-900 bg-opacity-30 flex items-center justify-center mb-4 group-hover:bg-green-800 transition-colors">
                  <Code className="h-8 w-8 text-green-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Hack Mode</h3>
                <p className="text-gray-400 text-sm">Collaborative pentesting with advanced security tools</p>
                <Button className="mt-4 bg-green-700 hover:bg-green-600 w-full">Enter Hack Mode</Button>
              </div>
            </Link>

            <Link href="/reports" className="group">
              <div className="bg-gray-900 bg-opacity-60 rounded-xl p-6 border border-blue-800 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(96,165,250,0.5)] h-full flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-blue-900 bg-opacity-30 flex items-center justify-center mb-4 group-hover:bg-blue-800 transition-colors">
                  <FileText className="h-8 w-8 text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Reports</h3>
                <p className="text-gray-400 text-sm">Generate and view vulnerability reports with CVSS scoring</p>
                <Button className="mt-4 bg-blue-700 hover:bg-blue-600 w-full">View Reports</Button>
              </div>
            </Link>
          </div>
        </section>

        <section className="mb-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-8 border border-purple-800">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-purple-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Quantum-Secured Communication</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Our platform uses simulated Quantum Key Distribution (QKD) with the BB84 protocol to provide
              state-of-the-art encryption for your sensitive communications.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black bg-opacity-50 p-3 rounded-lg text-center">
                <p className="text-purple-400 text-2xl font-bold">256-bit</p>
                <p className="text-gray-400 text-xs">Encryption Keys</p>
              </div>
              <div className="bg-black bg-opacity-50 p-3 rounded-lg text-center">
                <p className="text-purple-400 text-2xl font-bold">AES-GCM</p>
                <p className="text-gray-400 text-xs">Encryption</p>
              </div>
              <div className="bg-black bg-opacity-50 p-3 rounded-lg text-center">
                <p className="text-purple-400 text-2xl font-bold">Real-time</p>
                <p className="text-gray-400 text-xs">Messaging</p>
              </div>
              <div className="bg-black bg-opacity-50 p-3 rounded-lg text-center">
                <p className="text-purple-400 text-2xl font-bold">Zero-Trust</p>
                <p className="text-gray-400 text-xs">Architecture</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
