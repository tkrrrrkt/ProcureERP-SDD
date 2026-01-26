"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type {
  PartyDto,
  PayeeDto,
  CreatePayeeRequest,
  UpdatePayeeRequest,
  PayeeBankAccountDto,
  AccountCategory,
  AccountType,
  TransferFeeBearer,
  BankSummary,
  BranchSummary,
  CompanyBankAccountSummary,
} from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { normalizeCode, validateCodeLength } from "../utils/code-normalizer"

// TODO: Import from @/shared/ui
function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-card rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ children }: any) {
  return <div className="p-6 border-b border-border">{children}</div>
}

function DialogTitle({ children }: any) {
  return <h2 className="text-xl font-bold">{children}</h2>
}

function DialogContent({ children }: any) {
  return <div className="p-6">{children}</div>
}

function DialogFooter({ children }: any) {
  return <div className="p-6 border-t border-border flex justify-end gap-3">{children}</div>
}

function Button({ children, onClick, variant = "default", disabled = false }: any) {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors text-sm"
  const variantClass =
    variant === "outline"
      ? "border border-border bg-background hover:bg-accent"
      : "bg-primary text-primary-foreground hover:bg-primary/90"
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : ""
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variantClass} ${disabledClass}`}>
      {children}
    </button>
  )
}

function Input({ label, value, onChange, placeholder, error, maxLength, required, disabled }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg bg-background text-sm ${error ? "border-destructive" : "border-input"} ${disabled ? "opacity-50" : ""}`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function Select({ label, value, onChange, options, required, disabled }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-input rounded-lg bg-background text-sm ${disabled ? "opacity-50" : ""}`}
      >
        {options.map((opt: { value: string; label: string }) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
      />
    </div>
  )
}

function Checkbox({ label, checked, onChange }: any) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </label>
  )
}

function Alert({ children, variant = "default" }: any) {
  const variantClass = variant === "destructive" ? "bg-destructive/10 text-destructive border-destructive" : "bg-muted"
  return <div className={`p-3 rounded-lg border text-sm ${variantClass}`}>{children}</div>
}

// BankSuggestInput - Suggest input for bank selection
function BankSuggestInput({
  label,
  value,
  displayValue,
  onSelect,
  placeholder,
  error,
  required,
  disabled,
}: {
  label: string
  value: string | null
  displayValue: string
  onSelect: (bank: BankSummary | null) => void
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
}) {
  const [inputValue, setInputValue] = useState(displayValue)
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<BankSummary[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(displayValue)
  }, [displayValue])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)

    // Clear selection if input changes
    if (value && newValue !== displayValue) {
      onSelect(null)
    }

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (newValue.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setLoading(true)
        try {
          const response = await bffClient.searchBanks({ keyword: newValue, limit: 10 })
          setSuggestions(response.items)
          setIsOpen(true)
        } catch {
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      }, 300)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }

  const handleSelect = (bank: BankSummary) => {
    onSelect(bank)
    setInputValue(`${bank.bankName} (${bank.bankCode})`)
    setIsOpen(false)
    setSuggestions([])
  }

  const handleClear = () => {
    onSelect(null)
    setInputValue("")
    setSuggestions([])
  }

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg bg-background text-sm pr-8 ${error ? "border-destructive" : "border-input"} ${disabled ? "opacity-50" : ""}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
        {loading && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
            検索中...
          </span>
        )}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => handleSelect(bank)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex justify-between items-center"
              >
                <span>{bank.bankName}</span>
                <span className="text-muted-foreground">{bank.bankCode}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// BranchSuggestInput - Suggest input for branch selection
function BranchSuggestInput({
  label,
  bankId,
  value,
  displayValue,
  onSelect,
  placeholder,
  error,
  required,
  disabled,
}: {
  label: string
  bankId: string | null
  value: string | null
  displayValue: string
  onSelect: (branch: BranchSummary | null) => void
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
}) {
  const [inputValue, setInputValue] = useState(displayValue)
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<BranchSummary[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isDisabled = disabled || !bankId

  useEffect(() => {
    setInputValue(displayValue)
  }, [displayValue])

  // Clear branch when bank changes
  useEffect(() => {
    if (!bankId && value) {
      onSelect(null)
      setInputValue("")
    }
  }, [bankId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)

    // Clear selection if input changes
    if (value && newValue !== displayValue) {
      onSelect(null)
    }

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (newValue.length >= 2 && bankId) {
      debounceRef.current = setTimeout(async () => {
        setLoading(true)
        try {
          const response = await bffClient.searchBranches({ bankId, keyword: newValue, limit: 10 })
          setSuggestions(response.items)
          setIsOpen(true)
        } catch {
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      }, 300)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }

  const handleSelect = (branch: BranchSummary) => {
    onSelect(branch)
    setInputValue(`${branch.branchName} (${branch.branchCode})`)
    setIsOpen(false)
    setSuggestions([])
  }

  const handleClear = () => {
    onSelect(null)
    setInputValue("")
    setSuggestions([])
  }

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={isDisabled && !disabled ? "銀行を先に選択してください" : placeholder}
          disabled={isDisabled}
          className={`w-full px-3 py-2 border rounded-lg bg-background text-sm pr-8 ${error ? "border-destructive" : "border-input"} ${isDisabled ? "opacity-50" : ""}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
        {loading && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
            検索中...
          </span>
        )}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => handleSelect(branch)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex justify-between items-center"
              >
                <span>{branch.branchName}</span>
                <span className="text-muted-foreground">{branch.branchCode}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// Account category options
