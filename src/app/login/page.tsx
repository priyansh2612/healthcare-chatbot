'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Sun, Moon, ChevronRight, Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { LoadingButton } from "@/components/LoadingButton"
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/slices/userSlice'
import Link from 'next/link'
import { ErrorBoundary } from 'react-error-boundary'

type LoginResponse = {
  access_token: string
  message?: string
}

type UserProfile = {
  profileURL: string
  email: string
  username: string
  birthdate: string
  gender: string
  weight: string
  height: string
  bloodType: string
  activityLevel: string
  allergies: string
  medications: string
  emergencyContact: string
  bio: string
  diet: string
  medicalRecords: Array<{
    id: string
    name: string
    date: string
    url: string
  }>
}

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Oops! Something went wrong.</h1>
      <p className="text-red-500 mb-4 text-center">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('http://10.145.11.133:5001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const data: LoginResponse = await response.json()
      
      if (response.ok) {
        dispatch(setUser({ email, token: data.access_token, isAuthenticated: true }))
        toast.success('Login successful! Welcome to Sanjeevani.', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })

        try {
          const res1 = await fetch('http://10.145.11.133:5001/userprofile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.access_token}`
            },
          })

          if (!res1.ok) {
            throw new Error('Failed to fetch user profile')
          }

          const userData: UserProfile = await res1.json()
          dispatch(setUser({ ...userData, token: data.access_token, isAuthenticated: true }))
          router.push("/chat")
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError)
          toast.error('Failed to fetch user profile. Please try again.', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        }
      } else {
        throw new Error(data.message || 'Login failed. Please check your credentials and try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  if (!mounted) return null

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {
      setEmail("")
      setPassword("")
      setIsLoading(false)
    }}>
      <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground transition-colors duration-300">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="lg:w-1/2 relative bg-primary p-8 lg:p-12 slide-in-left">
          <div className="h-full flex flex-col justify-between">
            <div className="text-primary-foreground">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 flex items-center">
                <Heart className="mr-4 h-10 w-10 lg:h-16 lg:w-16" />
                Sanjeevani
              </h1>
              <p className="text-xl lg:text-3xl mb-8 fade-in">Your AI-powered medical assistant</p>
            </div>
            <div className="hidden md:block space-y-4 text-lg lg:text-xl text-primary-foreground fade-in">
              <p>Welcome back to Sanjeevani! Log in to access your personalized health recommendations and connect with healthcare professionals.</p>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8 slide-in-right">
          <div className="w-full max-w-md">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-primary">Login</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </header>
            <Card className="border-2 border-primary/20 shadow-xl transition-all duration-300">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                <p className="text-sm text-muted-foreground text-center">Enter your credentials to access your account</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <LoadingButton
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                    {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
                  </LoadingButton>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline transition-colors duration-200">
                  Forgot password?
                </Link>
                <p className="text-sm text-center">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline font-medium transition-colors duration-200">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
          <footer className="mt-8 text-center text-muted-foreground">
            <p className="text-sm">© 2023 Sanjeevani. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  )
}