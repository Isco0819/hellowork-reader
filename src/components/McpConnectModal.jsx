import React, { useState } from 'react';
import { X, Cpu, Copy, CheckCircle2, Download, Terminal, Sparkles } from 'lucide-react';

export default function McpConnectModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const mcpConfigJson = `{
  "mcpServers": {
    "hellowork-reader": {
      "command": "node",
      "args": [
        "/Users/shigeyamakensei/claude-company/hellowork-reader/mcp-server.js"
      ]
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mcpConfigJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(mcpConfigJson);
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "claude_desktop_config.json");
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 120 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontSize: '0.9rem', fontWeight: 600 }}>
            <Cpu size={20} />
            <span>ワンクリック AI x MCP 連携セットアップ</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0.4rem 0 0.4rem' }}>
            お使いのAI（Claude / Gemini / Antigravity）にワンタップ接続
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)' }}>
            この設定を行うと、日常のAIチャット対話から直接「ハロワ求人メモリ」へアクセス・検索・自動保存できるようになります！
          </p>
        </div>

        {/* Action Buttons & Config Box */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={15} /> MCP設定 JSON (claude_desktop_config.json)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn-primary" 
                onClick={handleCopy}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                {copied ? 'コピー完了！' : '1クリックコピー'}
              </button>
              <button 
                className="btn-secondary" 
                onClick={handleDownloadConfig}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                <Download size={15} />
                JSON保存
              </button>
            </div>
          </div>

          <pre style={{
            background: '#090d16',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            color: '#60a5fa',
            overflowX: 'auto',
            fontFamily: 'Consolas, Monaco, monospace'
          }}>
            {mcpConfigJson}
          </pre>
        </div>

        {/* 3 Step Guide */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="detail-box">
            <div className="detail-box-label">STEP 1: 設定保存</div>
            <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.3rem' }}>
              上記のJSONをコピーし <code>claude_desktop_config.json</code> に貼り付け
            </div>
          </div>

          <div className="detail-box">
            <div className="detail-box-label">STEP 2: AI再起動</div>
            <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.3rem' }}>
              Claude Desktop や AIアプリを再起動すると🔌マークが自動点灯
            </div>
          </div>

          <div className="detail-box">
            <div className="detail-box-label">STEP 3: チャット開始</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', marginTop: '0.3rem', fontWeight: 600 }}>
              「東京の休日120日以上の求人出して」と会話するだけ！
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={onClose}>
            完了・閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
