"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, User, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login")
    }
  }, [mounted, loading, user, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const updateProfile = async () => {
    setIsUpdating(true)

    try {
      // In a real app, you would update the user's profile here
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading || !mounted || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="quantum-animation">
          <Shield className="h-16 w-16 text-purple-500" />
          <p className="mt-4 text-xl font-bold">Loading Profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-6 py-4 border-b border-purple-800">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-purple-500 mr-2" />
            <h1 className="text-xl font-bold text-white">QuantumSec Profile</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            Back to Dashboard
          </Button>
        </header>

        <div className="space-y-6">
          <Card className="bg-gray-900 border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 text-purple-500 mr-2" />
                User Profile
              </CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email || ""} disabled className="bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="bg-gray-800"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button onClick={updateProfile} disabled={isUpdating} className="bg-purple-700 hover:bg-purple-600">
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gray-900 border-purple-800">
            <CardHeader>
              <CardTitle className="text-sm">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" className="bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" className="bg-gray-800" />
              </div>
              <Button className="w-full">Change Password</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
