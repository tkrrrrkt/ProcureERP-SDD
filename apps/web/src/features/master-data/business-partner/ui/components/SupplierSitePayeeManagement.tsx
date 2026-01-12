"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import type { PartyDto } from "../types/bff-contracts"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../utils/error-messages"
import { SupplierSiteList } from "./SupplierSiteList"
import { PayeeList } from "./PayeeList"

// TODO: Import from @/shared/ui
function Card({ children, className = "" }: any) {
  return <div className={`bg-card border border-border rounded-lg ${className}`}>{children}</div>
}

function Alert({ children, variant = "default" }: any) {
  const variantClass = variant === "destructive" ? "bg-destructive/10 text-destructive border-destructive" : "bg-muted"
  return <div className={`p-4 rounded-lg border ${variantClass}`}>{children}</div>
}

function Tabs({ value, onValueChange, children }: any) {
  return <div>{children}</div>
}

function TabsList({ children, className = "" }: any) {
  return <div className={`flex gap-2 border-b border-border ${className}`}>{children}</div>
}

function TabsTrigger({ value, currentValue, onValueChange, children }: any) {
  const isActive = value === currentValue
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-4 py-2 font-medium transition-colors ${
        isActive ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, currentValue, children }: any) {
  if (value !== currentValue) return null
  return <div className="py-4">{children}</div>
}

export function SupplierSitePayeeManagement() {
  const searchParams = useSearchParams()
  const partyId = searchParams.get("partyId")

  const [party, setParty] = useState<PartyDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"supplier-sites" | "payees">("supplier-sites")

  useEffect(() => {
    if (partyId) {
      loadParty()
    }
  }, [partyId])

  const loadParty = async () => {
    if (!partyId) return

    setLoading(true)
    setError(null)
    try {
      const response = await bffClient.getParty(partyId)
      setParty(response.party)
    } catch (err: any) {
      setError(getErrorMessage(err.message))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (error || !party) {
    return (
      <div className="p-8">
        <Alert variant="destructive">{error || "取引先が見つかりません"}</Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">仕入先・支払先管理</h1>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">取引先:</span> {party.partyName} ({party.partyCode})
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="px-4">
            <TabsTrigger value="supplier-sites" currentValue={activeTab} onValueChange={setActiveTab}>
              仕入先拠点
            </TabsTrigger>
            <TabsTrigger value="payees" currentValue={activeTab} onValueChange={setActiveTab}>
              支払先
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="supplier-sites" currentValue={activeTab}>
              <SupplierSiteList partyId={partyId!} party={party} />
            </TabsContent>

            <TabsContent value="payees" currentValue={activeTab}>
              <PayeeList partyId={partyId!} party={party} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
