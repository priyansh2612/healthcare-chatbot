"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Sun, Moon, ChevronRight, ChevronLeft, User, Calendar, Activity, Droplet, Heart, Mail, Pill, Phone, FileText, Upload, File, Trash2, Camera } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateUser, addMedicalRecord, removeMedicalRecord } from '@/store/slices/userSlice'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { ErrorBoundary } from 'react-error-boundary'
import { uploadImageToAzure } from "@/lib/azure-storage"

type UserData = {
  profileURL: string
  username: string
  email: string
  bio: string
  diet: string
  weight: string
  height: string
  birthdate: string
  gender: string
  activityLevel: string
  bloodType: string
  allergies: string
  medications: string
  emergencyContact: string
}

type MedicalRecord = {
  id: string
  name: string
  date: string
  url: string
}

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
      <p className="text-red-500 mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  )
}

export default function GettingStarted() {
  const profilePictureInputRef = useRef<HTMLInputElement>(null)
  const user = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<UserData>({
    profileURL: user.profileURL || '',
    username: user.username || '',
    email: user.email || '',
    birthdate: user.birthdate || '',
    gender: user.gender || '',
    weight: user.weight || '',
    height: user.height || '',
    bloodType: user.bloodType || '',
    activityLevel: user.activityLevel || '',
    allergies: user.allergies || '',
    medications: user.medications || '',
    emergencyContact: user.emergencyContact || '',
    bio: user.bio || '',
    diet: user.diet || '',
  })
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(user.medicalRecords || [])
  const [errors, setErrors] = useState<Partial<UserData>>({})
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    console.log(user)
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validateField(name, value)
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData({ ...formData, [field]: value })
    validateField(field, value)
  }

  const validateField = (name: string, value: string) => {
    let error = ''
    switch (name) {
      case 'username':
        if (value.length < 3) error = 'Username must be at least 3 characters long'
        break
      case 'birthdate':
        if (!value) error = 'Birthdate is required'
        break
      case 'weight':
        if (isNaN(Number(value)) || Number(value) <= 0) error = 'Please enter a valid weight'
        break
      case 'height':
        if (isNaN(Number(value)) || Number(value) <= 0) error = 'Please enter a valid height'
        break
      case 'emergencyContact':
        if (!/^\+?[\d\s-]{10,}$/.test(value)) error = 'Please enter a valid phone number'
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleNext = () => {
    const currentStepFields = getStepFields(step)
    const stepErrors = currentStepFields.reduce((acc, field) => {
      validateField(field, formData[field as keyof UserData])
      return { ...acc, [field]: errors[field as keyof UserData] }
    }, {})

    if (Object.values(stepErrors).some(error => error)) {
      toast.error('Please correct the errors before proceeding.', {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    if (step < 5) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      try {
        setIsLoading(true)
        const fileUrl = await uploadImageToAzure(file)
        console.log("Profile picture URL:", fileUrl)
        
        const updatedFormData = { ...formData, profileURL: fileUrl }
        setFormData(updatedFormData)
        
        // Update the user profile with the new profile picture URL
        const response = await fetch('http://10.145.11.133:5001/userprofile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profileURL: fileUrl }),
        })

        if (!response.ok) {
          throw new Error('Failed to update profile picture')
        }

        // Update the Redux store
        dispatch(updateUser({ profileURL: fileUrl }))

        toast.success('Profile picture uploaded successfully!', {
          position: "top-right",
          autoClose: 3000,
        })
      } catch (error) {
        console.error('Error uploading profile picture:', error)
        toast.error('Failed to upload profile picture. Please try again.', {
          position: "top-right",
          autoClose: 5000,
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 1: return ['username', 'birthdate']
      case 2: return ['gender', 'weight', 'height']
      case 3: return ['bloodType', 'activityLevel', 'allergies']
      case 4: return ['medications', 'emergencyContact', 'bio']
      case 5: return []
      default: return []
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      if (!formData.username || !formData.email) {
        throw new Error('Username and email are required')
      }
      console.log(user)
      const token = user.token
      const dataToSend = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        birthdate: formData.birthdate || null,
        gender: formData.gender || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        bloodType: formData.bloodType || null,
        activityLevel: formData.activityLevel || null,
        allergies: formData.allergies || [],
        medications: formData.medications || [],
        emergencyContact: formData.emergencyContact || null,
        bio: formData.bio ? formData.bio.trim() : null,
      }
  
      console.log('Data being sent:', JSON.stringify(dataToSend))

      
  
      const response = await fetch('http://10.145.11.133:5001/userprofile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
  
      const data = await response.json()
      dispatch(updateUser(formData))
      
      toast.success('Profile created successfully! Welcome to Sanjeevani.', {
        position: "top-center",
        autoClose: 3000,
      })
      setTimeout(() => router.push('/chat'), 3500)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(`Failed to update profile: ${error.message}`, {
        position: "top-center",
        autoClose: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    toast.info('You can update your profile later.', {
      position: "top-center",
      autoClose: 2000,
    })
    setTimeout(() => router.push('/chat'), 2500)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      try {
        setIsLoading(true)
        const fileUrl = await uploadImageToAzure(file)
        const newRecord: MedicalRecord = {
          id: Date.now().toString(),
          name: file.name,
          date: new Date().toISOString().split('T')[0],
          url: fileUrl
        }
        setMedicalRecords(prevRecords => [...prevRecords, newRecord])
        dispatch(addMedicalRecord(newRecord))
        toast.success('Medical record uploaded successfully!', {
          position: "top-right",
          autoClose: 3000,
        })
      } catch (error) {
        console.error('Error uploading file:', error)
        toast.error('Failed to upload medical record. Please try again.', {
          position: "top-right",
          autoClose: 5000,
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteRecord = (id: string) => {
    setMedicalRecords(prevRecords => prevRecords.filter(record => record.id !== id))
    dispatch(removeMedicalRecord(id))
    toast.success('Medical record removed successfully!', {
      position: "top-right",
      autoClose: 3000,
    })
  }

  const progressPercentage = (step / 5) * 100

  if (!mounted) return null

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setStep(1)}>
      <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="lg:w-1/2 relative bg-primary/90 p-8 lg:p-12">
          <div className="h-full flex flex-col justify-around">
            <div className="text-primary-foreground">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 flex items-center">
                <Heart className="mr-4 h-10 w-10 lg:h-16 lg:w-16" />
                Sanjeevani
              </h1>
              <p className="text-xl lg:text-3xl mb-8">Your AI-powered medical assistant</p>
            </div>
            <div className="space-y-4 text-lg lg:text-xl text-primary-foreground">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 lg:h-8 lg:w-8" />
                <p>Personalized health recommendations</p>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 lg:h-8 lg:w-8" />
                <p>Track your fitness progress</p>
              </div>
              <div className="flex items-center space-x-3">
                <Pill className="h-6 w-6 lg:h-8 lg:w-8" />
                <p>Medication reminders</p>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 lg:h-8 lg:w-8" />
                <p>Connect with healthcare professionals</p>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 flex flex-col p-4 lg:p-8">
          <header className="flex justify-between items-center mb-4 lg:mb-8">
            <h2 className="text-2xl lg:text-4xl font-bold text-primary">Getting Started</h2>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:bg-accent hover:text-accent-foreground"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="outline" onClick={handleSkip} className="text-sm lg:text-base">
                Skip for now
              </Button>
            </div>
          </header>
          <Card className="flex-grow border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4 relative">
              <Avatar className="h-16 w-16 lg:h-24 lg:w-24">
                <AvatarImage src={formData.profileURL || "/placeholder.svg?height=96&width=96"} alt={formData.username} />
                <AvatarFallback>{formData.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={() => profilePictureInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={profilePictureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureUpload}
              />
            </div>
              <CardTitle className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                Welcome, {formData.username || 'Friend'}!
              </CardTitle>
              <p className="text-lg lg:text-xl text-muted-foreground">
                Let's set up your medical profile
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Step {step} of 5
              </p>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="mt-1"
                      readOnly
                    />
                    {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthdate">Date of Birth</Label>
                    <Input
                      id="birthdate"
                      name="birthdate"
                      type="date"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      max={today}
                      className="mt-1"
                    />
                    {errors.birthdate && <p className="text-sm text-red-500 mt-1">{errors.birthdate}</p>}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => handleSelectChange(value, 'gender')} value={formData.gender}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    {errors.weight && <p className="text-sm text-red-500 mt-1">{errors.weight}</p>}
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    {errors.height && <p className="text-sm text-red-500 mt-1">{errors.height}</p>}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Input
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select onValueChange={(value) => handleSelectChange(value, 'activityLevel')} value={formData.activityLevel}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sedentary">Sedentary</SelectItem>
                        <SelectItem value="Light">Light</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Very Active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="medications">Medications</Label>
                    <Textarea
                      id="medications"
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    {errors.emergencyContact && <p className="text-sm text-red-500 mt-1">{errors.emergencyContact}</p>}
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              )}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Uploaded Medical Records</h3>
                    {medicalRecords.length > 0 ? (
                      <ul className="space-y-2">
                        {medicalRecords.map((record) => (
                          <li key={record.id} className="flex items-center justify-between bg-background p-2 rounded-md">
                            <div className="flex items-center">
                              <File className="h-4 w-4 mr-2 text-primary" />
                              <span className="text-sm">{record.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">{record.date}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRecord(record.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No medical records uploaded yet.</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center w-full h-24 px-4 transition bg-background border-2 border-border border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none">
                        <span className="flex items-center space-x-2">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="font-medium text-muted-foreground">
                            {isLoading ? 'Uploading...' : 'Click to upload medical records'}
                          </span>
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept="image/*,application/pdf"
                          disabled={isLoading}
                          ref={fileInputRef}
                        />
                      </div>
                    </Label>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between p-4 lg:p-6">
              {step > 1 && (
                <Button onClick={handleBack} variant="outline" className="flex items-center">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`ml-auto ${step === 1 ? 'w-full' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : step === 5 ? 'Submit' : 'Next'}
                {!isLoading && step !== 5 && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
          <footer className="mt-4 lg:mt-8 text-center text-muted-foreground">
            <p className="text-sm lg:text-base">© 2023 Sanjeevani. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  )
}