import React, { useState } from 'react';
import { Search, Layers, BarChart2, PlusCircle, RefreshCw, FileText, Cpu } from 'lucide-react';
import McpConnectModal from './McpConnectModal';

export default function Header({ activeTab, setActiveTab, compareCount, jobCount, onResetSamples }) {
  const [showMcpModal, setShowMcpModal] = useState(false);

  return (
    <>
      <header className="glass-header">
        <div className="logo-group">
          <div className="logo-icon">
            <FileText size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 className="logo-title">ハロワ求人スッキリViewer</h1>
              <span className="logo-badge">訓練生・求職者応援</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
              見づらい求人票を想定年収・年間休日・注意点付きカードに一括変換
            </p>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Search size={17} />
            求人一覧 ({jobCount})
          </button>

          <button
            className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            <Layers size={17} />
            横並び比較
            {compareCount > 0 && (
              <span style={{
                background: 'var(--accent-emerald)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '99px',
                marginLeft: '0.2rem'
              }}>
                {compareCount}
              </span>
            )}
          </button>

          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={17} />
            年収・休日分析
          </button>

          <button
            className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <PlusCircle size={17} />
            求人読み込み
          </button>
        </nav>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* MCP ワンクリック接続ボタン */}
          <button 
            className="btn-primary"
            onClick={() => setShowMcpModal(true)}
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}
          >
            <Cpu size={16} />
            🔌 AIとMCP連携
          </button>

          <button 
            className="btn-secondary"
            onClick={onResetSamples}
            title="初期サンプル求人を再読み込み"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
          >
            <RefreshCw size={14} />
            サンプル再読込
          </button>
        </div>
      </header>

      {/* MCP 接続モーダル */}
      {showMcpModal && (
        <McpConnectModal onClose={() => setShowMcpModal(false)} />
      )}
    </>
  );
}
