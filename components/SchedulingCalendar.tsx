import React, { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react'

interface SchedulingCalendarProps {
  onSchedule: (date: Date, time: string, platform: string) => void
}

export function SchedulingCalendar({ onSchedule }: SchedulingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('12:00')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('twitter')

  const handleSchedule = () => {
    if (selectedDate && selectedTime && selectedPlatform) {
      onSchedule(selectedDate, selectedTime, selectedPlatform)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Post (UTC)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>UTC Time</AlertTitle>
          <AlertDescription>
            All times are in UTC. Please adjust accordingly for your local time zone.
          </AlertDescription>
        </Alert>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
        <div className="flex space-x-2">
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time (UTC)" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                  {`${hour.toString().padStart(2, '0')}:00 UTC`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSchedule}>Schedule Post</Button>
      </CardContent>
    </Card>
  )
}

