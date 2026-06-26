'use client'

import { useState } from 'react'
import { Mail, RotateCcw } from 'lucide-react'
import RefundDialog from './RefundDialog'

export default function ContactSection() {
  const [refundOpen, setRefundOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex-1 bg-ds-card rounded-lg shadow-sm border border-ds-border p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ds-primary mb-2">
                Support email
              </h2>
              <a
                href="mailto:contact@watchtuberewards.com"
                className="text-brand hover:text-brand/80 font-medium"
              >
                contact@watchtuberewards.com
              </a>
              <p className="text-ds-secondary text-sm mt-2">
                Send your questions or requests. We will respond as soon as
                possible.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-ds-card rounded-lg shadow-sm border border-ds-border p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ds-primary mb-2">
                Request refund
              </h2>
              <p className="text-ds-secondary text-sm mb-4">
                Not satisfied? Request a refund and we will process it within 7
                business days.
              </p>
              <button
                onClick={() => setRefundOpen(true)}
                className="ds-btn-secondary !border-brand !text-brand hover:!bg-brand/10"
              >
                Request refund
              </button>
            </div>
          </div>
        </div>
      </div>

      <RefundDialog isOpen={refundOpen} onClose={() => setRefundOpen(false)} />
    </>
  )
}
