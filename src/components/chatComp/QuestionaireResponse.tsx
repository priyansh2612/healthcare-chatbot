import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const QuestionnaireResponse: React.FC<{
  question: string
  options: string[]
  type: "single" | "multiple"
  onSubmit: (selected: string | string[]) => void
  onSkip: () => void
}> = ({ question, options, type, onSubmit, onSkip }) => {
  const [selected, setSelected] = useState<string | string[]>(type === "single" ? "" : [])

  const handleSubmit = () => {
    onSubmit(selected)
  }

  const handleCheckboxChange = (option: string) => {
    setSelected((prev) =>
      Array.isArray(prev)
        ? prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option]
        : [option]
    )
  }

  return (
    <div className="space-y-4">
      <p className="font-medium">{question}</p>
      {type === "single" ? (
        <RadioGroup value={selected as string} onValueChange={setSelected as (value: string) => void}>
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`option-${index}`}
              checked={(selected as string[]).includes(option)}
              onCheckedChange={() => handleCheckboxChange(option)}
            />
            <Label htmlFor={`option-${index}`}>{option}</Label>
          </div>
        ))
      )}
      <div className="flex space-x-2">
        <Button onClick={handleSubmit} disabled={type === "single" ? !selected : (selected as string[]).length === 0}>
          Submit
        </Button>
        <Button variant="outline" onClick={onSkip}>
          Skip
        </Button>
      </div>
    </div>
  )
}

export default QuestionnaireResponse