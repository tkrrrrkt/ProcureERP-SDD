import type { UnitMasterBffErrorCode } from "../types/bff-contracts"

export function getErrorMessage(code: UnitMasterBffErrorCode | string): string {
  switch (code) {
    case "UOM_GROUP_NOT_FOUND":
      return "単位グループが見つかりません"
    case "UOM_GROUP_CODE_DUPLICATE":
      return "単位グループコードが重複しています"
    case "UOM_NOT_FOUND":
      return "単位が見つかりません"
    case "UOM_CODE_DUPLICATE":
      return "単位コードが重複しています"
    case "UOM_GROUP_HAS_ACTIVE_UOMS":
      return "有効な単位が存在するため、グループを無効化できません"
    case "BASE_UOM_CANNOT_BE_DEACTIVATED":
      return "基準単位は無効化できません"
    case "INVALID_CODE_FORMAT":
      return "コードは英大文字・数字・ハイフン・アンダースコアで入力してください"
    case "REQUIRED_FIELD_MISSING":
      return "必須項目が入力されていません"
    case "CONCURRENT_UPDATE":
      return "他のユーザーによって更新されています。再度読み込んでください"
    default:
      return "エラーが発生しました"
  }
}
