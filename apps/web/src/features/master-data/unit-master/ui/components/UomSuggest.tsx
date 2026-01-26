"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, Loader2, X, Check } from "lucide-react"
import type { UomDto } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { useDebounce } from "../hooks/useDebounce"

// Shared UI Components
import { Button } from "@/shared/ui/components/button"
import { Input } from "@/shared/ui/components/input"
import { Badge } from "@/shared/ui/components/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/components/popover"

interface UomSuggestProps {
  value?: UomDto
  onChange: (uom: UomDto | undefined) => void
  groupId?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function UomSuggest({
  value,
  onChange,
  groupId,
  placeholder = "単位を検索...",
  disabled = false,
  className,
}: UomSuggestProps) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [suggestions, setSuggestions] = useState<UomDto[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedKeyword = useDebounce(keyword, 200)

  const loadSuggestions = useCallback(async () => {
    if (!open) return

    setLoading(true)
    try {
      const response = await bffClient.suggestUoms({
        keyword: debouncedKeyword,
        groupId,
        limit: 10,
      })
      setSuggestions(response.items)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, groupId, open])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  const handleSelect = (uom: UomDto) => {
    onChange(uom)
    setOpen(false)
    setKeyword("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
    setKeyword("")
  }

  const displayValue = value
    ? `${value.uomCode} (${value.uomName})`
    : ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            {value ? (
              <span className="truncate">{displayValue}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          {value && !disabled && (
            <X
              className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            value={keyword}
            onValueChange={setKeyword}
            placeholder="コードまたは名称で検索..."
            className="h-9"
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && suggestions.length === 0 && (
              <CommandEmpty>単位が見つかりません</CommandEmpty>
            )}
            {!loading && suggestions.length > 0 && (
              <CommandGroup>
                {suggestions.map((uom) => (
                  <CommandItem
                    key={uom.id}
                    value={uom.id}
                    onSelect={() => handleSelect(uom)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        value?.id === uom.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{uom.uomCode}</span>
                        <span className="font-medium truncate">{uom.uomName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{uom.groupCode}</span>
                        {uom.isBaseUom && (
                          <Badge variant="secondary" className="text-xs py-0 h-4">
                            基準
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      x{uom.conversionFactor}
                    </span>
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

// Simplified version for forms
interface UomSelectProps {
  value?: string
  onChange: (uomId: string | undefined) => void
  groupId?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function UomSelect({
  value,
  onChange,
  groupId,
  placeholder = "単位を選択...",
  disabled = false,
  className,
}: UomSelectProps) {
  const [selectedUom, setSelectedUom] = useState<UomDto | undefined>()
  const [loading, setLoading] = useState(false)

  // Load initial value if provided
  useEffect(() => {
    if (value && !selectedUom) {
      setLoading(true)
      bffClient
        .getUom(value)
        .then((response) => {
          setSelectedUom(response.uom)
        })
        .catch(() => {
          setSelectedUom(undefined)
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (!value) {
      setSelectedUom(undefined)
    }
  }, [value, selectedUom])

  const handleChange = (uom: UomDto | undefined) => {
    setSelectedUom(uom)
    onChange(uom?.id)
  }

  if (loading) {
    return (
      <Button variant="outline" disabled className={`w-full ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        読み込み中...
      </Button>
    )
  }

  return (
    <UomSuggest
      value={selectedUom}
      onChange={handleChange}
      groupId={groupId}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  )
}
