'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onClose: () => void
}

export default function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Erreur lors de l'envoi
            </h3>
            <p className="text-sm text-red-700">
              {message}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Vous pouvez réessayer en cliquant sur "Envoyer" à nouveau.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Fermer le message d'erreur"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}


