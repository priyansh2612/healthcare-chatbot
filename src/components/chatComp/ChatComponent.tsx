'use client'

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import {
  User,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Session, Message } from "./types"
import Sidebar from "./Sidebar"
import ChatInput from "./ChatInput"
import ChatMessages from "./ChatMessages"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { useRouter } from 'next/navigation'
import { addSession, updateSession, addMessage, clearUser, updateCurrentSession, setSession } from '@/store/slices/userSlice'
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <h2 className="text-3xl font-bold text-primary mb-6">
      Welcome to Sanjeevani
    </h2>
    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
      Your personal medical assistant is here to help. Start a conversation by
      selecting an existing session or creating a new one.
    </p>
  </div>
)

const TypingAnimation = () => (
  <div className="flex space-x-2 items-center p-4 bg-secondary rounded-lg">
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
    <div
      className="w-2 h-2 bg-primary rounded-full animate-bounce"
      style={{ animationDelay: "0.2s" }}
    ></div>
    <div
      className="w-2 h-2 bg-primary rounded-full animate-bounce"
      style={{ animationDelay: "0.4s" }}
    ></div>
  </div>
)

export default function ChatComponent() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)
  const { sessions, currentSession, token, isAuthenticated } = useAppSelector((state) => state.user)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [pendingQuestionnaire, setPendingQuestionnaire] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/login")
    } else {
      fetchSessions()
    }
  }, [isAuthenticated, router])

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://10.145.11.133:5001/session1', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }
      const data = await response.json()
      dispatch(setSession(data))
      console.log("Fetched sessions:", data)
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
      setError("Failed to fetch sessions. Please try again later.")
      toast.error("Failed to fetch sessions. Please try again later.")
    }
  }

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
        setShowScrollToBottom(scrollTop < scrollHeight - clientHeight - 100)
      }
    }

    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.addEventListener("scroll", checkScroll)
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener("scroll", checkScroll)
      }
    }
  }, [])

  // In your main ChatComponent file

