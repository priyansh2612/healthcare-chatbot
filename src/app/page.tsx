'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Heart, Shield, Zap, Sun, Moon } from 'lucide-react'
import { useTheme } from "next-themes"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const letterAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        type: "spring",
        stiffness: 400,
        damping: 25,
      }
    })
  };

  const words = ["Welcome", "to", "Sanjeevani"];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 overflow-hidden relative">
      <Button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2"
        variant="ghost"
        size="icon"
      >
        {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span className="sr-only">Toggle theme</span>
      </Button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-8 sm:mb-12"
      >
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-primary flex flex-wrap justify-center"
          initial="hidden"
          animate="visible"
        >
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block mx-1">
              {word.split("").map((char, charIndex) => (
                <motion.span key={charIndex} custom={wordIndex * 10 + charIndex} variants={letterAnimation}>
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h1>
        <motion.p 
          className="text-lg sm:text-xl mb-6 sm:mb-8 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Your personal medical assistant powered by AI
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mb-8 sm:mb-12">
        <motion.div
          className="bg-card text-card-foreground rounded-lg shadow-lg p-4 sm:p-6 border border-border"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <img
            src="https://sanjeevani123456.blob.core.windows.net/image/landing.jpeg"
            alt="AI Medical Assistant"
            width={400}
            className="rounded-lg mb-4 w-full h-auto"
          />
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">AI-Powered Assistance</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Get instant medical advice and support from our advanced AI system.</p>
        </motion.div>

        <motion.div
          className="space-y-4 sm:space-y-6"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-4 sm:p-6 border border-border hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-2">
              <Heart className="text-destructive mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              <h3 className="text-lg sm:text-xl font-semibold">Personalized Care</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">Tailored medical advice based on your unique health profile.</p>
          </div>
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-4 sm:p-6 border border-border hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-2">
              <Shield className="text-primary mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              <h3 className="text-lg sm:text-xl font-semibold">Secure & Private</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">Your health data is protected with state-of-the-art security measures.</p>
          </div>
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-4 sm:p-6 border border-border hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-2">
              <Zap className="text-secondary mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              <h3 className="text-lg sm:text-xl font-semibold">24/7 Availability</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">Access medical assistance anytime, anywhere.</p>
          </div>
        </motion.div>
      </div>

      <div className="space-y-4 w-full max-w-md px-4 sm:px-0">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4, type: "spring", stiffness: 300, damping: 15 }}
        >
          <Link href="/login" className="block">
            <Button className="w-full text-base sm:text-lg py-4 sm:py-6 shadow-lg hover:shadow-xl transition-shadow duration-300" variant="default">
              Login
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </motion.div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4, type: "spring", stiffness: 300, damping: 15 }}
        >
          <Link href="/signup" className="block">
            <Button className="w-full text-base sm:text-lg py-4 sm:py-6 shadow-lg hover:shadow-xl transition-shadow duration-300" variant="outline">
              Sign Up
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.footer
        className="mt-8 sm:mt-16 text-center text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
      >
        <p className="text-sm sm:text-base">&copy; 2023 Sanjeevani. All rights reserved.</p>
        <div className="mt-2 text-sm sm:text-base">
          <Link href="/privacy" className="text-primary hover:underline mr-4">Privacy Policy</Link>
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
        </div>
      </motion.footer>
    </main>
  )
}