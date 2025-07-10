import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1A30] to-[#1a2332]">
      <LoadingSpinner message="Loading SafeKid AI..." />
    </div>
  )
}
