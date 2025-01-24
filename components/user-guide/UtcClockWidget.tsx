"use client"

import React, { useState, useEffect } from "react"

export function UtcClockWidget() {
  const [utcTime, setUtcTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Current UTC Time</h3>
      <p className="text-2xl font-bold">{utcTime.toUTCString()}</p>
      <p className="mt-2 text-sm text-gray-600">This is the time zone used for scheduling posts in OmniPost.</p>
    </div>
  )
}

