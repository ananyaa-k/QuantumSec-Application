"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, Send, Lock, RefreshCw, Users, Plus, ArrowLeft, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { QKD } from "@/lib/qkd"
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  type Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Message = {
  id: string
  sender: string
  senderEmail: string
  receiver: string
  receiverEmail: string
  content: string
  encrypted: string
  timestamp: Timestamp
}

type Conversation = {
  userId: string
  userEmail: string
  lastMessage: string
  lastTimestamp: Timestamp
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [qkdKey, setQkdKey] = useState("")
  const [keyStatus, setKeyStatus] = useState<"generating" | "active" | "expired">("generating")
  const [showEncrypted, setShowEncrypted] = useState(false)
  const [newReceiverEmail, setNewReceiverEmail] = useState("")
  const [currentReceiver, setCurrentReceiver] = useState<{ id: string; email: string } | null>(null)
  const [showConversations, setShowConversations] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login")
    }
  }, [mounted, loading, user, router])

  useEffect(() => {
    if (user) {
      // Generate QKD key
      generateNewKey()

      // Fetch conversations
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (user && currentReceiver) {
      // Subscribe to messages between current user and selected receiver
      const q = query(
        collection(db, "messages"),
        where("sender", "in", [user.uid, currentReceiver.id]),
        where("receiver", "in", [user.uid, currentReceiver.id]),
        orderBy("timestamp", "asc"),
      )

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesData: Message[] = []
        querySnapshot.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() } as Message)
        })
        setMessages(messagesData)
      })

      return () => unsubscribe()
    }
  }, [user, currentReceiver])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = async () => {
    if (!user) return

    // Get all messages where user is sender or receiver
    const sentQuery = query(collection(db, "messages"), where("sender", "==", user.uid), orderBy("timestamp", "desc"))

    const receivedQuery = query(
      collection(db, "messages"),
      where("receiver", "==", user.uid),
      orderBy("timestamp", "desc"),
    )

    const [sentSnapshot, receivedSnapshot] = await Promise.all([getDocs(sentQuery), getDocs(receivedQuery)])

    const conversationMap = new Map<string, Conversation>()

    // Process sent messages
    sentSnapshot.forEach((doc) => {
      const data = doc.data() as Message
      if (!conversationMap.has(data.receiver)) {
        conversationMap.set(data.receiver, {
          userId: data.receiver,
          userEmail: data.receiverEmail,
          lastMessage: data.content,
          lastTimestamp: data.timestamp,
        })
      }
    })

    // Process received messages
    receivedSnapshot.forEach((doc) => {
      const data = doc.data() as Message
      if (
        !conversationMap.has(data.sender) ||
        data.timestamp.toMillis() > conversationMap.get(data.sender)!.lastTimestamp.toMillis()
      ) {
        conversationMap.set(data.sender, {
          userId: data.sender,
          userEmail: data.senderEmail,
          lastMessage: data.content,
          lastTimestamp: data.timestamp,
        })
      }
    })

    // Convert map to array and sort by timestamp
    const conversationsArray = Array.from(conversationMap.values()).sort(
      (a, b) => b.lastTimestamp.toMillis() - a.lastTimestamp.toMillis(),
    )

    setConversations(conversationsArray)
  }

  const generateNewKey = () => {
    setKeyStatus("generating")

    // Simulate QKD key generation
    setTimeout(() => {
      const { aliceKey } = QKD.generateSharedKey(256)
      setQkdKey(aliceKey)
      setKeyStatus("active")

      // Set key expiration after 5 minutes
      setTimeout(
        () => {
          setKeyStatus("expired")
        },
        5 * 60 * 1000,
      )
    }, 2000)
  }

  const startNewConversation = async () => {
    if (!newReceiverEmail.trim() || !user) return

    // In a real app, you would verify if the user exists
    // For this demo, we'll assume the user exists

    // Create a dummy user ID for the receiver
    const receiverId = `user_${newReceiverEmail.replace(/[^a-zA-Z0-9]/g, "_")}`

    setCurrentReceiver({
      id: receiverId,
      email: newReceiverEmail,
    })

    setShowConversations(false)
    setNewReceiverEmail("")
  }

  const selectConversation = (conversation: Conversation) => {
    setCurrentReceiver({
      id: conversation.userId,
      email: conversation.userEmail,
    })
    setShowConversations(false)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !user || !currentReceiver || keyStatus !== "active") return

    try {
      // Encrypt message with QKD key
      const encrypted = await QKD.encryptMessage(message, qkdKey)

      // Add message to Firestore
      await addDoc(collection(db, "messages"), {
        sender: user.uid,
        senderEmail: user.email,
        receiver: currentReceiver.id,
        receiverEmail: currentReceiver.email,
        content: message,
        encrypted,
        timestamp: serverTimestamp(),
      })

      setMessage("")

      // Update conversations list
      fetchConversations()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  if (loading || !mounted || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="quantum-animation">
          <Shield className="h-16 w-16 text-purple-500" />
          <p className="mt-4 text-xl font-bold">Loading QuantumSec Chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6 py-4 border-b border-purple-800">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-purple-500 mr-2" />
            <h1 className="text-xl font-bold text-white">QuantumSec Chat</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            Back to Dashboard
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {showConversations ? (
            <>
              <div className="md:col-span-1">
                <Card className="bg-gray-900 border-purple-800 h-[calc(100vh-180px)] flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 text-purple-500 mr-2" />
                        Conversations
                      </CardTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-purple-800">
                          <DialogHeader>
                            <DialogTitle>New Conversation</DialogTitle>
                            <DialogDescription>Enter the email of the person you want to chat with.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Input
                                placeholder="user@example.com"
                                value={newReceiverEmail}
                                onChange={(e) => setNewReceiverEmail(e.target.value)}
                                className="bg-gray-800"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={startNewConversation} className="bg-purple-700 hover:bg-purple-600">
                              Start Chat
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto p-4">
                    {conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Users className="h-12 w-12 text-gray-600 mb-4" />
                        <p className="text-gray-400">No conversations yet</p>
                        <p className="text-gray-500 text-sm mt-2">Start a new conversation to begin chatting</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {conversations.map((conversation) => (
                          <div
                            key={conversation.userId}
                            className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => selectConversation(conversation)}
                          >
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback className="bg-purple-700">
                                {conversation.userEmail.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{conversation.userEmail}</p>
                              <p className="text-xs text-gray-400 truncate">{conversation.lastMessage}</p>
                            </div>
                            <div className="text-xs text-gray-500">
                              {conversation.lastTimestamp
                                ?.toDate()
                                .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-3">
                <Card className="bg-gray-900 border-purple-800 h-[calc(100vh-180px)] flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Lock className="h-5 w-5 text-purple-500 mr-2" />
                      Select a conversation
                    </CardTitle>
                    <CardDescription>
                      Choose an existing conversation or start a new one to begin chatting securely.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Conversation Selected</h3>
                      <p className="text-gray-400 max-w-md">
                        Select a conversation from the sidebar or start a new one to begin chatting with quantum-secured
                        encryption.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="mt-6 bg-purple-700 hover:bg-purple-600">
                            <Plus className="h-4 w-4 mr-2" />
                            New Conversation
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-purple-800">
                          <DialogHeader>
                            <DialogTitle>New Conversation</DialogTitle>
                            <DialogDescription>Enter the email of the person you want to chat with.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Input
                                placeholder="user@example.com"
                                value={newReceiverEmail}
                                onChange={(e) => setNewReceiverEmail(e.target.value)}
                                className="bg-gray-800"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={startNewConversation} className="bg-purple-700 hover:bg-purple-600">
                              Start Chat
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-3">
                <Card className="bg-gray-900 border-purple-800 h-[calc(100vh-180px)] flex flex-col">
                  <CardHeader className="pb-2 flex flex-row items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-2"
                      onClick={() => {
                        setShowConversations(true)
                        setCurrentReceiver(null)
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <CardTitle className="flex items-center">
                        <Lock className="h-5 w-5 text-purple-500 mr-2" />
                        Chat with {currentReceiver?.email}
                      </CardTitle>
                      <CardDescription>End-to-end encrypted with QKD + AES-GCM</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Lock className="h-12 w-12 text-gray-600 mb-4" />
                          <p className="text-gray-400">No messages yet</p>
                          <p className="text-gray-500 text-sm mt-2">Send a message to start the conversation</p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === user.uid ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`flex ${msg.sender === user.uid ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={msg.sender === user.uid ? "bg-purple-700" : "bg-blue-700"}>
                                  {msg.sender === user.uid
                                    ? user.email?.substring(0, 2).toUpperCase()
                                    : msg.senderEmail?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div
                                  className={`text-xs text-gray-400 mb-1 ${msg.sender === user.uid ? "text-right" : "text-left"}`}
                                >
                                  {msg.sender === user.uid ? "You" : msg.senderEmail?.split("@")[0] || "Unknown"}
                                  <span className="text-gray-500 ml-2 text-xs">
                                    {msg.timestamp
                                      ?.toDate()
                                      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <div
                                  className={`rounded-lg p-3 ${
                                    msg.sender === user.uid ? "bg-purple-700 text-white" : "bg-gray-800 text-white"
                                  }`}
                                >
                                  {showEncrypted ? (
                                    <div className="font-mono text-xs break-all">{msg.encrypted}</div>
                                  ) : (
                                    <div>{msg.content}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-800 p-4">
                    <form onSubmit={sendMessage} className="w-full flex gap-2">
                      <Input
                        placeholder={keyStatus === "active" ? "Type your message..." : "Waiting for secure key..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={keyStatus !== "active"}
                        className="bg-gray-800"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={keyStatus !== "active" || !message.trim()}
                        className="bg-purple-700 hover:bg-purple-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-gray-900 border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Quantum Key Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Status:</span>
                        <span
                          className={`text-sm font-medium ${
                            keyStatus === "active"
                              ? "text-green-500"
                              : keyStatus === "generating"
                                ? "text-yellow-500"
                                : "text-red-500"
                          }`}
                        >
                          {keyStatus === "active" ? "Active" : keyStatus === "generating" ? "Generating..." : "Expired"}
                        </span>
                      </div>

                      {keyStatus === "active" && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-400">Key Preview:</div>
                          <div className="bg-gray-800 p-2 rounded font-mono text-xs break-all">
                            {qkdKey.substring(0, 16)}...
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={generateNewKey}
                        disabled={keyStatus === "generating"}
                        className="w-full"
                        variant={keyStatus === "expired" ? "destructive" : "default"}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {keyStatus === "generating" ? "Generating..." : "Generate New Key"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Encryption Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Show Encrypted:</span>
                        <Button variant="outline" size="sm" onClick={() => setShowEncrypted(!showEncrypted)}>
                          {showEncrypted ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
