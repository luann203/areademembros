'use client'

import { useState } from 'react'
import { X, RotateCcw } from 'lucide-react'

type RefundReason =
  | 'not_expected'
  | 'technical_issues'
  | 'no_time'
  | 'found_elsewhere'
  | 'other'

export default function RefundDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [reason, setReason] = useState<RefundReason | ''>('')
  const [rating, setRating] = useState<number | null>(null)
  const [details, setDetails] = useState('')
  const [email, setEmail] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission - you can add API call here
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setReason('')
    setRating(null)
    setDetails('')
    setSubmitted(false)
    onClose()
  }

  const reasons: { value: RefundReason; label: string }[] = [
    { value: 'not_expected', label: 'Content did not meet my expectations' },
    { value: 'technical_issues', label: 'I had technical issues' },
    { value: 'no_time', label: "I don't have time to complete the course" },
    { value: 'found_elsewhere', label: 'I found similar content elsewhere' },
    { value: 'other', label: 'Other reason' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Request refund</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Request received
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Your refund request has been submitted. Our team will review it
                and you will receive a response by email within 48 hours. The
                refund may take up to 7 business days to be processed to your
                original payment method.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-800">
                Please note: Refunds may take up to 7 business days to be
                processed and appear in your account.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you requesting a refund? *
              </label>
              <select
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value as RefundReason | '')
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a reason</option>
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you rate your overall experience? *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      rating && rating >= value
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                1 = Very poor, 5 = Excellent
              </p>
            </div>

            <div>
              <label
                htmlFor="refund-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email *
              </label>
              <input
                id="refund-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="refund-order"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Order or transaction reference
              </label>
              <input
                id="refund-order"
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="e.g. order number or purchase ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="refund-details"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Additional details
              </label>
              <textarea
                id="refund-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Tell us more about your refund request..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason || !rating || !email}
                className="flex-1 px-4 py-2 bg-[#6932CB] text-white rounded-lg font-medium hover:bg-[#5a2ab0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
