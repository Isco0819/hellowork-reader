import React, { useState } from 'react';
import { X, Code, FileText, Copy, ExternalLink, CheckCircle2, Globe } from 'lucide-react';

export default function SourceViewerModal({ job, onClose }) {
  if (!job) return null;

  const [activeTab, setActiveTab] = useState('raw'); // 'raw' | 'json'
  const [copied, setCopied] = useState(false);

  const rawTextContent = job.rawText || `【ハローワーク求人票 生データ】
求人番号: ${job.jobNo || '未指定'}
事業所名: ${job.company}
職種名: ${job.title}
基本給: ${Number(job.baseSalary || 0).toLocaleString()}円
定額手当: ${Number(job.regularAllowance || 0).toLocaleString()}円
固定残業代: ${Number(job.fixedOvertimePay || 0).toLocaleString()}円 (${job.fixedOvertimeHours || 0}時間分)
年間休日数: ${job.annualHolidays}日 (${job.weeklyDaysOff || '週休2日'})
時間外労働時間: 月平均${job.monthlyOvertime || 0}時間
就業場所: ${job.location}
特記事項/備考: ${job.specialNotes || '特記事項なし'}
取得日時: ${job.parsedAt || new Date().toLocaleDateString('ja-JP')}`;

  const jsonContent = JSON.stringify(job, null, 2);

  const handleCopy = () => {
    const textToCopy = activeTab === 'raw' ? rawTextContent : jsonContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 150 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.88rem', fontWeight: 600 }}>
            <Code size={20} />
            <span>ハローワーク求人 原文ソースコード確認ビューア</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0.4rem 0 0.5rem' }}>
            {job.company} — {job.title}
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
            求人番号: <code style={{ color: 'var(--accent-emerald)' }}>{job.jobNo || '未登録'}</code>
          </div>
        </div>

        {/* Source Subtabs & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="nav-tabs">
            <button
              className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              <FileText size={16} />
              📄 生の求人票テキスト (Raw Source)
            </button>

            <button
              className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              <Code size={16} />
              構造化JSONデータ
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-primary" 
              onClick={handleCopy}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            >
              {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copied ? 'コピー完了！' : 'ソースをコピー'}
            </button>

            <a 
              href="https://www.hellowork.mhlw.go.jp/" 
              target="_blank" 
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Globe size={15} />
              ハロワ公式Webで開く
            </a>
          </div>
        </div>

        {/* Code Display Area */}
        <div style={{
          background: '#070a12',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          maxHeight: '450px',
          overflowY: 'auto'
        }}>
          <pre style={{
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '0.9rem',
            color: activeTab === 'json' ? '#60a5fa' : '#34d399',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6'
          }}>
            {activeTab === 'raw' ? rawTextContent : jsonContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
