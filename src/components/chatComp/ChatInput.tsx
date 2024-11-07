'use client'

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Upload, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { uploadImageToAzure } from "@/lib/azure-storage"

interface ChatInputProps {
  onSendMessage: (message: string, image?: string) => void
  isTyping: boolean
  pendingQuestionnaire: boolean
  disabled: boolean
}

export default function ChatInput({ onSendMessage, isTyping, pendingQuestionnaire, disabled }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async () => {
    if (inputMessage.trim() || selectedImage) {
      setIsUploading(true)
      let imageUrl = ""
      if (selectedImage) {
        try {
          imageUrl = await uploadImageToAzure(selectedImage)
          console.log("Image uploaded successfully:", imageUrl)
        } catch (error) {
          console.error("Failed to upload image:", error)
          // Handle error (e.g., show a toast notification)
          setIsUploading(false)
          return
        }
      }
      onSendMessage(inputMessage, imageUrl)
      console.log("Message sent:", inputMessage, imageUrl)
      setInputMessage("")
      setSelectedImage(null)
      setImagePreview(null)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setIsUploading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-background border-t border-border rounded-t-2xl shadow-lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="flex flex-col space-y-2"
      >
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative inline-block"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-end space-x-2">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message here..."
            value={inputMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-[60px] max-h-[120px] resize-none text-lg rounded-2xl transition-shadow duration-300 ease-in-out focus:shadow-md"
            disabled={isTyping || pendingQuestionnaire || disabled || isUploading}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isTyping || pendingQuestionnaire || disabled || isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping || pendingQuestionnaire || disabled || isUploading}
            className="rounded-full transition-transform duration-300 ease-in-out hover:scale-110"
            aria-label="Upload image"
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={isTyping || pendingQuestionnaire || disabled || isUploading || (!inputMessage.trim() && !selectedImage)}
            className="rounded-full transition-transform duration-300 ease-in-out hover:scale-110"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  )
}