const accountCategoryOptions = [
  { value: "bank", label: "銀行" },
  { value: "post_office", label: "ゆうちょ銀行" },
  { value: "ja_bank", label: "農協" },
]

// Account type options
const accountTypeOptions = [
  { value: "ordinary", label: "普通" },
  { value: "current", label: "当座" },
  { value: "savings", label: "貯蓄" },
  { value: "other", label: "その他" },
]

// Transfer fee bearer options
const transferFeeBearerOptions = [
  { value: "sender", label: "当社負担" },
  { value: "recipient", label: "先方負担" },
]

export function PayeeDialog({
  open,
  onOpenChange,
  partyId,
  party,
  payee,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  partyId: string
  party: PartyDto
  payee?: PayeeDto
  onSuccess: () => void
}) {
  const isEdit = !!payee

  // Payee fields
  const [payeeSubCode, setPayeeSubCode] = useState("")
  const [payeeName, setPayeeName] = useState("")
  const [payeeNameKana, setPayeeNameKana] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [prefecture, setPrefecture] = useState("")
  const [city, setCity] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [phone, setPhone] = useState("")
  const [fax, setFax] = useState("")
  const [email, setEmail] = useState("")
  const [contactName, setContactName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [currencyCode, setCurrencyCode] = useState("JPY")
  const [paymentTermsText, setPaymentTermsText] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Bank account fields
  const [bankAccount, setBankAccount] = useState<PayeeBankAccountDto | null>(null)
  const [accountCategory, setAccountCategory] = useState<AccountCategory>("bank")
  const [accountType, setAccountType] = useState<AccountType>("ordinary")
  const [accountNo, setAccountNo] = useState("")
  const [postOfficeSymbol, setPostOfficeSymbol] = useState("")
  const [postOfficeNumber, setPostOfficeNumber] = useState("")
  const [accountHolderName, setAccountHolderName] = useState("")
  const [accountHolderNameKana, setAccountHolderNameKana] = useState("")
  const [transferFeeBearer, setTransferFeeBearer] = useState<TransferFeeBearer>("sender")
  const [bankAccountNotes, setBankAccountNotes] = useState("")

  // Bank/Branch selection state (for bank master integration)
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [selectedBankDisplay, setSelectedBankDisplay] = useState("")
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [selectedBranchDisplay, setSelectedBranchDisplay] = useState("")

  // Company bank account (出金口座) state
  const [companyBankAccounts, setCompanyBankAccounts] = useState<CompanyBankAccountSummary[]>([])
  const [selectedCompanyBankAccountId, setSelectedCompanyBankAccountId] = useState<string>("")
  const [loadingCompanyBankAccounts, setLoadingCompanyBankAccounts] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Load company bank accounts when dialog opens
  useEffect(() => {
    if (open) {
      loadCompanyBankAccounts()
    }
  }, [open])

  const loadCompanyBankAccounts = async () => {
    setLoadingCompanyBankAccounts(true)
    try {
      const response = await bffClient.listCompanyBankAccounts({ isActive: true })
      setCompanyBankAccounts(response.items)
    } catch {
      setCompanyBankAccounts([])
    } finally {
      setLoadingCompanyBankAccounts(false)
    }
  }

  // Load payee and bank account data
  useEffect(() => {
    if (payee) {
      setPayeeSubCode(payee.payeeSubCode)
      setPayeeName(payee.payeeName)
      setPayeeNameKana(payee.payeeNameKana || "")
      setPostalCode(payee.postalCode || "")
      setPrefecture(payee.prefecture || "")
      setCity(payee.city || "")
      setAddressLine1(payee.addressLine1 || "")
      setAddressLine2(payee.addressLine2 || "")
      setPhone(payee.phone || "")
      setFax(payee.fax || "")
      setEmail(payee.email || "")
      setContactName(payee.contactName || "")
      setPaymentMethod(payee.paymentMethod || "")
      setCurrencyCode(payee.currencyCode || "JPY")
      setPaymentTermsText(payee.paymentTermsText || "")
      setIsActive(payee.isActive)
      // Set default company bank account
      setSelectedCompanyBankAccountId(payee.defaultCompanyBankAccountId || "")

      // Load bank account
      loadBankAccount(payee.id)
    } else {
      resetForm()
    }
    setErrors({})
    setApiError(null)
  }, [payee, open])

  const loadBankAccount = async (payeeId: string) => {
    try {
      const response = await bffClient.listPayeeBankAccounts({ payeeId })
      if (response.items.length > 0) {
        const account = response.items[0]
        setBankAccount(account)
        setAccountCategory(account.accountCategory)
        setAccountType(account.accountType)
        setAccountNo(account.accountNo || "")
        setPostOfficeSymbol(account.postOfficeSymbol || "")
        setPostOfficeNumber(account.postOfficeNumber || "")
        setAccountHolderName(account.accountHolderName)
        setAccountHolderNameKana(account.accountHolderNameKana || "")
        setTransferFeeBearer(account.transferFeeBearer)
        setBankAccountNotes(account.notes || "")
        // Set bank/branch selection state
        setSelectedBankId(account.bankId)
        setSelectedBankDisplay(account.bankId && account.bankName ? `${account.bankName} (${account.bankCode})` : "")
        setSelectedBranchId(account.bankBranchId)
        setSelectedBranchDisplay(account.bankBranchId && account.branchName ? `${account.branchName} (${account.branchCode})` : "")
      } else {
        resetBankAccountForm()
      }
    } catch {
      resetBankAccountForm()
    }
  }

  const resetBankAccountForm = () => {
    setBankAccount(null)
    setAccountCategory("bank")
    setAccountType("ordinary")
    setAccountNo("")
    setPostOfficeSymbol("")
    setPostOfficeNumber("")
    setAccountHolderName("")
    setAccountHolderNameKana("")
    setTransferFeeBearer("sender")
    setBankAccountNotes("")
    // Reset bank/branch selection state
    setSelectedBankId(null)
    setSelectedBankDisplay("")
    setSelectedBranchId(null)
    setSelectedBranchDisplay("")
  }

  const resetForm = () => {
    setPayeeSubCode("")
    setPayeeName("")
    setPayeeNameKana("")
    setPostalCode("")
    setPrefecture("")
    setCity("")
    setAddressLine1("")
    setAddressLine2("")
    setPhone("")
    setFax("")
    setEmail("")
    setContactName("")
    setPaymentMethod("")
    setCurrencyCode("JPY")
    setPaymentTermsText("")
    setIsActive(true)
    setSelectedCompanyBankAccountId("")
    resetBankAccountForm()
  }

  const handlePayeeSubCodeChange = (value: string) => {
    const normalized = normalizeCode(value)
    setPayeeSubCode(normalized)
    if (errors.payeeSubCode) {
      setErrors({ ...errors, payeeSubCode: "" })
    }
  }

  // Bank/Branch selection handlers
  const handleBankSelect = (bank: BankSummary | null) => {
    if (bank) {
      setSelectedBankId(bank.id)
      setSelectedBankDisplay(`${bank.bankName} (${bank.bankCode})`)
    } else {
      setSelectedBankId(null)
      setSelectedBankDisplay("")
    }
    // Clear branch when bank changes
    setSelectedBranchId(null)
    setSelectedBranchDisplay("")
    if (errors.bank) {
      setErrors({ ...errors, bank: "" })
    }
  }

  const handleBranchSelect = (branch: BranchSummary | null) => {
    if (branch) {
      setSelectedBranchId(branch.id)
      setSelectedBranchDisplay(`${branch.branchName} (${branch.branchCode})`)
    } else {
      setSelectedBranchId(null)
      setSelectedBranchDisplay("")
    }
    if (errors.branch) {
      setErrors({ ...errors, branch: "" })
    }
  }

  // Handle account category change - reset bank/branch when switching to post_office
  const handleAccountCategoryChange = (value: AccountCategory) => {
    setAccountCategory(value)
    if (value === "post_office") {
      setSelectedBankId(null)
      setSelectedBankDisplay("")
      setSelectedBranchId(null)
      setSelectedBranchDisplay("")
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!payeeSubCode) {
      newErrors.payeeSubCode = "支払先コード（枝番）は必須です"
    } else if (!validateCodeLength(payeeSubCode)) {
      newErrors.payeeSubCode = "支払先コード（枝番）は10桁で入力してください"
    }

    if (!payeeName.trim()) {
      newErrors.payeeName = "支払先名は必須です"
    }

    // Bank account validation (if any bank field is filled)
    const hasBankData = accountHolderName.trim() || accountNo.trim() || postOfficeSymbol.trim() || selectedBankId
    if (hasBankData) {
      if (!accountHolderName.trim()) {
        newErrors.accountHolderName = "口座名義は必須です"
      }
      if (accountCategory === "bank" || accountCategory === "ja_bank") {
        // Bank master selection is required
        if (!selectedBankId) {
          newErrors.bank = "銀行を選択してください"
        }
        if (!selectedBranchId) {
          newErrors.branch = "支店を選択してください"
        }
        if (!accountNo.trim()) {
          newErrors.accountNo = "口座番号は必須です"
        } else if (!/^\d{7}$/.test(accountNo.trim())) {
          newErrors.accountNo = "口座番号は7桁の数字で入力してください"
        }
      }
      if (accountCategory === "post_office") {
        if (!postOfficeSymbol.trim()) {
          newErrors.postOfficeSymbol = "記号は必須です"
        } else if (!/^\d{5}$/.test(postOfficeSymbol.trim())) {
          newErrors.postOfficeSymbol = "記号は5桁の数字で入力してください"
        }
        if (!postOfficeNumber.trim()) {
          newErrors.postOfficeNumber = "番号は必須です"
        } else if (!/^\d{8}$/.test(postOfficeNumber.trim())) {
          newErrors.postOfficeNumber = "番号は8桁の数字で入力してください"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    setApiError(null)

    try {
      let savedPayeeId = payee?.id

      // Save payee
      if (isEdit && payee) {
        const request: UpdatePayeeRequest = {
          payeeName: payeeName.trim(),
          payeeNameKana: payeeNameKana.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          prefecture: prefecture.trim() || undefined,
          city: city.trim() || undefined,
          addressLine1: addressLine1.trim() || undefined,
          addressLine2: addressLine2.trim() || undefined,
          phone: phone.trim() || undefined,
          fax: fax.trim() || undefined,
          email: email.trim() || undefined,
          contactName: contactName.trim() || undefined,
          paymentMethod: paymentMethod.trim() || undefined,
          currencyCode: currencyCode.trim() || undefined,
          paymentTermsText: paymentTermsText.trim() || undefined,
          defaultCompanyBankAccountId: selectedCompanyBankAccountId || null,
          isActive,
          version: payee.version,
        }
        await bffClient.updatePayee(payee.id, request)
      } else {
        const request: CreatePayeeRequest = {
          partyId,
          payeeSubCode,
          payeeName: payeeName.trim(),
          payeeNameKana: payeeNameKana.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          prefecture: prefecture.trim() || undefined,
          city: city.trim() || undefined,
          addressLine1: addressLine1.trim() || undefined,
          addressLine2: addressLine2.trim() || undefined,
          phone: phone.trim() || undefined,
          fax: fax.trim() || undefined,
          email: email.trim() || undefined,
          contactName: contactName.trim() || undefined,
          paymentMethod: paymentMethod.trim() || undefined,
          currencyCode: currencyCode.trim() || undefined,
          paymentTermsText: paymentTermsText.trim() || undefined,
          defaultCompanyBankAccountId: selectedCompanyBankAccountId || undefined,
        }
        const result = await bffClient.createPayee(request)
        savedPayeeId = result.payee.id
      }

      // Save bank account if data is provided
      const hasBankData = accountHolderName.trim()
      if (hasBankData && savedPayeeId) {
        if (bankAccount) {
          // Update existing bank account
          await bffClient.updatePayeeBankAccount(bankAccount.id, {
            accountCategory,
            bankId: selectedBankId || undefined,
            bankBranchId: selectedBranchId || undefined,
            accountType,
            accountNo: accountNo.trim() || undefined,
            postOfficeSymbol: postOfficeSymbol.trim() || undefined,
            postOfficeNumber: postOfficeNumber.trim() || undefined,
            accountHolderName: accountHolderName.trim(),
            accountHolderNameKana: accountHolderNameKana.trim() || undefined,
            transferFeeBearer,
            isDefault: true,
            isActive: true,
            notes: bankAccountNotes.trim() || undefined,
            version: bankAccount.version,
          })
        } else {
          // Create new bank account
          await bffClient.createPayeeBankAccount({
            payeeId: savedPayeeId,
            accountCategory,
            bankId: selectedBankId || undefined,
            bankBranchId: selectedBranchId || undefined,
            accountType,
            accountNo: accountNo.trim() || undefined,
            postOfficeSymbol: postOfficeSymbol.trim() || undefined,
            postOfficeNumber: postOfficeNumber.trim() || undefined,
            accountHolderName: accountHolderName.trim(),
            accountHolderNameKana: accountHolderNameKana.trim() || undefined,
            transferFeeBearer,
            isDefault: true,
            notes: bankAccountNotes.trim() || undefined,
          })
        }
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setApiError(getErrorMessage(err.message))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "支払先編集" : "支払先新規登録"}</DialogTitle>
      </DialogHeader>

      <DialogContent>
        {apiError && <Alert variant="destructive">{apiError}</Alert>}

        <div className="space-y-6 mt-4">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-bold mb-3">基本情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="支払先コード（枝番）"
                value={payeeSubCode}
                onChange={handlePayeeSubCodeChange}
                placeholder="10桁の枝番を入力"
                error={errors.payeeSubCode}
                maxLength={10}
                required
                disabled={isEdit}
              />
              <div className="text-sm text-muted-foreground flex items-end pb-2">
                完全コード: {party.partyCode}-{payeeSubCode || "??????????"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="支払先名"
                value={payeeName}
                onChange={setPayeeName}
                placeholder="例: 株式会社サンプル商事 経理部"
                error={errors.payeeName}
                required
              />
              <Input
                label="支払先名カナ"
                value={payeeNameKana}
                onChange={setPayeeNameKana}
                placeholder="例: カブシキガイシャサンプルショウジ ケイリブ"
              />
            </div>
          </div>

          {/* Address & Contact */}
          <div>
            <h3 className="text-sm font-bold mb-3">住所・連絡先</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="郵便番号" value={postalCode} onChange={setPostalCode} placeholder="例: 100-0001" />
              <Input label="都道府県" value={prefecture} onChange={setPrefecture} placeholder="例: 東京都" />
              <Input label="市区町村" value={city} onChange={setCity} placeholder="例: 千代田区" />
              <Input label="住所1" value={addressLine1} onChange={setAddressLine1} placeholder="例: 丸の内1-1-1" />
              <Input label="住所2" value={addressLine2} onChange={setAddressLine2} placeholder="例: サンプルビル3F" />
              <Input label="電話" value={phone} onChange={setPhone} placeholder="例: 03-1234-5678" />
              <Input label="FAX" value={fax} onChange={setFax} placeholder="例: 03-1234-5679" />
              <Input label="メール" value={email} onChange={setEmail} placeholder="例: tokyo@sample.co.jp" />
              <Input label="担当者名" value={contactName} onChange={setContactName} placeholder="例: 山田太郎" />
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-sm font-bold mb-3">支払情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="支払方法" value={paymentMethod} onChange={setPaymentMethod} placeholder="例: 銀行振込" />
              <Input label="通貨" value={currencyCode} onChange={setCurrencyCode} placeholder="例: JPY" />
            </div>
            <div className="mt-4">
              <Select
                label="デフォルト出金口座（自社口座）"
                value={selectedCompanyBankAccountId}
                onChange={(v: string) => setSelectedCompanyBankAccountId(v)}
                options={[
                  { value: "", label: loadingCompanyBankAccounts ? "読み込み中..." : "選択してください" },
                  ...companyBankAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.accountName} - ${account.bankName} ${account.branchName} (${account.accountNo})`,
                  })),
                ]}
                disabled={loadingCompanyBankAccounts}
              />
              <p className="text-xs text-muted-foreground mt-1">
                この支払先への支払時に使用するデフォルトの出金口座を選択してください
              </p>
            </div>
            <div className="mt-4">
              <Textarea
                label="支払条件"
                value={paymentTermsText}
                onChange={setPaymentTermsText}
                placeholder="例: 月末締め翌月末払い"
              />
            </div>
          </div>

          {/* Bank Account */}
          <div>
            <h3 className="text-sm font-bold mb-3">振込口座</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="口座区分"
                value={accountCategory}
                onChange={(v: AccountCategory) => handleAccountCategoryChange(v)}
                options={accountCategoryOptions}
              />
              <Select
                label="振込手数料負担"
                value={transferFeeBearer}
                onChange={(v: TransferFeeBearer) => setTransferFeeBearer(v)}
                options={transferFeeBearerOptions}
              />
            </div>

            {/* Bank-specific fields with bank master integration */}
            {(accountCategory === "bank" || accountCategory === "ja_bank") && (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <BankSuggestInput
                    label="銀行"
                    value={selectedBankId}
                    displayValue={selectedBankDisplay}
                    onSelect={handleBankSelect}
                    placeholder="銀行名またはコードで検索"
                    error={errors.bank}
                    required
                  />
                  <BranchSuggestInput
                    label="支店"
                    bankId={selectedBankId}
                    value={selectedBranchId}
                    displayValue={selectedBranchDisplay}
                    onSelect={handleBranchSelect}
                    placeholder="支店名またはコードで検索"
                    error={errors.branch}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Select
                    label="口座種別"
                    value={accountType}
                    onChange={(v: AccountType) => setAccountType(v)}
                    options={accountTypeOptions}
                  />
                  <Input
                    label="口座番号"
                    value={accountNo}
                    onChange={setAccountNo}
                    placeholder="7桁の数字"
                    maxLength={7}
                    error={errors.accountNo}
                    required
                  />
                </div>
              </>
            )}

            {/* Post office-specific fields */}
            {accountCategory === "post_office" && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  label="記号"
                  value={postOfficeSymbol}
                  onChange={setPostOfficeSymbol}
                  placeholder="5桁の数字"
                  maxLength={5}
                  error={errors.postOfficeSymbol}
                  required
                />
                <Input
                  label="番号"
                  value={postOfficeNumber}
                  onChange={setPostOfficeNumber}
                  placeholder="8桁の数字"
                  maxLength={8}
                  error={errors.postOfficeNumber}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="口座名義"
                value={accountHolderName}
                onChange={setAccountHolderName}
                placeholder="例: カ）サンプルショウジ"
                error={errors.accountHolderName}
                required
              />
              <Input
                label="口座名義カナ"
                value={accountHolderNameKana}
                onChange={setAccountHolderNameKana}
                placeholder="例: カ）サンプルショウジ"
              />
            </div>

            <div className="mt-4">
              <Textarea
                label="備考"
                value={bankAccountNotes}
                onChange={setBankAccountNotes}
                placeholder="口座に関する備考"
                rows={2}
              />
            </div>
          </div>

          {isEdit && <Checkbox label="有効" checked={isActive} onChange={setIsActive} />}
        </div>
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
          キャンセル
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
