import type { BffErrorCode } from "../types/bff-contracts"

export function getErrorMessage(code: BffErrorCode | string): string {
  switch (code) {
    case "PARTY_NOT_FOUND":
      return "取引先が見つかりません"
    case "PARTY_CODE_DUPLICATE":
      return "取引先コードが重複しています"
    case "SUPPLIER_SITE_NOT_FOUND":
      return "仕入先拠点が見つかりません"
    case "SUPPLIER_CODE_DUPLICATE":
      return "仕入先コードが重複しています"
    case "PAYEE_NOT_FOUND":
      return "支払先が見つかりません"
    case "PAYEE_CODE_DUPLICATE":
      return "支払先コードが重複しています"
    case "INVALID_CODE_LENGTH":
      return "コードは10桁で入力してください"
    case "REQUIRED_FIELD_MISSING":
      return "必須項目が入力されていません"
    case "CONCURRENT_UPDATE":
      return "他のユーザーによって更新されています。再度読み込んでください"
    default:
      return "エラーが発生しました"
  }
}
