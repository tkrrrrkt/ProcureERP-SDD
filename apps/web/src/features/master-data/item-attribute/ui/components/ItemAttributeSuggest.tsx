"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, X, Loader2, Check } from "lucide-react"
import type { ItemAttributeDto } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { useDebounce } from "../hooks/useDebounce"

// Shared UI Components
import { Input } from "@/shared/ui/components/input"
import { Badge } from "@/shared/ui/components/badge"
import { Button } from "@/shared/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/components/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/shared/ui/components/command"

interface ItemAttributeSuggestProps {
  value?: ItemAttributeDto | null
  onChange: (attribute: ItemAttributeDto | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ItemAttributeSuggest({
  value,
  onChange,
  placeholder = "仕様属性を検索...",
  disabled = false,
  className,
}: ItemAttributeSuggestProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<ItemAttributeDto[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedInput = useDebounce(inputValue, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load suggestions
  const loadSuggestions = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const response = await bffClient.suggestItemAttributes({
        keyword: keyword.trim(),
        limit: 20,
      })
      setSuggestions(response.items)
    } catch (err) {
      console.error("Failed to load suggestions:", err)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadSuggestions(debouncedInput)
    }
  }, [debouncedInput, open, loadSuggestions])

  // Update input when value changes externally
  useEffect(() => {
    if (value) {
      setInputValue(value.attributeName)
    } else {
      setInputValue("")
    }
  }, [value])

  const handleSelect = (attribute: ItemAttributeDto) => {
    onChange(attribute)
    setInputValue(attribute.attributeName)
    setOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setInputValue("")
    inputRef.current?.focus()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10 pr-8"
          />
          {value && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px]" align="start">
        <Command>
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : suggestions.length === 0 ? (
              <CommandEmpty>
                {inputValue.trim()
                  ? "該当する仕様属性が見つかりません"
                  : "キーワードを入力してください"
                }
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {suggestions.map((attribute) => (
                  <CommandItem
                    key={attribute.id}
                    value={attribute.id}
                    onSelect={() => handleSelect(attribute)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {value?.id === attribute.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <span className="font-mono text-sm">{attribute.attributeCode}</span>
                      <span>{attribute.attributeName}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {attribute.valueCount}値
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
