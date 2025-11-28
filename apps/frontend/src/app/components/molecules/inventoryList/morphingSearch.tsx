'use client'

import type React from 'react'
import type { MorphingSearchProps } from '@/app/types/inventoryList'
import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export function MorphingSearch({
  placeholder = '搜尋商品...',
  onSearch,
  className = '',
}: MorphingSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Delay focus to allow animation to start
      setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setQuery('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch?.(value)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Morphing container */}
      <div
        className={`
          relative flex items-center bg-white border border-gray-300 overflow-hidden
          transition-all duration-300 ease-in-out
          ${
            isOpen
              ? 'w-[320px] h-[40px] rounded-lg'
              : 'w-[40px] h-[40px] rounded-lg cursor-pointer hover:border-gray-400'
          }
        `}
        onClick={!isOpen ? handleOpen : undefined}
      >
        {/* Search icon */}
        <div
          className={`
            flex items-center justify-center shrink-0
            transition-all duration-300 ease-in-out
            ${isOpen ? 'w-[40px] pl-3' : 'w-[40px]'}
          `}
        >
          <Search className="w-5 h-5 text-gray-600" />
        </div>

        {/* Input field - fades in when open */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`
            flex-1 bg-transparent border-none outline-none text-sm
            transition-opacity duration-300 ease-in-out
            ${isOpen ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none'}
          `}
        />

        {/* Close button - fades in when open */}
        <button
          onClick={handleClose}
          className={`
            flex items-center justify-center shrink-0 w-[40px] h-full
            transition-opacity duration-300 ease-in-out
            hover:bg-gray-100
            ${isOpen ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none'}
          `}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
