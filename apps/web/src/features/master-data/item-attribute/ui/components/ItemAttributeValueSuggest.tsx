"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, X, Loader2, Check } from "lucide-react"
import type { ItemAttributeValueDto } from "../types/bff-contracts"
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

interface ItemAttributeValueSuggestProps {
  attributeId?: string  // Optional: filter by specific attribute
  value?: ItemAttributeValueDto | null
  onChange: (attributeValue: ItemAttributeValueDto | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ItemAttributeValueSuggest({
  attributeId,
  value,
  onChange,
  placeholder = "属性値を検索...",
  disabled = false,
  className,
}: ItemAttributeValueSuggestProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<ItemAttributeValueDto[]>([])
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
      const response = await bffClient.suggestItemAttributeValues({
        attributeId,
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
  }, [attributeId])

  useEffect(() => {
    if (open) {
      loadSuggestions(debouncedInput)
    }
  }, [debouncedInput, open, loadSuggestions])

  // Update input when value changes externally
  useEffect(() => {
    if (value) {
      setInputValue(value.valueName)
    } else {
      setInputValue("")
    }
  }, [value])

  // Reset when attributeId changes
  useEffect(() => {
    if (value && attributeId && value.attributeId !== attributeId) {
      onChange(null)
      setInputValue("")
    }
  }, [attributeId, value, onChange])

  const handleSelect = (attributeValue: ItemAttributeValueDto) => {
    onChange(attributeValue)
    setInputValue(attributeValue.valueName)
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
                  ? "該当する属性値が見つかりません"
                  : "キーワードを入力してください"
                }
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {suggestions.map((attrValue) => (
                  <CommandItem
                    key={attrValue.id}
                    value={attrValue.id}
                    onSelect={() => handleSelect(attrValue)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {value?.id === attrValue.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <span className="font-mono text-sm">{attrValue.valueCode}</span>
                      <span>{attrValue.valueName}</span>
                    </div>
                    {!attributeId && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {attrValue.attributeName}
                      </Badge>
                    )}
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