const handleSendMessage = async (message: string, imageUrl?: string) => {
  if (currentSession.id === -1) {
    toast.error("Please select or create a session before sending a message.")
    return
  }

  if (message.trim() || imageUrl) {
    const newMessage: Message = {
      id: Date.now(),
      content: message,
      sender: "user",
      type: imageUrl ? "image" : "text",
      timestamp: new Date(),
      image: imageUrl,
    }
    try {
      dispatch(addMessage({ sessionId: currentSession.id, message: newMessage }))
      setIsTyping(true)
      const response = await fetch("http://10.145.11.133:5001/ollama", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          "id": currentSession.id, 
          message: message,
          image: imageUrl 
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      const data = await response.json()
      const resMessage: Message = {
        id: Date.now(),
        content: data.message,
        sender: "bot",
        type: "text",
        timestamp: new Date(),
      }

      setIsTyping(false)
      dispatch(addMessage({ sessionId: currentSession.id, message: resMessage }))
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message. Please try again.")
    }
  }
}

  const handleQuestionnaireSubmit = (
    selected: string | string[],
    messageId: number
  ) => {
    if (currentSession.id === -1) return

    const userMessage: Message = {
      id: Date.now(),
      content: Array.isArray(selected) ? selected.join(", ") : selected,
      sender: "user",
      type: "text",
      timestamp: new Date(),
    }

    type MessageType = "text" | "image" | "questionnaire" | "multiQuestionnaire"

    const updatedMessages = currentSession.messages.map((msg) =>
      msg.id === messageId
        ? {
            ...msg,
            type: msg.type as MessageType,
            content: msg.question || "",
            submitted: true,
          }
        : msg
    )

    dispatch(updateCurrentSession({
      ...currentSession,
      messages: [...updatedMessages, userMessage]
    }))

    setPendingQuestionnaire(false)
    handleSendMessage(userMessage.content)
  }

  const handleQuestionnaireSkip = (messageId: number) => {
    if (currentSession.id === -1) return

    const userMessage: Message = {
      id: Date.now(),
      content: "Skipped questionnaire",
      sender: "user",
      type: "text",
      timestamp: new Date(),
    }

    type MessageType = "text" | "image" | "questionnaire" | "multiQuestionnaire"

    const updatedMessages = currentSession.messages.map((msg) =>
      msg.id === messageId
        ? {
            ...msg,
            type: msg.type as MessageType,
            content: msg.question || "",
            submitted: true,
          }
        : msg
    )

    dispatch(updateCurrentSession({
      ...currentSession,
      messages: [...updatedMessages, userMessage]
    }))

    setPendingQuestionnaire(false)
    handleSendMessage(userMessage.content)
  }

  const createNewSession = async () => {
    try {
      const sessname = `New Session ${sessions.length + 1}`
      const response = await fetch('http://10.145.11.133:5001/session1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: sessname }),
      })
      if (!response.ok) {
        throw new Error('Failed to create new session')
      }
      const newSession = await response.json()
      dispatch(addSession(newSession))
      dispatch(updateCurrentSession({
        id: newSession.id,
        name: sessname,
        messages: [],
        createdAt: String(new Date(newSession.createdAt))
      }))
      toast.success("New session created successfully!")
    } catch (error) {
      console.error("Failed to create new session:", error)
      toast.error("Failed to create new session. Please try again.")
    }
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleSessionSwitch = async (session: Session) => {
    setIsTyping(false)
    setPendingQuestionnaire(false)
    try {
      const response = await fetch(`http://10.145.11.133:5001/getchatfromsession`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        method: 'POST',
        body: JSON.stringify({ id: session.id }),
      })
      if (!response.ok) {
        throw new Error('Failed to fetch session messages')
      }
      const messages = await response.json()
      dispatch(updateCurrentSession({
        id: session.id,
        name: session.name,
        messages: messages,
        createdAt: String(new Date(session.createdAt))
      }))
      console.log("Fetched session messages:", messages)
      scrollToBottom()
    } catch (error) {
      console.error("Failed to fetch session messages:", error)
      toast.error("Failed to load session messages. Please try again.")
    }
  }

  const handleLogout = () => {
    dispatch(clearUser())
    router.push('/login')
  }

  const renderDefaultView = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <WelcomeMessage />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
        <Button
          variant="outline"
          className="text-lg py-6 px-8 h-auto rounded-xl transition-all duration-300 ease-in-out hover:scale-105"
          onClick={createNewSession}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Session
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="text-lg py-6 px-8 h-auto rounded-xl transition-all duration-300 ease-in-out hover:scale-105"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Select Existing Session
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {sessions && sessions.length > 0 ? (
              sessions.map((session) => (
                <DropdownMenuItem key={session.id} onSelect={() => handleSessionSwitch(session)}>
                  {session.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No sessions available</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const handleLogoutClick = () => {
    handleLogout()
  }

  return (
    <div className="flex h-screen w-full">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar
        sessions={sessions}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleSessionSwitch={handleSessionSwitch}
        createNewSession={createNewSession}
        handleLogout={handleLogoutClick}
      />

      <motion.div
        className={cn(
          "flex flex-col flex-1 h-screen",
          isSidebarOpen ? "ml-0 lg:ml-80" : "ml-0",
          "transition-all duration-300 ease-in-out"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <header className="flex justify-between items-center p-4 bg-background border-b border-border rounded-b-2xl shadow-md">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4 rounded-full transition-transform duration-300 ease-in-out hover:scale-110"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-6 w-6" />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </Button>
            <h1 className="text-xl font-semibold">{currentSession.id !== -1 ? currentSession.name : "No Session Selected"}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={createNewSession}
              className="rounded-full transition-transform duration-300 ease-in-out hover:scale-110"
            >
              <Plus className="h-5 w-5" />
            </Button>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full transition-transform duration-300 ease-in-out hover:scale-110"
              >
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full transition-transform duration-300 ease-in-out hover:scale-110">
                  <Avatar>
                    <AvatarImage
                      src={user.profileURL ||"/placeholder.svg?height=32&width=32"}
                      alt="User"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="text-sm">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm rounded-lg transition-colors duration-300 ease-in-out">
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-sm rounded-lg transition-colors duration-300 ease-in-out"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-5 transition-opacity duration-300 ease-in-out"
            style={{
              backgroundImage:
                "url('https://www.chla.org/sites/default/files/styles/3x2_two_thirds/public/2023-03/837847_CHLA.org_Connected-Care-Pattern.jpg.webp?itok=ftdHKcED')",
            }}
          ></div>
          {currentSession.id !== -1 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h1 className="text-9xl font-bold text-primary/5 transition-opacity duration-300 ease-in-out">Sanjeevani</h1>
            </div>
          )}
          <ScrollArea className="h-full p-4 relative z-10" ref={scrollAreaRef}>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {currentSession.id === -1 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center h-full"
                >
                  {renderDefaultView()}
                </motion.div>
              ) : (
                <ChatMessages
                  messages={currentSession.messages || []}
                  onQuestionnaireSubmit={handleQuestionnaireSubmit}
                  onQuestionnaireSkip={handleQuestionnaireSkip}
                />
              )}
            </AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-2 p-4"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/bot-avatar.png" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <TypingAnimation />
              </motion.div>
            )}
          </ScrollArea>
          <AnimatePresence>
            {showScrollToBottom && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  className="absolute bottom-20 right-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110"
                  onClick={scrollToBottom}
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {currentSession.id!=-1 && <ChatInput
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          pendingQuestionnaire={pendingQuestionnaire}
          disabled={currentSession.id === -1}
        />}
      </motion.div>
    </div>
  )
}