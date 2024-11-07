'use client'

import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Message } from "./types"
import QuestionnaireResponse from "./QuestionaireResponse"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import Latex from 'react-latex-next'
import 'katex/dist/katex.min.css'

interface MessageComponentProps {
  message: Message
  onQuestionnaireSubmit: (selected: string | string[], messageId: number) => void
  onQuestionnaireSkip: (messageId: number) => void
}

export default function MessageComponent({ message, onQuestionnaireSubmit, onQuestionnaireSkip }: MessageComponentProps) {
  const renderContent = (content: string) => {
    const parts = content.split(/(\$\$.*?\$\$)/g)
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return <Latex key={index}>{part}</Latex>
      } else {
        return (
          <span key={index}>
            {part.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </span>
        )
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-2 mb-4 ${
        message.sender === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
      }`}
    >
      <Avatar className="w-10 h-10 flex-shrink-0">
        {message.sender === "bot" ? (
          <AvatarImage src="/bot-avatar.png" alt="Bot" />
        ) : (
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
        )}
        <AvatarFallback>{message.sender === "bot" ? "B" : "U"}</AvatarFallback>
      </Avatar>
      <Card className={`max-w-[80%] ${
        message.sender === "user"
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      }`}>
        <CardContent className="p-3">
          {message.type === "text" && (
            <div className="text-lg leading-relaxed latex-content">
              {renderContent(message.content)}
            </div>
          )}
          {(message.type === "questionnaire" || message.type === "multiQuestionnaire") && 
           message.question && message.options && !message.submitted && (
            <QuestionnaireResponse
              question={message.question}
              options={message.options}
              type={message.type === "questionnaire" ? "single" : "multiple"}
              onSubmit={(selected: string | string[]) => onQuestionnaireSubmit(selected, message.id)}
              onSkip={() => onQuestionnaireSkip(message.id)}
            />
          )}
          {(message.type === "questionnaire" || message.type === "multiQuestionnaire") && 
           message.submitted && (
            <p className="text-lg font-medium">{message.question}</p>
          )}
          {message.type === "image" && (
            <div className="mt-2">
              <img 
                src={message.image} 
                alt={message.content} 
                className="rounded-lg w-60 max-w-full h-auto shadow-md hover:shadow-lg transition-shadow duration-300"
              />
              <p className="mt-2 text-sm text-muted-foreground">{message.content}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}