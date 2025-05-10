"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Code, Save, Play, Download, Share2, Search, Activity, Globe } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Textarea } from "@/components/ui/textarea"

type CheckpointData = {
  id: string
  name: string
  timestamp: Date
  codeContent: string
  scanResults: string
  whoisResults: string
  tcpdumpResults: string
}

export default function HackmodePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [codeContent, setCodeContent] = useState(
    "// Write your exploit code here\n\nconst target = {\n  host: 'example.com',\n  port: 443,\n  protocol: 'https'\n};\n\nasync function scanTarget() {\n  console.log('Starting scan of ' + target.host);\n  // Scan logic would go here\n  return 'Scan complete';\n}\n",
  )
  const [scanType, setScanType] = useState("nmap")
  const [scanTarget, setScanTarget] = useState("")
  const [scanResults, setScanResults] = useState("")
  const [whoisTarget, setWhoisTarget] = useState("")
  const [whoisResults, setWhoisResults] = useState("")
  const [tcpdumpInterface, setTcpdumpInterface] = useState("eth0")
  const [tcpdumpFilter, setTcpdumpFilter] = useState("")
  const [tcpdumpResults, setTcpdumpResults] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>([])
  const [checkpointName, setCheckpointName] = useState("")
  const [isCreatingCheckpoint, setIsCreatingCheckpoint] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isWhoisLookup, setIsWhoisLookup] = useState(false)
  const [isTcpdumpRunning, setIsTcpdumpRunning] = useState(false)
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
      // Generate a session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      setSessionId(newSessionId)
    }
  }, [user])

  const runScan = () => {
    if (!scanTarget.trim()) return

    setIsScanning(true)
    setScanResults("Initializing scan...")

    // Simulate scan delay
    setTimeout(() => {
      let results = ""

      switch (scanType) {
        case "nmap":
          results = `Running Nmap scan against ${scanTarget}...\n\n`
          results += "Starting Nmap 7.92 at " + new Date().toLocaleString() + "\n"
          results += "Nmap scan report for " + scanTarget + "\n"
          results += "Host is up (0.015s latency).\n\n"
          results += "PORT     STATE    SERVICE       VERSION\n"
          results += "22/tcp   filtered ssh           -\n"
          results += "80/tcp   open     http          Apache httpd 2.4.41\n"
          results += "443/tcp  open     https         Apache httpd 2.4.41 (OpenSSL 1.1.1c)\n"
          results += "3306/tcp filtered mysql         -\n"
          results += "8080/tcp open     http-proxy    -\n\n"
          results += "Service detection performed. Please report any incorrect results.\n"
          results += "Nmap done: 1 IP address (1 host up) scanned in 5.32 seconds\n"
          break

        case "ssl":
          results = `SSL Certificate Check for ${scanTarget}...\n\n`
          results += "Certificate Information:\n"
          results += "  Subject: CN=" + scanTarget + ", O=Example Inc, L=San Francisco, ST=California, C=US\n"
          results += "  Issuer: CN=DigiCert TLS RSA SHA256 2020 CA1, O=DigiCert Inc, C=US\n"
          results +=
            "  Valid From: " + new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + "\n"
          results +=
            "  Valid To: " + new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + "\n"
          results += "  Status: Valid\n\n"
          results += "SSL/TLS Protocol Support:\n"
          results += "  TLS 1.0: No\n"
          results += "  TLS 1.1: No\n"
          results += "  TLS 1.2: Yes\n"
          results += "  TLS 1.3: Yes\n\n"
          results += "Cipher Suites:\n"
          results += "  TLS_AES_256_GCM_SHA384\n"
          results += "  TLS_CHACHA20_POLY1305_SHA256\n"
          results += "  TLS_AES_128_GCM_SHA256\n"
          break

        case "vuln":
          results = `Vulnerability Scan for ${scanTarget}...\n\n`
          results += "Scanning target for common vulnerabilities...\n\n"
          results += "Findings:\n"
          results += "  [MEDIUM] CVE-2021-44228: Log4j Remote Code Execution\n"
          results += "    Description: The target may be vulnerable to Log4Shell\n"
          results += "    CVSS Score: 7.5\n\n"
          results += "  [LOW] Outdated Apache Version (2.4.41)\n"
          results += "    Description: The server is running an outdated version of Apache\n"
          results += "    CVSS Score: 3.2\n\n"
          results += "  [INFO] HTTP Headers Missing Security Controls\n"
          results += "    Description: Missing security headers (X-Content-Type-Options, X-Frame-Options)\n"
          results += "    CVSS Score: 2.0\n\n"
          results += "Scan completed at " + new Date().toLocaleString() + "\n"
          break
      }

      setScanResults(results)
      setIsScanning(false)
    }, 3000)
  }

  const runWhoisLookup = () => {
    if (!whoisTarget.trim()) return

    setIsWhoisLookup(true)
    setWhoisResults("Performing WHOIS lookup...")

    // Simulate lookup delay
    setTimeout(() => {
      const results =
        `Domain Name: ${whoisTarget.toUpperCase()}\n` +
        `Registry Domain ID: 2336799_DOMAIN_COM-VRSN\n` +
        `Registrar WHOIS Server: whois.registrar.com\n` +
        `Registrar URL: http://www.registrar.com\n` +
        `Updated Date: 2022-08-15T09:23:42Z\n` +
        `Creation Date: 2000-03-22T05:15:10Z\n` +
        `Registry Expiry Date: 2023-03-22T05:15:10Z\n` +
        `Registrar: Example Registrar, LLC\n` +
        `Registrar IANA ID: 123456\n` +
        `Registrar Abuse Contact Email: abuse@registrar.com\n` +
        `Registrar Abuse Contact Phone: +1.5555555555\n` +
        `Domain Status: clientTransferProhibited https://icann.org/epp#clientTransferProhibited\n` +
        `Name Server: NS1.EXAMPLE.COM\n` +
        `Name Server: NS2.EXAMPLE.COM\n` +
        `DNSSEC: unsigned\n` +
        `URL of the ICANN Whois Inaccuracy Complaint Form: https://www.icann.org/wicf/\n\n` +
        `>>> Last update of WHOIS database: ${new Date().toISOString()} <<<\n`

      setWhoisResults(results)
      setIsWhoisLookup(false)
    }, 2000)
  }

  const runTcpdump = () => {
    if (!tcpdumpInterface.trim()) return

    setIsTcpdumpRunning(true)
    setTcpdumpResults("Starting packet capture...\n")

    // Simulate packet capture
    const captureInterval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString()
      const randomIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      const randomPort = Math.floor(Math.random() * 65535)
      const protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS"]
      const protocol = protocols[Math.floor(Math.random() * protocols.length)]
      const packetSize = Math.floor(Math.random() * 1500)

      const packetInfo = `${timestamp} IP ${randomIp}.${randomPort} > 10.0.0.1.80: ${protocol}, length ${packetSize}\n`

      setTcpdumpResults((prev) => prev + packetInfo)
    }, 500)

    // Stop after 10 seconds
    setTimeout(() => {
      clearInterval(captureInterval)
      setTcpdumpResults((prev) => prev + "\nCapture complete. 20 packets captured.\n")
      setIsTcpdumpRunning(false)
    }, 10000)
  }

  const stopTcpdump = () => {
    setIsTcpdumpRunning(false)
    setTcpdumpResults((prev) => prev + "\nCapture stopped by user.\n")
  }

  const createCheckpoint = async () => {
    if (!user || !checkpointName.trim()) return

    setIsCreatingCheckpoint(true)

    try {
      // Create checkpoint in Firestore
      const checkpointRef = await addDoc(collection(db, "checkpoints"), {
        userId: user.uid,
        sessionId,
        name: checkpointName,
        timestamp: serverTimestamp(),
        codeContent,
        scanResults,
        whoisResults,
        tcpdumpResults,
      })

      // Add to local state
      const newCheckpoint: CheckpointData = {
        id: checkpointRef.id,
        name: checkpointName,
        timestamp: new Date(),
        codeContent,
        scanResults,
        whoisResults,
        tcpdumpResults,
      }

      setCheckpoints((prev) => [...prev, newCheckpoint])
      setCheckpointName("")
    } catch (error) {
      console.error("Error creating checkpoint:", error)
    } finally {
      setIsCreatingCheckpoint(false)
    }
  }

  const loadCheckpoint = async (checkpoint: CheckpointData) => {
    setCodeContent(checkpoint.codeContent)
    setScanResults(checkpoint.scanResults)
    setWhoisResults(checkpoint.whoisResults)
    setTcpdumpResults(checkpoint.tcpdumpResults)
  }

  const generateReport = async () => {
    if (!user) return

    try {
      // Create a timestamp for the report
      const now = new Date()

      // Create report in Firestore
      const reportRef = await addDoc(collection(db, "reports"), {
        userId: user.uid,
        title: `Pentest Report - ${scanTarget || whoisTarget || "Unknown Target"} - ${now.toLocaleDateString()}`,
        timestamp: serverTimestamp(),
        content: {
          target: scanTarget || whoisTarget || "Unknown Target",
          findings: scanResults || "No scan results available",
          code: codeContent || "No code available",
          whois: whoisResults || "No WHOIS information available",
          tcpdump: tcpdumpResults || "No packet capture data available",
        },
      })

      // Show success message
      alert("Report generated successfully! View it in the Reports section.")

      // Navigate to the reports page
      router.push("/reports")
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Failed to generate report. Please try again.")
    }
  }

  const generateInviteLink = () => {
    const inviteCode = Math.random().toString(36).substring(2, 15)
    const inviteLink = `${window.location.origin}/hackmode?invite=${inviteCode}&session=${sessionId}`

    // In a real app, you would save this to the database
    // For now, just copy to clipboard
    navigator.clipboard.writeText(inviteLink)
    alert("Invitation link copied to clipboard!")
  }

  if (loading || !mounted || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="quantum-animation">
          <Shield className="h-16 w-16 text-green-500" />
          <p className="mt-4 text-xl font-bold">Loading Hack Mode...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 py-4 border-b border-green-800">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-green-500 mr-2" />
            <h1 className="text-xl font-bold text-white">QuantumSec Hack Mode</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={generateInviteLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Invite Team
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="scan" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="scan">
                  <Search className="h-4 w-4 mr-2" />
                  Port Scanner
                </TabsTrigger>
                <TabsTrigger value="whois">
                  <Globe className="h-4 w-4 mr-2" />
                  WHOIS Lookup
                </TabsTrigger>
                <TabsTrigger value="tcpdump">
                  <Activity className="h-4 w-4 mr-2" />
                  Packet Capture
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code className="h-4 w-4 mr-2" />
                  Code Editor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scan">
                <Card className="bg-gray-900 border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Search className="h-5 w-5 text-green-500 mr-2" />
                      Vulnerability Scanner
                    </CardTitle>
                    <CardDescription>Scan targets for security vulnerabilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Scan Type</label>
                        <Select value={scanType} onValueChange={setScanType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scan type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nmap">Nmap Port Scan</SelectItem>
                            <SelectItem value="ssl">SSL Certificate Check</SelectItem>
                            <SelectItem value="vuln">Vulnerability Scan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-gray-400">Target</label>
                        <div className="flex gap-2">
                          <Input
                            value={scanTarget}
                            onChange={(e) => setScanTarget(e.target.value)}
                            placeholder="example.com or 192.168.1.1"
                          />
                          <Button
                            onClick={runScan}
                            className="bg-green-700 hover:bg-green-600"
                            disabled={isScanning || !scanTarget.trim()}
                          >
                            {isScanning ? "Scanning..." : "Scan"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="terminal h-[calc(100vh-350px)] overflow-y-auto">
                      <pre className="terminal-output">{scanResults}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="whois">
                <Card className="bg-gray-900 border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 text-green-500 mr-2" />
                      WHOIS Lookup
                    </CardTitle>
                    <CardDescription>Retrieve domain registration information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <label className="text-sm text-gray-400">Domain or IP</label>
                      <div className="flex gap-2">
                        <Input
                          value={whoisTarget}
                          onChange={(e) => setWhoisTarget(e.target.value)}
                          placeholder="example.com or 192.168.1.1"
                        />
                        <Button
                          onClick={runWhoisLookup}
                          className="bg-green-700 hover:bg-green-600"
                          disabled={isWhoisLookup || !whoisTarget.trim()}
                        >
                          {isWhoisLookup ? "Looking up..." : "Lookup"}
                        </Button>
                      </div>
                    </div>

                    <div className="terminal h-[calc(100vh-350px)] overflow-y-auto">
                      <pre className="terminal-output">{whoisResults}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tcpdump">
                <Card className="bg-gray-900 border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 text-green-500 mr-2" />
                      Packet Capture (tcpdump)
                    </CardTitle>
                    <CardDescription>Capture and analyze network traffic</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Interface</label>
                        <Select value={tcpdumpInterface} onValueChange={setTcpdumpInterface}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interface" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eth0">eth0</SelectItem>
                            <SelectItem value="wlan0">wlan0</SelectItem>
                            <SelectItem value="lo">lo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-gray-400">Filter (optional)</label>
                        <Input
                          value={tcpdumpFilter}
                          onChange={(e) => setTcpdumpFilter(e.target.value)}
                          placeholder="port 80 or host 192.168.1.1"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      {!isTcpdumpRunning ? (
                        <Button
                          onClick={runTcpdump}
                          className="bg-green-700 hover:bg-green-600"
                          disabled={!tcpdumpInterface.trim()}
                        >
                          Start Capture
                        </Button>
                      ) : (
                        <Button onClick={stopTcpdump} variant="destructive">
                          Stop Capture
                        </Button>
                      )}
                    </div>

                    <div className="terminal h-[calc(100vh-400px)] overflow-y-auto">
                      <pre className="terminal-output">{tcpdumpResults}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="code">
                <Card className="bg-gray-900 border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Code className="h-5 w-5 text-green-500 mr-2" />
                      Code Editor
                    </CardTitle>
                    <CardDescription>Write and test exploit code</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      className="code-editor h-[calc(100vh-350px)] mb-4 font-mono text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" className="bg-green-700 hover:bg-green-600">
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-900 border-green-800">
              <CardHeader>
                <CardTitle className="text-sm">Session Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Session ID</label>
                  <div className="bg-gray-800 p-2 rounded font-mono text-xs break-all">{sessionId}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Create Checkpoint</label>
                  <div className="flex gap-2">
                    <Input
                      value={checkpointName}
                      onChange={(e) => setCheckpointName(e.target.value)}
                      placeholder="Checkpoint name"
                    />
                    <Button
                      onClick={createCheckpoint}
                      disabled={isCreatingCheckpoint || !checkpointName.trim()}
                      size="icon"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={generateReport} className="w-full bg-green-700 hover:bg-green-600">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-800">
              <CardHeader>
                <CardTitle className="text-sm">Checkpoints</CardTitle>
              </CardHeader>
              <CardContent>
                {checkpoints.length === 0 ? (
                  <p className="text-sm text-gray-400">No checkpoints saved yet.</p>
                ) : (
                  <div className="space-y-2">
                    {checkpoints.map((checkpoint) => (
                      <div
                        key={checkpoint.id}
                        className="bg-gray-800 p-2 rounded flex justify-between items-center cursor-pointer hover:bg-gray-700"
                        onClick={() => loadCheckpoint(checkpoint)}
                      >
                        <div>
                          <div className="font-medium text-sm">{checkpoint.name}</div>
                          <div className="text-xs text-gray-400">{checkpoint.timestamp.toLocaleString()}</div>
                        </div>
                        <Button size="sm" variant="ghost">
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
