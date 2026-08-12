# 🔌 ハローワーク求人スッキリViewer MCP (Model Context Protocol) 接続ガイド

本アプリのMCPサーバーをAI（Claude DesktopやAntigravity等）に登録することで、**AIとの通常のチャット中に「メモリから自分に合う求人を出して」「求人番号〇〇を登録して」と指示するだけで求人の抽出・分析・自動追加が可能になります！**

---

## 🛠️ 提供される 4つの MCP ツール

1. `search_hellowork_jobs`:
   - AIがユーザーの希望条件（「年間休日120日以上」「想定年収380万以上」「残業10h以下」「Web系」など）に合う求人をメモリから検索しておすすめ。
2. `list_hellowork_jobs`:
   - メモリに保存中の全求人リストと概要を取得。
3. `get_hellowork_job_detail`:
   - 特定の求人の給与構成・内訳・試用期間・注意点アラートの全詳細を取得。
4. `add_hellowork_job_by_no`:
   - 会話中に伝える求人番号（例: `13010-45892141`）をAIが自動取得しアプリのメモリに登録。

---

## ⚙️ Claude Desktop 設定手順

`~/Library/Application Support/Claude/claude_desktop_config.json` に以下の設定を追加してください：

```json
{
  "mcpServers": {
    "hellowork-reader": {
      "command": "node",
      "args": [
        "/Users/shigeyamakensei/claude-company/hellowork-reader/mcp-server.js"
      ]
    }
  }
}
```

---

## 💬 AIへの話しかけ例（使用シナリオ）

AIとのチャットで以下のように伝えるだけで、MCPツールが自動呼び出しされます！

- 💬 **「ハロワViewerのメモリから、年間休日120日以上で想定年収が一番高いエンジニア求人を抽出して！」**
  👉 AIが `search_hellowork_jobs` を呼び出し、おすすめ求人をレポート。

- 💬 **「この求人番号 13010-45892141 をハロワViewerに登録しておいて」**
  👉 AIが `add_hellowork_job_by_no` を呼び出し、即座に保存。

- 💬 **「保存してる求人の平均年収と、注意が必要な求人を教えて」**
  👉 AIが `list_hellowork_jobs` を解析して回答。
