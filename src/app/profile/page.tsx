"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, FileDown, Edit2, Upload, File, Trash2, Sun, Moon, Menu, Camera } from "lucide-react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { updateUser, addMedicalRecord, removeMedicalRecord } from '../../store/slices/userSlice'
import { ErrorBoundary } from 'react-error-boundary'
import { uploadImageToAzure } from "@/lib/azure-storage"
import { set } from 'date-fns'

type UserData = {
  profileURL: string | ""
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
  medicalRecords: MedicalRecord[]
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

export default function MedicalCardComponent() {
  const user = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [editedUser, setEditedUser] = useState<UserData>({ ...user } as UserData)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profilePictureInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
    if(!user.token)
    {
      router.push('/')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedUser({ ...editedUser, [e.target.id]: e.target.value })
  }

  const handleSelectChange = (value: string, field: string) => {
    setEditedUser({ ...editedUser, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://10.145.11.133:5001/userprofile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      console.log("Edited user:", editedUser)
      dispatch(updateUser(editedUser))
      setIsEditDialogOpen(false)
      toast.success('Profile updated successfully!', {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.', {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      try {
        setIsUploading(true)
        const fileUrl = await uploadImageToAzure(file)
        console.log(fileUrl)
        const newRecord: MedicalRecord = {
          id: Date.now().toString(),
          name: file.name,
          date: new Date().toISOString().split('T')[0],
          url: fileUrl
        }
        console.log(newRecord)
        console.log(user.medicalRecords)
        const response = await fetch('http://10.145.11.133:5001/userprofile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ medicalRecords: [newRecord] }),
        })

        if (!response.ok) {
          console.log(response.json)
          throw new Error('Failed to update profile')
        }

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
        setIsUploading(false)
      }
    }
  }

  const handleDeleteRecord = (id: string) => {
    try {
      dispatch(removeMedicalRecord(id))
      toast.success('Medical record deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Error deleting record:', error)
      toast.error('Failed to delete medical record. Please try again.', {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const exportMedicalData = async() => {
    try {
      const response = await fetch('http://10.145.11.133:5001/exportdata', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "start_date":"2021-01-01 00:00:00", "end_date":"2025-12-31 23:59:59" }),
      })

      if(!response.ok) {
        throw new Error("Failed to export medical data")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'medical_data.pdf')
      document.body.appendChild(link)
      link.click()

      toast.success('Medical data exported successfully!', {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Error exporting medical data:', error)
      toast.error('Failed to export medical data. Please try again.', {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      try {
        setIsUploading(true)
        const fileUrl = await uploadImageToAzure(file)
        console.log("Profile picture URL:", fileUrl)
        // setProfilePicture(fileUrl)
        const updatedUser  =  { ...editedUser, profileURL: fileUrl }
        console.log(updatedUser)
        
        const response = await fetch('http://10.145.11.133:5001/userprofile', {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"profileURL": fileUrl}),
        })

        if (!response.ok) {
          throw new Error('Failed to update profile')
        }

        dispatch(updateUser(updatedUser))
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
        setIsUploading(false)
      }
    }
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <header className="bg-background border-b border-border p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            className="p-2 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            className="p-2 hidden md:flex"
            onClick={() => router.push('/chat')}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <ArrowLeft className={`h-6 w-6 mr-2 transition-transform duration-200 ${isHovered ? '-translate-x-1' : ''}`} />
            <span className="hidden md:inline">Back to Chat</span>
          </Button>
          <h1 className="text-xl md:text-2xl font-bold text-primary">Medical Card</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportMedicalData} className="hidden md:flex">
              <FileDown className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Export Data</span>
            </Button>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border p-4 space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/chat')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={exportMedicalData}>
              <FileDown className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        )}

        <main className="flex-grow p-4 md:p-6 flex justify-center items-start">
          <Card className="w-full max-w-5xl shadow-lg">
            <CardHeader className="text-center relative pb-2">
              <div className="absolute top-4 right-4">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" value={editedUser.username} readOnly onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={editedUser.email} readOnly onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthdate">Birthdate</Label>
                          <Input id="birthdate" type="date" value={editedUser.birthdate} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select onValueChange={(value) => handleSelectChange(value, 'gender')} value={editedUser.gender}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input id="weight" type="number" value={editedUser.weight} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input id="height" type="number" value={editedUser.height} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bloodType">Blood Type</Label>
                          <Input id="bloodType" value={editedUser.bloodType} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="activityLevel">Activity Level</Label>
                          <Select onValueChange={(value) => handleSelectChange(value, 'activityLevel')} value={editedUser.activityLevel}>
                            <SelectTrigger>
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
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" value={editedUser.bio} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies</Label>
                        <Input id="allergies" value={editedUser.allergies} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medications">Medications</Label>
                        <Input id="medications" value={editedUser.medications} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Emergency Doctor Contact</Label>
                        <Input id="emergencyContact" value={editedUser.emergencyContact}
                               onChange={handleChange} placeholder="Enter emergency doctor contact" />
                      </div>
                      <Button type="submit" className="w-full">Save Changes</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex justify-center mb-4 relative">
                <Avatar className="h-20 w-20 md:h-24 md:w-24">
                  <AvatarImage src={user.profileURL || "/placeholder.svg?height=96&width=96"} alt={user.username ?? ''} />
                  <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
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
              <CardTitle className="text-2xl md:text-3xl font-bold">{user.username}</CardTitle>
              <p className="text-sm md:text-base text-muted-foreground">{user.email}</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                  <TabsTrigger value="records">Records</TabsTrigger>
                </TabsList>
                <div className="mt-6 bg-card rounded-lg shadow-inner">
                  <ScrollArea className="h-[300px] md:h-[400px] w-full rounded-md p-4">
                    <TabsContent value="personal" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-base md:text-lg font-semibold">Birthdate</h3>
                          <p className="text-sm md:text-base text-muted-foreground">{user.birthdate}</p>
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold">Gender</h3>
                          <p className="text-sm md:text-base text-muted-foreground">{user.gender}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-semibold">Bio</h3>
                        <p className="text-sm md:text-base text-muted-foreground">{user.bio}</p>
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-semibold">Emergency Doctor Contact</h3>
                        <p className="text-sm md:text-base text-muted-foreground">{user.emergencyContact || 'Not provided'}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="health" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-base md:text-lg font-semibold">Weight</h3>
                          <p className="text-sm md:text-base text-muted-foreground">{user.weight} kg</p>
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold">Height</h3>
                          <p className="text-sm md:text-base text-muted-foreground">{user.height} cm</p>
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold">Blood Type</h3>
                          <p className="text-sm md:text-base text-muted-foreground">{user.bloodType}</p>
                        </div>
                        <div>
                          <h3 className="text-base md:text-lg font-semibold">Activity Level</h3>
                          <p className="text-sm md:text-base text-muted-foreground">{user.activityLevel}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-semibold">Allergies</h3>
                        <p className="text-sm md:text-base text-muted-foreground">{user.allergies}</p>
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-semibold">Medications</h3>
                        <p className="text-sm md:text-base text-muted-foreground">{user.medications}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="records" className="space-y-4">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold mb-2">Uploaded Medical Records</h3>
                        {user.medicalRecords && user.medicalRecords.length > 0 ? (
                          <ul className="space-y-2">
                            {user.medicalRecords.map((record: MedicalRecord) => (
                              <li key={record.id} className="flex items-center justify-between bg-background p-2 rounded-md">
                                <div className="flex items-center">
                                  <File className="h-4 w-4 md:h-5 md:w-5 mr-2 text-primary" />
                                  <span className="text-sm md:text-base">{record.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs md:text-sm text-muted-foreground">{record.date}</span>
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
                          <p className="text-sm md:text-base text-muted-foreground">No medical records uploaded yet.</p>
                        )}
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <div className="flex items-center justify-center w-full h-24 md:h-32 px-4 transition bg-background border-2 border-border border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none">
                            <span className="flex items-center space-x-2">
                              <Upload className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                              <span className="text-sm md:text-base font-medium text-muted-foreground">
                                {isUploading ? 'Uploading...' : 'Click to upload medical records'}
                              </span>
                            </span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="hidden"
                              onChange={handleFileUpload}
                              accept="image/*,application/pdf"
                              disabled={isUploading}
                            />
                          </div>
                        </Label>
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </div>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push('/chat')} className="w-full md:w-auto">Back to Chat</Button>
            </CardFooter>
          </Card>
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </ErrorBoundary>
  )
}