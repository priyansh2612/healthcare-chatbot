// components/types.ts
export type Session = {
    id: number
    name: string
    createdAt: string
  }
  
  export type MessageType = "text" | "image" | "questionnaire" | "multiQuestionnaire"
  
  export type Message = {
    id: number
    content: string
    sender: "user" | "bot"
    type: MessageType
    timestamp: Date
    image?: string
    question?: string
    options?: string[]
    questionnaireType?: 'single' | 'multiple'
    submitted?: boolean
  }