"use client"

import { useState, useEffect } from "react"

interface GeolocationData {
  city: string
  country: string
  loading: boolean
}

export function useGeolocation(): GeolocationData {
  const [data, setData] = useState<GeolocationData>({
    city: "Pindamonhangaba",
    country: "BR",
    loading: false,
  })

  // Static data for better stability and credibility
  useEffect(() => {
    // Simulate loading for realism
    setData({
      city: "Pindamonhangaba",
      country: "BR",
      loading: false,
    })
  }, [])

  return data
}
