"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface Country {
  name: string
  code: string
  dialCode: string
  flag: string
}

// Prioritize English-speaking countries
const countries: Country[] = [
  // English-speaking countries first
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },

  // Other countries alphabetically
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "AM", dialCode: "+374", flag: "🇦🇲" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "AZ", dialCode: "+994", flag: "🇦🇿" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
  { name: "Belarus", code: "BY", dialCode: "+375", flag: "🇧🇾" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪" },
  { name: "Bolivia", code: "BO", dialCode: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", code: "BA", dialCode: "+387", flag: "🇧🇦" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { name: "Bulgaria", code: "BG", dialCode: "+359", flag: "🇧🇬" },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭" },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴" },
  { name: "Costa Rica", code: "CR", dialCode: "+506", flag: "🇨🇷" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰" },
  { name: "Dominican Republic", code: "DO", dialCode: "+1", flag: "🇩🇴" },
  { name: "Ecuador", code: "EC", dialCode: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬" },
  { name: "Estonia", code: "EE", dialCode: "+372", flag: "🇪🇪" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Georgia", code: "GE", dialCode: "+995", flag: "🇬🇪" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷" },
  { name: "Guatemala", code: "GT", dialCode: "+502", flag: "🇬🇹" },
  { name: "Honduras", code: "HN", dialCode: "+504", flag: "🇭🇳" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺" },
  { name: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "IR", dialCode: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "IQ", dialCode: "+964", flag: "🇮🇶" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Jamaica", code: "JM", dialCode: "+1", flag: "🇯🇲" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "KZ", dialCode: "+7", flag: "🇰🇿" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼" },
  { name: "Latvia", code: "LV", dialCode: "+371", flag: "🇱🇻" },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧" },
  { name: "Lithuania", code: "LT", dialCode: "+370", flag: "🇱🇹" },
  { name: "Luxembourg", code: "LU", dialCode: "+352", flag: "🇱🇺" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
  { name: "Panama", code: "PA", dialCode: "+507", flag: "🇵🇦" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "Serbia", code: "RS", dialCode: "+381", flag: "🇷🇸" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "Slovakia", code: "SK", dialCode: "+421", flag: "🇸🇰" },
  { name: "Slovenia", code: "SI", dialCode: "+386", flag: "🇸🇮" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
  { name: "Taiwan", code: "TW", dialCode: "+886", flag: "🇹🇼" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾" },
  { name: "Venezuela", code: "VE", dialCode: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
]

interface CountryPhoneInputProps {
  value: string
  onChange: (value: string, country: Country, isValid: boolean) => void
  placeholder?: string
  className?: string
}

export function CountryPhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  className = "",
}: CountryPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]) // Default to US
  const [isOpen, setIsOpen] = useState(false)
  const [phoneInput, setPhoneInput] = useState("")

  // Initialize phone input from value
  useEffect(() => {
    setPhoneInput(value)
  }, [value])

  // Function to detect country from dial code
  const detectCountryFromDialCode = (input: string): Country | null => {
    // Remove any non-digit characters except +
    const cleanInput = input.replace(/[^\d+]/g, "")

    if (!cleanInput.startsWith("+")) return null

    // Try to match dial codes, starting with longer ones first
    const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length)

    for (const country of sortedCountries) {
      if (cleanInput.startsWith(country.dialCode)) {
        return country
      }
    }

    return null
  }

  // Function to format phone number based on country
  const formatPhoneNumber = (phone: string, country: Country) => {
    if (!phone) return ""

    // Remove country code if present
    let numberPart = phone
    if (phone.startsWith(country.dialCode)) {
      numberPart = phone.substring(country.dialCode.length)
    }

    // Remove any non-digit characters
    numberPart = numberPart.replace(/\D/g, "")

    // Format based on country
    if ((country.code === "US" || country.code === "CA") && numberPart.length >= 10) {
      // US/Canada format: (XXX) XXX-XXXX
      return `${country.dialCode} (${numberPart.slice(0, 3)}) ${numberPart.slice(3, 6)}-${numberPart.slice(6, 10)}`
    } else if (country.code === "BR" && numberPart.length >= 10) {
      // Brazil format: +55 (XX) XXXXX-XXXX
      if (numberPart.length === 11) {
        return `${country.dialCode} (${numberPart.slice(0, 2)}) ${numberPart.slice(2, 7)}-${numberPart.slice(7)}`
      } else {
        return `${country.dialCode} (${numberPart.slice(0, 2)}) ${numberPart.slice(2, 6)}-${numberPart.slice(6)}`
      }
    } else {
      // Generic international format
      return `${country.dialCode} ${numberPart.replace(/(\d{3,4})(?=\d)/g, "$1 ")}`
    }
  }

  // Function to validate phone number
  const validatePhoneNumber = (phone: string, country: Country) => {
    if (!phone) return false

    // Remove country code and non-digits
    let numberPart = phone
    if (phone.startsWith(country.dialCode)) {
      numberPart = phone.substring(country.dialCode.length)
    }
    numberPart = numberPart.replace(/\D/g, "")

    // Validation based on country
    if (country.code === "US" || country.code === "CA") {
      return numberPart.length === 10
    } else if (country.code === "BR") {
      return numberPart.length === 10 || numberPart.length === 11
    } else {
      // Generic validation: 7-15 digits
      return numberPart.length >= 7 && numberPart.length <= 15
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setPhoneInput(inputValue)

    // Try to detect country from input
    const detectedCountry = detectCountryFromDialCode(inputValue)
    if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
      setSelectedCountry(detectedCountry)
    }

    // Format the number
    const currentCountry = detectedCountry || selectedCountry
    const formattedNumber = formatPhoneNumber(inputValue, currentCountry)
    const isValid = validatePhoneNumber(inputValue, currentCountry)

    // Update the input display
    setPhoneInput(formattedNumber)

    // Call onChange with the formatted number
    onChange(formattedNumber, currentCountry, isValid)
  }

  // Handle country selection from dropdown
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)

    // Extract the number part (without country code)
    let numberPart = phoneInput
    if (phoneInput.startsWith(selectedCountry.dialCode)) {
      numberPart = phoneInput.substring(selectedCountry.dialCode.length)
    }
    numberPart = numberPart.replace(/\D/g, "")

    // Create new formatted number with selected country
    const newFormattedNumber = country.dialCode + (numberPart ? ` ${numberPart}` : "")
    const formattedNumber = formatPhoneNumber(newFormattedNumber, country)
    const isValid = validatePhoneNumber(newFormattedNumber, country)

    setPhoneInput(formattedNumber)
    onChange(formattedNumber, country, isValid)
  }

  return (
    <div className="relative">
      <div className="flex">
        {/* Country Selector */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="h-12 px-3 rounded-r-none border-r-0 bg-gray-50 hover:bg-gray-100 focus:z-10 min-w-[100px]"
          >
            <span className="mr-2">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 z-50 w-80 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg mt-1">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm border-b border-gray-100 last:border-b-0"
                >
                  <span>{country.flag}</span>
                  <span className="font-medium">{country.dialCode}</span>
                  <span className="text-gray-600 truncate">{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Input */}
        <Input
          type="tel"
          value={phoneInput}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`h-12 rounded-l-none focus:z-10 ${className}`}
        />
      </div>

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
