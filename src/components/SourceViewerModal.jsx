import React, { useState } from 'react';
import { X, Code, FileText, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function SourceViewerModal({ job, onClose }) {
  if (!job) return null;

  const [activeTab, setActiveTab] = useState('raw'); // 'raw' | 'json'
  const [copied, setCopied] = useState(false);

  const rawTextContent = job.rawText || `求人番号: ${job.jobNo || '未指定'}
事業所名: ${job.company}
職種: ${job.title}
基本給: ${job.baseSalary}円
定額手当: ${job.regularAllowance}円
年間休日数: ${job.annualHolidays}日
時間外労働時間: 月平均${job.monthlyOvertime}時間
就業場所: ${job.location}
特記事項: ${job.specialNotes}`;

  const jsonContent = JSON.stringify(job, null, 2);

  const handleCopy = () => {
    const textToCopy = activeTab === 'raw' ? rawTextContent : jsonContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Code size={18} />
            <span>求人ソース確認コードビューア</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: '0.3rem 0 0.5rem' }}>
            {job.company} - {job.title}
          </h2>
        </div>

        {/* Source Subtabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="nav-tabs">
            <button
              className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              <FileText size={15} />
              元の求人票テキスト (Raw)
            </button>

            <button
              className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              <Code size={15} />
              構造化JSONデータ
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-secondary" 
              onClick={handleCopy}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
            >
              {copied ? <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
              {copied ? 'コピー完了' : 'ソースをコピー'}
            </button>

            <a 
              href="https://www.hellowork.mhlw.go.jp/" 
              target="_blank" 
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', textDecoration: 'none' }}
            >
              <ExternalLink size={14} />
              ハロワ公式で参照
            </a>
          </div>
        </div>

        {/* Code Display Area */}
        <div style={{
          background: '#090d16',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.2rem',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <pre style={{
            fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
            fontSize: '0.85rem',
            color: activeTab === 'json' ? '#60a5fa' : '#34d399',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5'
          }}>
            {activeTab === 'raw' ? rawTextContent : jsonContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
