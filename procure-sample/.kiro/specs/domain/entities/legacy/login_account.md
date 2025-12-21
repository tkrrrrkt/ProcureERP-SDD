# アカウント（login_account）

## 定義表
| 論理名       | 物理名            | 型         | 長さ/精度 | 必須  | 既定値    | 備考                                                                 |
| --------- | -------------- | --------- | ----- | --- | ------ | ------------------------------------------------------------------ |
| ID        | id             | UUID      | -     | ○   | -      | PK                                                                 |
| テナントID    | tenant_id      | UUID      | -     | ○   | -      |                                                                    |
| 社員ID      | employee_id    | UUID      | -     | ○   | -      | employees へのFK（**1:1**は UNIQUE で担保）                                |
| ログインID    | login_id       | TEXT      | -     | ○   | -      | ユーザー名/メール/UPN いずれか。**テナント内一意**                                     |
| 認証プロバイダ   | auth_provider  | TEXT      | -     | ○   | LOCAL  | CHECK IN ('LOCAL','AZURE_AD','GOOGLE','OKTA','SAML','OIDC')        |
| IdPサブジェクト | idp_subject    | TEXT      | -     | -   | -      | SSOの`sub`等。**(tenant_id,auth_provider,idp_subject)一意**             |
| パスワードハッシュ | password_hash  | TEXT      | -     | -   | -      | `auth_provider='LOCAL'` のみ使用                                       |
| MFA有効     | mfa_enabled    | BOOLEAN   | -     | ○   | false  |                                                                    |
| アカウント状態   | account_status | TEXT      | -     | ○   | ACTIVE | CHECK IN ('ACTIVE','LOCKED','SUSPENDED','INVITED','DEPROVISIONED') |
| 最終ログイン    | last_login_at  | TIMESTAMP | -     | -   | -      |                                                                    |
| 作成日時      | created_at     | TIMESTAMP | -     | ○   | now()  |                                                                    |
| 更新日時      | updated_at     | TIMESTAMP | -     | ○   | now()  |                                                                    |
