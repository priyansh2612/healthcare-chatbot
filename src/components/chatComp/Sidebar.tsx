'use client'

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, LogOut, X, Calendar, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isThisWeek, isThisMonth } from "date-fns"
import { Session } from "./types"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  sessions: Session[]
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  handleSessionSwitch: (session: Session) => void
  createNewSession: () => void
  handleLogout: () => void
}

export default function Sidebar({
  sessions,
  isSidebarOpen,
  setIsSidebarOpen,
  handleSessionSwitch,
  createNewSession,
  handleLogout,
}: SidebarProps) {
  const [groupedSessions, setGroupedSessions] = useState<{ [key: string]: Session[] }>({
    "This Week": [],
    "This Month": [],
    "Older": [],
  })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const grouped: { [key: string]: Session[] } = {
      "This Week": [],
      "This Month": [],
      "Older": [],
    }

    if (Array.isArray(sessions) && sessions.length > 0) {
      sessions.forEach((session) => {
        if (session && session.createdAt) {
          const createdAt = new Date(session.createdAt)
          if (!isNaN(createdAt.getTime())) {
            if (isThisWeek(createdAt)) {
              grouped["This Week"].push(session)
            } else if (isThisMonth(createdAt)) {
              grouped["This Month"].push(session)
            } else {
              grouped["Older"].push(session)
            }
          } else {
            console.error("Invalid date for session:", session)
            setError("Error processing session dates. Please try refreshing the page.")
          }
        } else {
          console.error("Invalid session object:", session)
          setError("Error loading sessions. Please try again later.")
        }
      })
    }

    setGroupedSessions(grouped)
  }, [sessions])

  const handleLogoutClick = () => {
    try {
      handleLogout()
      router.push('/login')
    } catch (error) {
      console.error("Logout failed:", error)
      setError("Logout failed. Please try again.")
    }
  }

  return (
    <motion.aside
      initial={{ x: "-100%" }}
      animate={{ x: isSidebarOpen ? 0 : "-100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-80 flex-col",
        "bg-background border-r border-border"
      )}
    >
      <div className="flex items-center justify-between p-6">
        <h2 className="text-3xl font-bold text-primary">Sanjeevani</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close sidebar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="px-6 text-lg text-muted-foreground mb-4">
        Your Medical Assistant
      </p>
      <ScrollArea className="flex-grow px-2">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-4 mx-2"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-6 p-2">
          {Object.entries(groupedSessions).some(([_, sessions]) => sessions.length > 0) ? (
            Object.entries(groupedSessions).map(([period, periodSessions]) => (
              <motion.div
                key={period}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <h3 className="text-sm font-semibold text-muted-foreground uppercase py-2 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {period}
                </h3>
                {periodSessions.length > 0 ? (
                  periodSessions
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((session) => (
                      <TooltipProvider key={String(session.createdAt)}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left text-sm py-2 px-4 hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
                              onClick={() => handleSessionSwitch(session)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{session.name || "Unnamed Session"}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{format(new Date(session.createdAt), 'PPpp')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground px-4 py-2">No sessions in this period</p>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-40 text-center"
            >
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No sessions yet</p>
              <p className="text-sm text-muted-foreground">Start a new conversation to begin</p>
            </motion.div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start text-base py-4 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
          onClick={createNewSession}
        >
          <Plus className="mr-3 h-4 w-4" />
          New Session
        </Button>
      </div>
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-base py-4 text-destructive hover:text-destructive hover:bg-destructive/30 transition-colors duration-300"
          onClick={handleLogoutClick}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </motion.aside>
  )
}