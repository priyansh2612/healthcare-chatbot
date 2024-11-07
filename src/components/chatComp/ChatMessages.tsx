'use client'

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Message } from "./types"
import MessageComponent from "./MessageComponents"
import { Button } from "@/components/ui/button"
import { Sparkles, Heart, Pill, Dumbbell } from "lucide-react"

interface ChatMessagesProps {
  messages: Message[]
  onQuestionnaireSubmit: (selected: string | string[], messageId: number) => void
  onQuestionnaireSkip: (messageId: number) => void
}

const WelcomeMessage = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center h-full text-center p-6"
  >
    <h2 className="text-4xl font-bold text-primary mb-6">
      Welcome to Sanjeevani
    </h2>
    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
      Your personal medical assistant is here to help. Start a conversation by
      typing your health-related question below or choose from our suggested
      topics.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
      {[
        { name: "General Health", icon: <Sparkles className="mr-2 h-5 w-5" /> },
        { name: "Symptoms", icon: <Heart className="mr-2 h-5 w-5" /> },
        { name: "Medications", icon: <Pill className="mr-2 h-5 w-5" /> },
        { name: "Lifestyle", icon: <Dumbbell className="mr-2 h-5 w-5" /> },
      ].map((topic) => (
        <Button
          key={topic.name}
          variant="outline"
          className="text-lg py-6 px-8 h-auto transition-all duration-300 ease-in-out hover:scale-105 hover:bg-primary hover:text-primary-foreground"
          onClick={() => onTopicSelect(topic.name)}
        >
          {topic.icon}
          {topic.name}
        </Button>
      ))}
    </div>
  </motion.div>
)

const onTopicSelect = (topic: string) => {
  console.log(`Selected topic: ${topic}`)
  // Implement the logic to handle topic selection
}

export default function ChatMessages({ messages, onQuestionnaireSubmit, onQuestionnaireSkip }: ChatMessagesProps) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      <AnimatePresence>
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={String(message.timestamp)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}
            >
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                <MessageComponent
                  message={message}
                  onQuestionnaireSubmit={onQuestionnaireSubmit}
                  onQuestionnaireSkip={onQuestionnaireSkip}
                />
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}