// components/ImprovedChatComponent.tsx
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
} from "lucide-react"
import Link from "next/link"
import { ChatMessages } from "./ChatMessages"
import { ChatInput } from "./ChatInput"
import Sidebar from "./Sidebar"
import { cn } from "@/lib/utils"
import { Session, Message, MessageType } from "./types"

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <h2 className="text-3xl font-bold text-primary mb-6">
      Welcome to Sanjeevani
    </h2>
    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
      Your personal medical assistant is here to help. Start a conversation by
      typing your health-related question below or choose from our suggested topics.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      {["General Health", "Symptoms", "Medications", "Lifestyle"].map((topic) => (
        <Button
          key={topic}
          variant="outline"
          className="text-lg py-6 px-8 h-auto"
          onClick={() => console.log(`Selected topic: ${topic}`)}
        >
          {topic}
        </Button>
      ))}
    </div>
  </div>
)

const TypingAnimation = () => (
  <div className="flex space-x-2 items-center p-4 bg-secondary rounded-lg">
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
  </div>
)

export default function ImprovedChatComponent() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      name: "General Consultation",
      messages: [],
      createdAt: new Date(),
    },
    { id: 2, name: "Medication Inquiry", messages: [], createdAt: new Date() },
    { id: 3, name: "Symptom Check", messages: [], createdAt: new Date() },
  ])
  const [currentSession, setCurrentSession] = useState<Session>(sessions[0])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [pendingQuestionnaire, setPendingQuestionnaire] = useState(false)
  const { theme, setTheme } = useTheme()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  const dummyResponses = [
    {
      type: "text",
      content:
        "I understand your concern. Could you provide more details about your symptoms?",
    },
    {
      type: "questionnaire",
      content: "Please answer the following question:",
      question: "How would you rate your current stress level?",
      options: ["Low", "Moderate", "High", "Very High"],
    },
    {
      type: "multiQuestionnaire",
      content: "Please select all that apply:",
      question: "Which of the following symptoms are you experiencing?",
      options: ["Headache", "Fever", "Cough", "Fatigue", "Nausea"],
    },
  ]

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

  const handleSendMessage = (message: string, image?: File) => {
    if (message.trim() || image) {
      const newMessage: Message = {
        id: currentSession.messages.length + 1,
        content: message,
        sender: "user",
        type: image ? "image" : "text",
        timestamp: new Date(),
        image: image ? URL.createObjectURL(image) : undefined,
      }
      updateSessionMessages(newMessage)
      simulateBotResponse()
    }
  }

  const simulateBotResponse = () => {
    setIsTyping(true)
    setTimeout(() => {
      const response =
        dummyResponses[Math.floor(Math.random() * dummyResponses.length)]
      const botMessage: Message = {
        id: currentSession.messages.length + 2,
        content: response.content,
        sender: "bot",
        type: response.type as MessageType,
        timestamp: new Date(),
        question: response.question,
        options: response.options,
        questionnaireType:
          response.type === "questionnaire" ? "single" : "multiple",
        submitted: false,
      }
      updateSessionMessages(botMessage)
      setIsTyping(false)
      if (
        response.type === "questionnaire" ||
        response.type === "multiQuestionnaire"
      ) {
        setPendingQuestionnaire(true)
      }
    }, 2000)
  }

  const handleQuestionnaireSubmit = (
    selected: string | string[],
    messageId: number
  ) => {
    const userMessage: Message = {
      id: currentSession.messages.length + 1,
      content: Array.isArray(selected) ? selected.join(", ") : selected,
      sender: "user",
      type: "text",
      timestamp: new Date(),
    }

    const updatedMessages = currentSession.messages.map((msg) =>
      msg.id === messageId
        ? { ...msg, type: "text", content: msg.question || "", submitted: true }
        : msg
    )

    setCurrentSession((prev) => ({
      ...prev,
      messages: [...updatedMessages, userMessage],
    }))

    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSession.id
          ? {
              ...session,
              messages: [...updatedMessages, userMessage],
            }
          : session
      )
    )

    setPendingQuestionnaire(false)
    simulateBotResponse()
  }

  const handleQuestionnaireSkip = (messageId: number) => {
    const userMessage: Message = {
      id: currentSession.messages.length + 1,
      content: "Skipped questionnaire",
      sender: "user",
      type: "text",
      timestamp: new Date(),
    }

    const updatedMessages = currentSession.messages.map((msg) =>
      msg.id === messageId
        ? { ...msg, type: "text", content: msg.question || "", submitted: true }
        : msg
    )

    setCurrentSession((prev) => ({
      ...prev,
      messages: [...updatedMessages, userMessage],
    }))

    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSession.id
          ? {
              ...session,
              messages: [...updatedMessages, userMessage],
            }
          : session
      )
    )

    setPendingQuestionnaire(false)
    simulateBotResponse()
  }

  const createNewSession = () => {
    const newSession: Session = {
      id: sessions.length + 1,
      name: `New Session ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
    }
    setSessions([...sessions, newSession])
    setCurrentSession(newSession)
  }

  const updateSessionMessages = (newMessage: Message) => {
    setCurrentSession((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }))
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSession.id
          ? { ...session, messages: [...session.messages, newMessage] }
          : session
      )
    )
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleSessionSwitch = (session: Session) => {
    setIsTyping(false)
    setPendingQuestionnaire(false)
    setCurrentSession(session)
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleSessionSwitch={handleSessionSwitch}
        createNewSession={createNewSession}
      />

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-col flex-1 h-screen",
          isSidebarOpen ? "ml-0 lg:ml-80" : "ml-0",
          "transition-all duration-300 ease-in-out"
        )}
      >
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-background border-b border-border">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-4"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-6 w-6" />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </Button>
            <h1 className="text-xl font-semibold">{currentSession.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={createNewSession}
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="User"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm">
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <LogOut className="mr-3 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-5"
            style={{
              backgroundImage:
                "url('https://www.chla.org/sites/default/files/styles/3x2_two_thirds/public/2023-03/837847_CHLA.org_Connected-Care-Pattern.jpg.webp?itok=ftdHKcED')",
            }}
          ></div>
          {currentSession.messages.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h1 className="text-9xl font-bold text-primary/5">Sanjeevani</h1>
            </div>
          )}
          <ScrollArea className="h-full p-4 relative z-10" ref={scrollAreaRef}>
            {currentSession.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <WelcomeMessage />
              </div>
            ) : (
              <ChatMessages
                messages={currentSession.messages}
                onQuestionnaireSubmit={handleQuestionnaireSubmit}
                onQuestionnaireSkip={handleQuestionnaireSkip}
              />
            )}
            {isTyping && (
              <div className="flex items-center space-x-2 p-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/bot-avatar.png" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <TypingAnimation />
              </div>
            )}
          </ScrollArea>
          {showScrollToBottom && (
            <Button
              className="absolute bottom-20 right-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110"
              onClick={scrollToBottom}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          pendingQuestionnaire={pendingQuestionnaire}
        />
      </div>
    </div>
  )
}