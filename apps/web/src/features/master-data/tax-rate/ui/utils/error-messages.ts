/**
 * Error Messages
 *
 * BFF エラーコードをユーザーフレンドリーなメッセージに変換
 */

const ERROR_MESSAGES: Record<string, string> = {
  // Tax Rate specific errors
  TAX_RATE_NOT_FOUND: "指定された税率が見つかりません",
  TAX_RATE_CODE_DUPLICATE: "この税率コードは既に使用されています",
  INVALID_DATE_RANGE: "適用終了日は適用開始日以降の日付を指定してください",
  VERSION_CONFLICT: "他のユーザーによって更新されています。再読み込みしてください",
  RATE_PERCENT_NOT_EDITABLE: "税率値は変更できません",

  // Generic errors
  UNKNOWN_ERROR: "予期しないエラーが発生しました",
  NETWORK_ERROR: "通信エラーが発生しました",
  UNAUTHORIZED: "認証エラーが発生しました。再ログインしてください",
  FORBIDDEN: "この操作を行う権限がありません",
}

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR
}
