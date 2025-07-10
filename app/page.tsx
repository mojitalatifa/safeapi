"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback, lazy } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  AlertTriangle,
  Eye,
  Lock,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Clock,
  MessageCircle,
  CheckCircle,
  Star,
  Bell,
  CreditCard,
  Gift,
  BookOpen,
  Infinity,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CountryPhoneInput } from "@/components/country-phone-input"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { useDebounce } from "use-debounce"

// Lazy load components for better performance
const LazyImage = lazy(() => import("next/image"))

type Step =
  | "welcome"
  | "headlines"
  | "form"
  | "scanning"
  | "chat-simulation"
  | "conversion"
  | "final"
  | "checkout"
  | "upsell1"
  | "upsell2"
  | "upsell3"
  | "thank-you"

interface WhatsAppProfileResponse {
  success: boolean
  result?: string
  is_photo_private?: boolean
  phone_number?: string
  error?: string
}

interface Notification {
  id: number
  message: string
  timestamp: Date
}

interface PurchaseData {
  mainProduct: boolean
  orderBump: boolean
  upsell1: boolean
  upsell2: boolean
  upsell3: boolean
  totalAmount: number
}

export default function SafeKidAIFunnel() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [childName, setChildName] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isPhoneValid, setIsPhoneValid] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isProfilePrivate, setIsProfilePrivate] = useState(false)
  const [apiError, setApiError] = useState("")
  const [scanProgress, setScanProgress] = useState(0)
  const [currentProofIndex, setCurrentProofIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(5 * 60) // 5 minutes in seconds
  const [ctaVariant, setCTAVariant] = useState(0) // For A/B testing
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [chatMessageIndex, setChatMessageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [protectedFamilies, setProtectedFamilies] = useState(2847)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showBumpOffer, setShowBumpOffer] = useState(false)
  const [orderBumpSelected, setOrderBumpSelected] = useState(false)
  // Tracks the dial-code of the country chosen in the phone input
  const [selectedDialCode, setSelectedDialCode] = useState("+1") // default US
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    mainProduct: true,
    orderBump: false,
    upsell1: false,
    upsell2: false,
    upsell3: false,
    totalAmount: 27,
  })
  const [scanResults, setScanResults] = useState({
    telegram: { status: "safe", message: "No risks detected" },
    instagram: { status: "warning", message: "Grooming attempt detected" },
    snapchat: { status: "danger", message: "Interaction with unknown profile" },
    tiktok: { status: "danger", message: "Inappropriate content viewed" },
    whatsapp: { status: "danger", message: "Suspicious conversation identified" },
  })

  const nameInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const socialNetworks = [
    { name: "Instagram", icon: "/social-icons/instagram.png", color: "from-purple-500 to-pink-500" },
    { name: "TikTok", icon: "/social-icons/tiktok.png", color: "from-black to-gray-800" },
    { name: "WhatsApp", icon: "/social-icons/whatsapp.png", color: "from-green-500 to-green-600" },
    { name: "Telegram", icon: "/social-icons/telegram.png", color: "from-blue-500 to-blue-600" },
    { name: "Snapchat", icon: "/social-icons/snapchat.png", color: "from-yellow-400 to-yellow-500" },
  ]

  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)

  const newsCards = [
    {
      id: 1,
      image: "/news/cnn-tiktok.jpeg",
      title: "Teen Targeted on TikTok by predator posing as friend",
      source: "CNN",
      date: "March 22, 2024",
    },
    {
      id: 2,
      image: "/news/bbc-telegram-1.jpeg",
      title: "UK Girl Lured into private Telegram Group by online predator",
      source: "BBC News",
      date: "September 10, 2023",
    },
    {
      id: 3,
      image: "/news/guardian-snapchat.jpeg",
      title: "Teen tricked into sending private photos on Snapchat",
      source: "The Guardian",
      date: "November 2, 2023",
    },
    {
      id: 4,
      image: "/news/bbc-telegram-2.jpeg",
      title: "UK Girl Lured into Private Telegram by Online Predator",
      source: "BBC News",
      date: "September 10, 2023",
    },
  ]

  // Dynamic social proof
  const socialProofs = [
    "👩‍🦰 Sarah from Texas unlocked her report 2 minutes ago",
    "🧑 Mike (CA) activated protection right now",
    "👩 Jennifer (FL) discovered suspicious activity 1 minute ago",
    "🧔 David (NY) protected his daughter 3 minutes ago",
    "👩‍🦱 Lisa (TX) unlocked complete analysis now",
  ]

  // Real-time notifications
  const realTimeNotifications = [
    "👩‍🦰 Sarah from Texas just unlocked her report",
    "👀 New verification completed 1 min ago",
    "🧑 Mike (CA) activated protection right now",
    "👩 Jennifer discovered suspicious activity",
    "🔍 Report generated 30 seconds ago",
  ]

  // Suspicious chat simulation
  const suspiciousChat = [
    { sender: "stranger", message: "You seem more mature than your age...", time: "7:03 PM" },
    { sender: "child", message: "Really? Lol", time: "7:04 PM" },
    { sender: "stranger", message: "Let's keep this between us, okay?", time: "7:05 PM" },
    { sender: "stranger", message: "Do you have WhatsApp? We can chat better there", time: "7:06 PM" },
    { sender: "child", message: "I don't know...", time: "7:07 PM" },
    { sender: "stranger", message: "Trust me, I'm different from the others", time: "7:08 PM" },
  ]

  // Real testimonials
  const realTestimonials = [
    {
      name: "Michael R.",
      child: "father of Emma",
      text: "I never thought my daughter could be talking to a stranger like this. SafeKid AI showed me things I never imagined.",
      avatar: "/testimonials/carlos-testimonial.jpg",
      verified: true,
    },
    {
      name: "Sarah M.",
      child: "mother of Olivia",
      text: "I thought my daughter was safe. When I saw what they were sending her on Snapchat, I was shocked. Thank God I found out in time.",
      avatar: "/testimonials/mariana-testimonial.jpg",
      verified: true,
    },
  ]

  // Social media style comments
  const socialComments = [
    {
      name: "Robert K.",
      time: "2 hours ago",
      comment:
        "Used this yesterday and was shocked. What I saw on my daughter's TikTok made me cry. Thank you for this tool.",
      avatar: "/testimonials/rodrigo-comment.jpg",
    },
    {
      name: "Amanda S.",
      time: "4 hours ago",
      comment: "My son was being manipulated on Discord and I had no idea. This analysis saved our family.",
      avatar: "/testimonials/patricia-comment.jpg",
    },
  ]

  // CTA variations for A/B testing
  const ctaVariants = [
    { text: "🔓 Unlock Complete Report", icon: Lock },
    { text: "🔒 Protect My Child Now", icon: Shield },
    { text: "🔍 View Urgent Report", icon: Eye },
    { text: "⚡ Unlock Real-Time Access", icon: AlertTriangle },
  ]

  // FAQ Data
  const faqData = [
    {
      question: "Does this work with any social media platform?",
      answer:
        "Yes! Our technology analyzes Instagram, TikTok, WhatsApp, Telegram, Snapchat, Discord and over 15 digital platforms where your child might be interacting.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use bank-level encryption and strictly follow COPPA and privacy regulations. Your data is processed securely and never shared with third parties.",
    },
    {
      question: "Is this a subscription?",
      answer:
        "No! It's a one-time payment of $27 that includes the complete report + 30 days of free monitoring. No auto-renewal or hidden fees.",
    },
    {
      question: "What happens after payment?",
      answer:
        "You receive immediate access to the complete report via email and text message. Continuous monitoring begins automatically and you receive real-time alerts.",
    },
  ]

  const [profileLoaded, setProfileLoaded] = useState(false)

  // Preload critical images
  useEffect(() => {
    const preloadImages = [
      "/safekid-logo-shield.png",
      "/background/tech-kids.jpeg",
      "/testimonials/carlos-testimonial.jpg",
      "/testimonials/mariana-testimonial.jpg",
    ]

    preloadImages.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // Session cache for form data
  useEffect(() => {
    const savedData = sessionStorage.getItem("safekid-form-data")
    if (savedData) {
      const { name, phone } = JSON.parse(savedData)
      if (name) setChildName(name)
      if (phone) setWhatsappNumber(phone)
    }
  }, [])

  // Save form data to session
  useEffect(() => {
    if (childName || whatsappNumber) {
      sessionStorage.setItem(
        "safekid-form-data",
        JSON.stringify({
          name: childName,
          phone: whatsappNumber,
        }),
      )
    }
  }, [childName, whatsappNumber])

  // Detect exit attempt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep === "conversion" || currentStep === "final" || currentStep === "checkout") {
        setShowExitPopup(true)
        e.preventDefault()
        e.returnValue = ""
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && (currentStep === "conversion" || currentStep === "final" || currentStep === "checkout")) {
        setShowExitPopup(true)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [currentStep])

  // Timer countdown
  useEffect(() => {
    if (currentStep === "conversion" || currentStep === "final" || currentStep === "checkout") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep])

  // Protected families counter
  useEffect(() => {
    if (currentStep === "final" || currentStep === "checkout") {
      const interval = setInterval(() => {
        setProtectedFamilies((prev) => prev + Math.floor(Math.random() * 3))
      }, 8000)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Real-time notifications
  useEffect(() => {
    if (currentStep === "final" || currentStep === "checkout") {
      const interval = setInterval(() => {
        const newNotification: Notification = {
          id: Date.now(),
          message: realTimeNotifications[Math.floor(Math.random() * realTimeNotifications.length)],
          timestamp: new Date(),
        }

        setNotifications((prev) => {
          const updated = [newNotification, ...prev].slice(0, 3)
          return updated
        })

        // Remove notification after 4 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
        }, 4000)
      }, 6000)

      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Social proof rotation
  useEffect(() => {
    if (currentStep === "scanning") {
      const interval = setInterval(() => {
        setCurrentProofIndex((prev) => (prev + 1) % socialProofs.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [currentStep, socialProofs.length])

  // Suspicious chat animation
  useEffect(() => {
    if (currentStep === "chat-simulation") {
      const interval = setInterval(() => {
        setChatMessageIndex((prev) => {
          if (prev >= suspiciousChat.length - 1) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Function to fetch WhatsApp photo
  const fetchWhatsAppProfile = useCallback(async (phone: string, countryCode: string) => {
    if (!phone || phone.replace(/\D/g, "").length < 8) return

    setIsLoadingProfile(true)
    setApiError("")
    setProfileLoaded(false)

    try {
      // Garante que o número inclua o código do país
      let formattedPhone = phone.replace(/\D/g, "")
      if (countryCode && !formattedPhone.startsWith(countryCode.replace("+", ""))) {
        formattedPhone = countryCode.replace("+", "") + formattedPhone
      }

      // Validação adicional: mínimo de 10 dígitos
      if (formattedPhone.length < 10) {
        console.error("Número inválido: menos de 10 dígitos")
        setProfileImage("")
        setIsProfilePrivate(true)
        setApiError("Número de telefone inválido: deve conter pelo menos 10 dígitos")
        setProfileLoaded(true)
        return
      }

      console.log("📱 Enviando número para API:", formattedPhone)

      const response = await fetch("/api/whatsapp-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formattedPhone }),
      })

      let data: WhatsAppProfileResponse
      try {
        data = await response.json()
      } catch {
        data = { success: false, error: "Resposta inválida do servidor" }
      }

      if (!response.ok || !data?.success) {
        console.error("Erro na API interna:", data?.error || "Resposta não-OK", response.status)
        setProfileImage("")
        setIsProfilePrivate(true)
        setApiError(data?.error || "Não foi possível carregar a foto do perfil. Tente novamente mais tarde.")
        setProfileLoaded(true)
        return
      }

      setProfileImage(data.result || "")
      setIsProfilePrivate(!!data.is_photo_private)
      setApiError("")
      setProfileLoaded(true)
    } catch (error: any) {
      console.error("Erro ao buscar foto:", error.message)
      setProfileImage("")
      setIsProfilePrivate(true)
      setApiError("Erro ao consultar o perfil do WhatsApp. Tente outro número ou aguarde alguns minutos.")
      setProfileLoaded(true)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  // Handle phone number change
  const [debouncedPhone] = useDebounce(whatsappNumber, 500) // Debounce de 500ms

  // Called by CountryPhoneInput
  const handlePhoneChange = (value: string, country: any, isValid: boolean) => {
    setWhatsappNumber(value)
    setIsPhoneValid(isValid)
    setSelectedDialCode(country?.dialCode || "+1")
  }

  // Dispara fetchWhatsAppProfile com debounce
  useEffect(() => {
    const cleanPhone = debouncedPhone.replace(/\D/g, "")
    if (isPhoneValid && cleanPhone.length >= 8) {
      fetchWhatsAppProfile(cleanPhone, selectedDialCode)
    } else {
      setProfileImage("")
      setIsProfilePrivate(false)
      setApiError("")
      setProfileLoaded(false)
    }
  }, [debouncedPhone, isPhoneValid, fetchWhatsAppProfile, selectedDialCode])

  // Function to check if can proceed
  const canProceed = () => {
    const name = nameInputRef.current?.value.trim() || childName.trim()
    const hasValidName = name && name.length >= 2
    const hasValidPhone = isPhoneValid && whatsappNumber.trim().length > 0
    const isProfileReady = profileLoaded && !isLoadingProfile

    return hasValidName && hasValidPhone && isProfileReady
  }

  // Function to start analysis
  const handleStartAnalysis = async () => {
    if (!canProceed()) return

    setIsTransitioning(true)

    const name = nameInputRef.current?.value.trim() || childName.trim()
    setChildName(name)

    // Simulate brief loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    setCurrentStep("scanning")
    setCTAVariant(Math.floor(Math.random() * ctaVariants.length))
    setIsTransitioning(false)
  }

  // Enter key handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed()) {
      e.preventDefault()
      handleStartAnalysis()
    }
  }

  // Handle step transitions with loading states
  const handleStepTransition = async (nextStep: Step) => {
    setIsTransitioning(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    setCurrentStep(nextStep)
    setIsTransitioning(false)
  }

  // Handle order bump selection
  const handleOrderBumpChange = (checked: boolean) => {
    setOrderBumpSelected(checked)
    setPurchaseData((prev) => ({
      ...prev,
      orderBump: checked,
      totalAmount: checked ? 44 : 27, // $27 + $17
    }))
  }

  // Handle main checkout
  const handleMainCheckout = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep("upsell1")
      setIsTransitioning(false)
    }, 2000)
  }

  // Handle upsell purchases
  const handleUpsellPurchase = (upsellNumber: 1 | 2 | 3, price: number) => {
    setPurchaseData((prev) => ({
      ...prev,
      [`upsell${upsellNumber}`]: true,
      totalAmount: prev.totalAmount + price,
    }))

    setIsTransitioning(true)
    setTimeout(() => {
      if (upsellNumber === 1) setCurrentStep("upsell2")
      else if (upsellNumber === 2) setCurrentStep("upsell3")
      else setCurrentStep("thank-you")
      setIsTransitioning(false)
    }, 1500)
  }

  // Handle upsell skip
  const handleUpsellSkip = (upsellNumber: 1 | 2 | 3) => {
    if (upsellNumber === 1) setCurrentStep("upsell2")
    else if (upsellNumber === 2) setCurrentStep("upsell3")
    else setCurrentStep("thank-you")
  }

  // Scanning animation
  useEffect(() => {
    if (currentStep === "scanning") {
      setScanProgress(0)
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => handleStepTransition("chat-simulation"), 1000)
            return 100
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Auto-scroll news carousel
  useEffect(() => {
    if (currentStep === "headlines") {
      const interval = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % newsCards.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [currentStep, newsCards.length])

  const nextNews = () => {
    setCurrentNewsIndex((prev) => (prev + 1) % newsCards.length)
  }

  const prevNews = () => {
    setCurrentNewsIndex((prev) => (prev - 1 + newsCards.length) % newsCards.length)
  }

  // Timer formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Local statistic
  const getLocalStatistic = () => {
    return "⚠️ This month alone, 127 cases were reported in the United States."
  }

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6">
        <LoadingSpinner message="Loading verification..." />
      </div>
    </div>
  )

  // Floating Notifications Component
  const FloatingNotifications = () => (
    <div className="fixed bottom-4 left-4 z-40 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1FE3C2]" />
              <span className="text-sm text-gray-700 font-medium">{notification.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="min-h-screen font-sans">
      {/* Loading Overlay */}
      {isTransitioning && <LoadingOverlay />}

      {/* Floating Notifications */}
      <FloatingNotifications />

      {/* Exit Urgency Popup */}
      <AnimatePresence>
        {showExitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">⚠️ {childName} may still be in danger</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to leave without viewing the complete report?</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowExitPopup(false)}
                  className="flex-1 bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] text-white"
                >
                  PROTECT NOW
                </Button>
                <Button
                  onClick={() => window.close()}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-600"
                >
                  LEAVE WITHOUT VIEWING
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Welcome Screen */}
        {currentStep === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(1px)",
              }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A30]/80 via-[#0B1A30]/60 to-[#0B1A30]/80" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
              {/* Logo */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center mb-4">
                  <img
                    src="/safekid-logo-shield.png"
                    alt="SafeKid AI"
                    className="w-24 h-24 object-contain"
                    loading="eager"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">SafeKid AI</h1>
                <p className="text-[#1FE3C2] text-sm md:text-base font-medium">
                  Real-time digital protection for concerned parents
                </p>
              </motion.div>

              {/* Main Content */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Do you know who your child is talking to
                  <span className="text-[#FF4B4B]"> right now?</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                  Over <span className="text-[#FFCE00] font-bold">73% of parents</span> don't monitor their children's
                  social media
                </p>
              </motion.div>

              {/* Social Networks */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap justify-center gap-4 mb-8"
              >
                {socialNetworks.map((network, index) => (
                  <motion.div
                    key={network.name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className={`bg-gradient-to-r ${network.color} p-3 rounded-xl shadow-lg flex items-center gap-2 min-w-[120px] justify-center`}
                  >
                    <img
                      src={network.icon || "/placeholder.svg"}
                      alt={network.name}
                      className="w-6 h-6 object-contain"
                      loading="lazy"
                    />
                    <span className="text-white font-semibold text-sm">{network.name}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center"
              >
                <Button
                  onClick={() => handleStepTransition("headlines")}
                  className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md"
                >
                  <Shield className="w-6 h-6 mr-2" />
                  Start Free Verification
                </Button>
                <p className="text-gray-400 text-sm mt-4">
                  🔒 100% Confidential • ⚡ Real-time analysis • ✅ Used by 50,000+ families
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Data Collection Form */}
        {currentStep === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            <div className="relative z-10 w-full max-w-md mx-auto px-4">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] rounded-xl mb-4">
                      <Wifi className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Digital Security Analysis</h2>
                    <p className="text-gray-600">Enter details to start forensic verification</p>
                  </div>

                  <form ref={formRef} className="space-y-6" onKeyDown={handleKeyDown}>
                    {/* Child's name */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Your child's full name</label>
                      <Input
                        ref={nameInputRef}
                        type="text"
                        placeholder="Enter full name"
                        className="input-enhanced h-12 text-base"
                        defaultValue={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Child's number */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Your child's phone number</label>
                      <CountryPhoneInput
                        value={whatsappNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                        className="text-base"
                      />

                      {/* Profile photo display */}
                      {whatsappNumber.replace(/\D/g, "").length >= 8 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                            {isLoadingProfile
                              ? "Searching for profile photo..."
                              : profileLoaded
                                ? profileImage
                                  ? "Profile photo found"
                                  : "Profile photo not available"
                                : "Waiting for valid number..."}
                          </p>

                          <div className="flex justify-center">
                            {isLoadingProfile ? (
                              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                <LoadingSpinner size="sm" message="" />
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={
                                    profileImage ||
                                    (profileLoaded
                                      ? "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(childName || "User")}&background=885EFF&color=fff&size=200`)
                                  }
                                  alt="Profile photo"
                                  className="w-20 h-20 rounded-full border-4 border-[#885EFF] shadow-lg object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                                  }}
                                />
                                {(isProfilePrivate || !profileImage) && profileLoaded && (
                                  <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                                    <Lock className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {apiError && profileLoaded && (
                            <p className="text-red-500 text-xs text-center mt-2">{apiError}</p>
                          )}
                          {!apiError && profileLoaded && profileImage && (
                            <p className="text-green-600 text-xs text-center mt-2 font-medium">
                              ✅ Profile found successfully!
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="button"
                      onClick={handleStartAnalysis}
                      disabled={!canProceed() || isTransitioning}
                      className="w-full bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 text-lg rounded-xl btn-enhanced disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoadingProfile || isTransitioning ? (
                        <>
                          <LoadingSpinner size="sm" message="" />
                          <span className="ml-2">
                            {isTransitioning ? "Starting analysis..." : "Verifying profile..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5 mr-2" />
                          Start Forensic Analysis
                        </>
                      )}
                    </Button>

                    {canProceed() && !isLoadingProfile && !isTransitioning && (
                      <p className="text-green-600 text-sm text-center font-medium">
                        ✅ Press Enter or click the button to continue
                      </p>
                    )}
                  </form>

                  <div className="mt-6 text-center">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        <span>SSL Encryption</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>COPPA Protected</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Forensic Scanning */}
        {currentStep === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center"
          >
            {/* Matrix Background Effect */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-[#1FE3C2] text-sm font-mono opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -40, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                >
                  {Math.random().toString(36).substring(7)}
                </motion.div>
              ))}
            </div>

            <div className="relative z-10 w-full max-w-lg mx-auto px-4">
              <Card className="bg-gray-900 border-2 border-[#1FE3C2] rounded-2xl shadow-2xl">
                <CardContent className="p-8 text-center">
                  {/* Profile Image */}
                  <div className="mb-8">
                    <img
                      src={
                        profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(childName || "User")}&background=885EFF&color=fff&size=200`
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl mx-auto border-4 border-[#1FE3C2] shadow-lg"
                    />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">FORENSIC ANALYSIS IN PROGRESS</h2>
                  <p className="text-[#1FE3C2] mb-8 text-lg">
                    Scanning <strong>{childName}</strong>'s profile...
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <Progress value={scanProgress} className="h-4 bg-gray-800 rounded-full overflow-hidden" />
                  </div>

                  <p className="text-white text-xl font-bold mb-8">{Math.round(scanProgress)}% complete</p>

                  {/* Dynamic Social Proof */}
                  <motion.div
                    key={currentProofIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-6"
                  >
                    <p className="text-green-400 text-sm font-medium">{socialProofs[currentProofIndex]}</p>
                  </motion.div>

                  {/* Social Networks Status */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    {socialNetworks.map((network, index) => {
                      const isScanned = scanProgress > (index + 1) * 20
                      const networkKey = network.name.toLowerCase() as keyof typeof scanResults
                      const result = scanResults[networkKey]

                      return (
                        <div
                          key={network.name}
                          className={`p-4 rounded-lg border transition-all duration-500 ${
                            isScanned
                              ? result.status === "safe"
                                ? "border-green-500 bg-green-500/10"
                                : result.status === "warning"
                                  ? "border-yellow-500 bg-yellow-500/10"
                                  : "border-red-500 bg-red-500/10"
                              : "border-gray-600 bg-gray-800/50"
                          }`}
                        >
                          <img
                            src={network.icon || "/placeholder.svg"}
                            alt={network.name}
                            className="w-8 h-8 mx-auto mb-2 object-contain"
                            loading="lazy"
                          />
                          <div className="text-white font-semibold text-sm mb-1">{network.name}</div>
                          {isScanned && (
                            <div
                              className={`text-xs ${
                                result.status === "safe"
                                  ? "text-green-400"
                                  : result.status === "warning"
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {result.status === "safe" ? "✅" : result.status === "warning" ? "⚠️" : "❌"}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-3 text-[#1FE3C2] text-sm">
                    <Shield className="w-5 h-5" />
                    <span>Secure and encrypted connection</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* New Section: Suspicious Chat Simulation */}
        {currentStep === "chat-simulation" && (
          <motion.div
            key="chat-simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
              {/* Header */}
              <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">🚨 Suspicious Conversation Detected</h2>
                <p className="text-lg text-red-400 mb-6">
                  Example of the type of conversation found in <strong>{childName}</strong>'s profile
                </p>
              </motion.div>

              {/* Chat Simulation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-md mx-auto mb-8"
              >
                <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">?</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Unknown User</h4>
                      <p className="text-gray-400 text-xs">Online now</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {suspiciousChat.slice(0, chatMessageIndex + 1).map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.5 }}
                        className={`flex ${message.sender === "child" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            message.sender === "child"
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-red-500/20 border border-red-500/30 text-red-300 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">{message.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {chatMessageIndex >= suspiciousChat.length - 1 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
                  <Button
                    onClick={() => handleStepTransition("conversion")}
                    className="bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] hover:from-[#FF3B3B] hover:to-[#FF5B5B] text-white font-bold py-3 px-6 rounded-xl"
                  >
                    Continue Analysis →
                  </Button>
                </motion.div>
              )}

              {/* Warning Message */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6 max-w-2xl mx-auto text-center"
              >
                <h3 className="text-xl font-bold text-red-400 mb-2">⚠️ GROOMING PATTERN IDENTIFIED</h3>
                <p className="text-white mb-4">
                  This is just a sample. The complete report contains detailed analysis of all suspicious conversations.
                </p>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Isolation attempt ("between us")</p>
                  <p>• Age-inappropriate compliments</p>
                  <p>• Request for private contact</p>
                  <p>• False trust building</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* New Section: Headlines */}
        {currentStep === "headlines" && (
          <motion.div
            key="headlines"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
              {/* Header */}
              <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Real Cases That Made Headlines
                </h2>
                <p className="text-lg md:text-xl text-[#1FE3C2] mb-6">And show why SafeKid AI is needed now.</p>
              </motion.div>

              {/* Carousel */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative mb-8"
              >
                <div className="overflow-hidden rounded-2xl max-w-2xl mx-auto">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentNewsIndex * 100}%)` }}
                  >
                    {newsCards.map((news) => (
                      <div key={news.id} className="w-full flex-shrink-0">
                        <Card className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
                          <CardContent className="p-0">
                            <img
                              src={news.image || "/placeholder.svg"}
                              alt={news.title}
                              className="w-full h-auto object-cover"
                              loading="lazy"
                            />
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel controls */}
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevNews}
                    className="border-[#1FE3C2] text-white hover:bg-[#1FE3C2]/20 bg-transparent p-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex gap-2">
                    {newsCards.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentNewsIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentNewsIndex ? "bg-[#1FE3C2]" : "bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextNews}
                    className="border-[#1FE3C2] text-white hover:bg-[#1FE3C2]/20 bg-transparent p-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Current news information */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8 max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">REAL CASE</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{newsCards[currentNewsIndex].title}</h3>
                <p className="text-[#FFCE00] font-semibold">
                  {newsCards[currentNewsIndex].source} • {newsCards[currentNewsIndex].date}
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <Button
                  onClick={() => handleStepTransition("form")}
                  className="bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] hover:from-[#FF3B3B] hover:to-[#FF5B5B] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md"
                >
                  <Shield className="w-6 h-6 mr-2" />I Want to Protect Now
                </Button>
                <p className="text-gray-400 text-sm mt-4">Don't let your child become the next headline</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Conversion Screen */}
        {currentStep === "conversion" && (
          <motion.div
            key="conversion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

            <div className="relative z-10 min-h-screen flex flex-col">
              {/* Main container with adequate padding */}
              <div className="flex-1 container mx-auto px-4 py-6 md:py-12 flex flex-col justify-center max-w-4xl">
                {/* Urgency Timer */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-4"
                >
                  <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-bold">LIMITED ACCESS</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{formatTime(timeLeft)}</div>
                    <p className="text-red-300 text-sm">Time remaining to access report</p>
                  </div>
                </motion.div>

                {/* Main Header */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    🚨 COMPLETE ANALYSIS OF <span className="text-red-400">{childName.toUpperCase()}</span>
                  </h1>
                  <p className="text-lg md:text-xl text-[#FFCE00] font-semibold mb-4">
                    <span className="text-red-400 font-bold">4 risk situations</span> detected that require immediate
                    attention
                  </p>
                  <div className="text-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      CONFIDENTIAL REPORT
                    </span>
                  </div>
                </motion.div>

                {/* Risk Summary */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                >
                  {[
                    {
                      platform: "Instagram",
                      risk: "HIGH",
                      issue: "Grooming attempt detected",
                      color: "border-red-500 bg-red-500/10",
                      icon: "❌",
                    },
                    {
                      platform: "Snapchat",
                      risk: "CRITICAL",
                      issue: "Interaction with unknown profile",
                      color: "border-red-600 bg-red-600/20",
                      icon: "🚨",
                    },
                    {
                      platform: "TikTok",
                      risk: "HIGH",
                      issue: "Inappropriate content viewed",
                      color: "border-red-500 bg-red-500/10",
                      icon: "⚠️",
                    },
                    {
                      platform: "WhatsApp",
                      risk: "CRITICAL",
                      issue: "Suspicious conversation identified",
                      color: "border-red-600 bg-red-600/20",
                      icon: "🚨",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${item.color}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">{item.platform}</h3>
                        <span className="text-2xl">{item.icon}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          {item.risk} RISK
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{item.issue}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Local Statistic */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-center"
                >
                  <p className="text-yellow-400 font-semibold">{getLocalStatistic()}</p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center"
                >
                  <Button
                    onClick={() => handleStepTransition("final")}
                    className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md mb-4"
                  >
                    {React.createElement(ctaVariants[ctaVariant].icon, { className: "w-6 h-6 mr-2" })}
                    {ctaVariants[ctaVariant].text}
                  </Button>
                  <p className="text-gray-400 text-sm">🔒 Secure payment • ⚡ Instant access • ✅ 30-day guarantee</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Final Screen */}
        {currentStep === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            <div className="relative z-10 min-h-screen flex flex-col">
              {/* Main container */}
              <div className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-4xl">
                {/* Urgency Timer */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-6"
                >
                  <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-bold">LIMITED ACCESS</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{formatTime(timeLeft)}</div>
                    <p className="text-red-300 text-sm">Time remaining to access report</p>
                  </div>
                </motion.div>

                {/* Main Header */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    🔓 UNLOCK COMPLETE REPORT
                  </h1>
                  <p className="text-lg md:text-xl text-[#FFCE00] font-semibold mb-4">
                    Get immediate access to the detailed analysis + 30 days of continuous monitoring
                  </p>
                </motion.div>

                {/* Testimonials */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                  {realTestimonials.map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: index === 0 ? -50 : 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.2 }}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                          loading="lazy"
                        />
                        <div>
                          <h4 className="text-white font-semibold">{testimonial.name}</h4>
                          <p className="text-[#1FE3C2] text-sm">{testimonial.child}</p>
                        </div>
                        {testimonial.verified && <CheckCircle className="w-5 h-5 text-[#1FE3C2] ml-auto" />}
                      </div>
                      <p className="text-gray-300 text-sm italic">"{testimonial.text}"</p>
                      <div className="flex items-center gap-1 mt-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Social Comments */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4 mb-8"
                >
                  {socialComments.map((comment, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1 + index * 0.2 }}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={comment.avatar || "/placeholder.svg"}
                          alt={comment.name}
                          className="w-10 h-10 rounded-full object-cover"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold text-sm">{comment.name}</h4>
                            <span className="text-gray-400 text-xs">{comment.time}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{comment.comment}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Protected Families Counter */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-8 text-center"
                >
                  <p className="text-green-400 font-semibold">
                    🛡️ <span className="text-2xl font-bold">{protectedFamilies.toLocaleString()}</span> families already
                    protected
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="text-center"
                >
                  <Button
                    onClick={() => handleStepTransition("checkout")}
                    className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full max-w-md mb-4"
                  >
                    <Lock className="w-6 h-6 mr-2" />
                    UNLOCK COMPLETE REPORT - $27
                  </Button>
                  <p className="text-gray-400 text-sm mb-4">
                    🔒 Secure payment • ⚡ Instant access • ✅ 30-day guarantee
                  </p>
                  <p className="text-[#1FE3C2] text-sm font-semibold">
                    ✅ One-time payment • No subscriptions • No hidden fees
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Checkout Screen */}
        {currentStep === "checkout" && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background/tech-kids.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(2px)",
              }}
            />

            <div className="relative z-10 min-h-screen flex flex-col">
              <div className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-2xl">
                {/* Urgency Timer */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-6"
                >
                  <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-bold">LIMITED ACCESS</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{formatTime(timeLeft)}</div>
                    <p className="text-red-300 text-sm">Time remaining to access report</p>
                  </div>
                </motion.div>

                {/* Header */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">🔒 Secure Checkout</h1>
                  <p className="text-[#1FE3C2] font-semibold">Complete your order to unlock the report</p>
                </motion.div>

                {/* Order Summary */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6"
                >
                  <h3 className="text-white font-bold text-lg mb-4">Order Summary</h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">SafeKid AI Complete Report</span>
                      <span className="text-white font-semibold">$27.00</span>
                    </div>

                    {orderBumpSelected && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">30-Day Continuous Protection</span>
                        <span className="text-white font-semibold">$17.00</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-lg">Total</span>
                      <span className="text-[#1FE3C2] font-bold text-xl">${purchaseData.totalAmount}.00</span>
                    </div>
                  </div>
                </motion.div>

                {/* Order Bump */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-yellow-500/10 border-2 border-yellow-500 rounded-xl p-6 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="order-bump"
                      checked={orderBumpSelected}
                      onCheckedChange={handleOrderBumpChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="order-bump" className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-400 font-bold">SPECIAL OFFER</span>
                        </div>
                        <h4 className="text-white font-bold mb-2">Add 30-Day Continuous Protection for only $17</h4>
                        <p className="text-gray-300 text-sm mb-3">
                          Get real-time alerts whenever new risks are detected on your child's social media accounts.
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            LIMITED TIME
                          </span>
                          <span className="text-gray-400 line-through">$47</span>
                          <span className="text-yellow-400 font-bold">Only $17</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Button */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <Button
                    onClick={handleMainCheckout}
                    className="bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl btn-enhanced w-full mb-4"
                  >
                    <CreditCard className="w-6 h-6 mr-2" />
                    COMPLETE SECURE PAYMENT - ${purchaseData.totalAmount}
                  </Button>
                  <p className="text-gray-400 text-sm mb-4">
                    🔒 256-bit SSL encryption • ✅ 30-day money-back guarantee
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>Privacy Protected</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upsell 1: Family Protection */}
        {currentStep === "upsell1" && (
          <motion.div
            key="upsell1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            <div className="relative z-10 min-h-screen flex flex-col justify-center">
              <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] rounded-full mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">🛡️ PROTECT YOUR ENTIRE FAMILY</h1>
                  <p className="text-lg text-[#1FE3C2] font-semibold">
                    Extend protection to all family members for just $37 more
                  </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8"
                >
                  <h3 className="text-white font-bold text-lg mb-4">What you get:</h3>
                  <div className="space-y-3">
                    {[
                      "Protection for up to 5 family members",
                      "Real-time monitoring for all accounts",
                      "Family dashboard with consolidated reports",
                      "Priority support and alerts",
                      "Advanced threat detection",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#1FE3C2]" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Pricing */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8 text-center"
                >
                  <p className="text-gray-300 mb-2">
                    Regular price: <span className="line-through">$97</span>
                  </p>
                  <p className="text-3xl font-bold text-[#1FE3C2] mb-2">Only $37</p>
                  <p className="text-green-400 font-semibold">Save $60 today!</p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <Button
                    onClick={() => handleUpsellPurchase(1, 37)}
                    className="w-full bg-gradient-to-r from-[#885EFF] to-[#1FE3C2] hover:from-[#7B52FF] hover:to-[#1BD4B8] text-white font-bold py-4 px-8 text-lg rounded-xl"
                  >
                    YES, PROTECT MY ENTIRE FAMILY - $37
                  </Button>
                  <Button
                    onClick={() => handleUpsellSkip(1)}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-400 hover:bg-gray-800"
                  >
                    No thanks, continue with single protection
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upsell 2: Anti-Manipulation Guide */}
        {currentStep === "upsell2" && (
          <motion.div
            key="upsell2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            <div className="relative z-10 min-h-screen flex flex-col justify-center">
              <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    📚 COMPLETE ANTI-MANIPULATION GUIDE
                  </h1>
                  <p className="text-lg text-[#FFCE00] font-semibold">
                    Learn how to protect your child from online predators - Only $19
                  </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8"
                >
                  <h3 className="text-white font-bold text-lg mb-4">What you'll learn:</h3>
                  <div className="space-y-3">
                    {[
                      "How to identify grooming patterns",
                      "Warning signs of online manipulation",
                      "How to talk to your child about online safety",
                      "Emergency action protocols",
                      "Legal steps to take if needed",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#1FE3C2]" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Pricing */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8 text-center"
                >
                  <p className="text-gray-300 mb-2">
                    Regular price: <span className="line-through">$47</span>
                  </p>
                  <p className="text-3xl font-bold text-[#FFCE00] mb-2">Only $19</p>
                  <p className="text-yellow-400 font-semibold">Save $28 today!</p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <Button
                    onClick={() => handleUpsellPurchase(2, 19)}
                    className="w-full bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] hover:from-[#FF3B3B] hover:to-[#FF5B5B] text-white font-bold py-4 px-8 text-lg rounded-xl"
                  >
                    YES, I WANT THE COMPLETE GUIDE - $19
                  </Button>
                  <Button
                    onClick={() => handleUpsellSkip(2)}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-400 hover:bg-gray-800"
                  >
                    No thanks, continue without guide
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upsell 3: Lifetime Monitoring */}
        {currentStep === "upsell3" && (
          <motion.div
            key="upsell3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            <div className="relative z-10 min-h-screen flex flex-col justify-center">
              <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#FFCE00] to-[#FFD700] rounded-full mb-4">
                    <Infinity className="w-8 h-8 text-black" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">♾️ LIFETIME MONITORING</h1>
                  <p className="text-lg text-[#FFCE00] font-semibold">
                    Never worry again - Lifetime protection for just $67
                  </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8"
                >
                  <h3 className="text-white font-bold text-lg mb-4">Lifetime benefits:</h3>
                  <div className="space-y-3">
                    {[
                      "Unlimited monitoring forever",
                      "Real-time alerts for life",
                      "All future updates included",
                      "Priority support forever",
                      "New platform monitoring as they emerge",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#1FE3C2]" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Pricing */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8 text-center"
                >
                  <p className="text-gray-300 mb-2">
                    Regular price: <span className="line-through">$297/year</span>
                  </p>
                  <p className="text-3xl font-bold text-[#FFCE00] mb-2">Only $67 ONCE</p>
                  <p className="text-yellow-400 font-semibold">Save over $1,000 in the long run!</p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <Button
                    onClick={() => handleUpsellPurchase(3, 67)}
                    className="w-full bg-gradient-to-r from-[#FFCE00] to-[#FFD700] hover:from-[#FFBE00] hover:to-[#FFC700] text-black font-bold py-4 px-8 text-lg rounded-xl"
                  >
                    YES, I WANT LIFETIME PROTECTION - $67
                  </Button>
                  <Button
                    onClick={() => handleUpsellSkip(3)}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-400 hover:bg-gray-800"
                  >
                    No thanks, continue to my report
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Thank You Screen */}
        {currentStep === "thank-you" && (
          <motion.div
            key="thank-you"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1A30 0%, #1a2332 50%, #0B1A30 100%)",
            }}
          >
            <div className="relative z-10 min-h-screen flex flex-col justify-center">
              <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Success Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">✅ PURCHASE COMPLETED!</h1>
                  <p className="text-lg text-[#1FE3C2] font-semibold">Thank you for protecting {childName}</p>
                </motion.div>

                {/* Purchase Summary */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8"
                >
                  <h3 className="text-white font-bold text-lg mb-4">Purchase Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">SafeKid AI Complete Report</span>
                      <span className="text-white">$27.00</span>
                    </div>
                    {purchaseData.orderBump && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">30-Day Continuous Protection</span>
                        <span className="text-white">$17.00</span>
                      </div>
                    )}
                    {purchaseData.upsell1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Family Protection</span>
                        <span className="text-white">$37.00</span>
                      </div>
                    )}
                    {purchaseData.upsell2 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Anti-Manipulation Guide</span>
                        <span className="text-white">$19.00</span>
                      </div>
                    )}
                    {purchaseData.upsell3 && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Lifetime Monitoring</span>
                        <span className="text-white">$67.00</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-600 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-bold text-lg">Total Paid</span>
                      <span className="text-[#1FE3C2] font-bold text-xl">${purchaseData.totalAmount}.00</span>
                    </div>
                  </div>
                </motion.div>

                {/* Next Steps */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8"
                >
                  <h3 className="text-green-400 font-bold text-lg mb-4">What happens next:</h3>
                  <div className="space-y-3">
                    {[
                      "Complete report sent to your email within 5 minutes",
                      "SMS confirmation with access link",
                      "Monitoring begins immediately",
                      "You'll receive alerts for any new risks detected",
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Support Information */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center"
                >
                  <h3 className="text-blue-400 font-bold text-lg mb-4">Need Help?</h3>
                  <p className="text-gray-300 mb-4">
                    Our support team is available 24/7 to help you understand your report and take action.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">support@safekidai.com</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
