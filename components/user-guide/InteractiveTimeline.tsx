"use client"

import React from "react"
import { motion } from "framer-motion"

interface TimelineEvent {
  title: string
  description: string
}

interface InteractiveTimelineProps {
  events: TimelineEvent[]
}

export function InteractiveTimeline({ events }: InteractiveTimelineProps) {
  return (
    <div className="relative">
      {events.map((event, index) => (
        <motion.div
          key={index}
          className="mb-8 flex flex-col sm:flex-row"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mb-4 sm:mb-0">
            {index + 1}
          </div>
          <div className="sm:ml-4">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p className="mt-1 text-gray-600">{event.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

