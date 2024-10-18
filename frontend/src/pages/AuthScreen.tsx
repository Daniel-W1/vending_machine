import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { login, signup } from "@/services/api/auth"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/useToast"

export default function AuthScreen() {
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    role: "buyer",
  })

  
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setLoginData(prev => ({ ...prev, [id]: value }))
  }
  
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setSignupData(prev => ({ ...prev, [id.replace('signup-', '')]: value }))
  }
  
  const handleRoleChange = (value: string) => {
    setSignupData(prev => ({ ...prev, role: value }))
  }
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const response = await login(loginData.username, loginData.password)
    if (response.success) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      navigate("/vending-machine")
    } else {
      toast({
        title: "Login Failed",
        description: response.message as string,
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }
  
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const response = await signup(signupData.username, signupData.password, signupData.role)
    if (response.success) {
      toast({
        title: "Signup Success",
        description: 'Please login to continue',
        variant: "default",
      })
    } else {
      toast({
        title: "Signup Failed",
        description: response.message as string,
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gray-200 p-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Virtual Vend</h1>
          <p className="text-sm text-gray-600">Your Online Vending Machine</p>
        </div>
        <div className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2 ">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    required
                    type="text"
                    value={loginData.username}
                    onChange={handleLoginChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    required
                    type="password"
                    placeholder="********"
                    value={loginData.password}
                    onChange={handleLoginChange}
                  />
                </div>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white" type="submit">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Insert Coin (Login)"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form className="space-y-4" onSubmit={handleSignup}>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    placeholder="johndoe"
                    required
                    value={signupData.username}
                    onChange={handleSignupChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    required
                    type="password"
                    placeholder="********"
                    value={signupData.password}
                    onChange={handleSignupChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={handleRoleChange} value={signupData.role}>
                    <SelectTrigger className="w-full rounded-md">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white w-full">
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white" type="submit">
                  {isLoading ? <Loader2 className="animate-spin" /> : "Get Your Vend Card (Sign Up)"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        <div className="bg-gray-100 p-4">
          <div className="text-center text-sm text-gray-600">
            <p>Choose your favorite digital snacks and drinks!</p>
            <p className="mt-2">© 2024 Virtual Vend. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}