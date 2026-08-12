import React, { useState } from 'react';
import { 
  calculateEstimatedSalary, 
  generateBadges, 
  extractRiskAlerts 
} from '../utils/helloworkParser';
import SourceViewerModal from './SourceViewerModal';
import { MapPin, Clock, AlertTriangle, Eye, Star, Trash2, Code, ExternalLink } from 'lucide-react';

export default function JobCard({ 
  job, 
  onSelect, 
  onToggleCompare, 
  isCompared, 
  onToggleFavorite, 
  isFavorite,
  onDelete 
}) {
  const [showSource, setShowSource] = useState(false);
  const salary = calculateEstimatedSalary(job);
  const badges = generateBadges(job);
  const alerts = extractRiskAlerts(job);

  const rawTextDisplay = job.rawText || `【ハローワーク求人ソース】
求人番号: ${job.jobNo || '未登録'}
事業所名: ${job.company}
職種名: ${job.title}
基本給: ${job.baseSalary}円
定額手当: ${job.regularAllowance}円
年間休日: ${job.annualHolidays}日
時間外労働: 月約${job.monthlyOvertime}時間
就業場所: ${job.location}
特記事項: ${job.specialNotes}`;

  return (
    <>
      <div className="job-card">
        <div>
          {/* Card Header */}
          <div className="card-header">
            <div>
              <div className="company-name">{job.company}</div>
              <h3 className="job-title">{job.title}</h3>
            </div>
            {job.jobNo && (
              <span className="job-no-tag">{job.jobNo}</span>
            )}
          </div>

          {/* Salary Hero Display */}
          <div className="salary-hero">
            <div>
              <div className="salary-label">推定想定年収</div>
              <div className="salary-value">
                約 {(salary.annualTotal / 10000).toFixed(1)} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>万円</span>
              </div>
            </div>
            <div className="salary-monthly-sub">
              月給目安 <strong style={{ color: '#fff' }}>{(salary.monthlyTotal / 10000).toFixed(1)}万円</strong>
              <br />
              <span style={{ fontSize: '0.72rem' }}>基本給 + 手当 + 賞与換算</span>
            </div>
          </div>

          {/* Badges */}
          <div className="badge-group">
            {badges.map((b, i) => (
              <span key={i} className={`badge ${b.type}`}>
                {b.text}
              </span>
            ))}
          </div>

          {/* Meta Info */}
          <div className="card-meta-list">
            <div className="meta-item">
              <MapPin size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span>{job.location}</span>
            </div>
            <div className="meta-item">
              <Clock size={15} style={{ color: 'var(--accent-blue)' }} />
              <span>{job.workingHours} (残業約 {job.monthlyOvertime}h/月)</span>
            </div>
          </div>

          {/* Alert Highlight */}
          {alerts.length > 0 && (
            <div className="risk-alert-box">
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{alerts[0].title}</strong>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{alerts[0].description}</div>
              </div>
            </div>
          )}

          {/* 📄 目立つ原文ソース直接切り替えエリア */}
          <div style={{ margin: '0.75rem 0' }}>
            <button 
              className="btn-secondary"
              onClick={() => setShowSource(true)}
              style={{
                width: '100%',
                fontSize: '0.8rem',
                padding: '0.45rem',
                justify: 'center',
                borderColor: 'rgba(56, 189, 248, 0.4)',
                background: 'rgba(56, 189, 248, 0.08)',
                color: '#38bdf8'
              }}
            >
              <Code size={15} />
              📄 元のハローワーク求人ソースを表示
            </button>
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="card-footer">
          <label className="compare-checkbox">
            <input 
              type="checkbox" 
              checked={isCompared}
              onChange={() => onToggleCompare(job.id)}
            />
            <span>比較リストに追加</span>
          </label>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              className="btn-secondary"
              style={{ padding: '0.45rem 0.6rem', color: isFavorite ? 'var(--accent-amber)' : 'inherit' }}
              onClick={() => onToggleFavorite(job.id)}
              title="お気に入りに追加"
            >
              <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button 
              className="btn-primary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
              onClick={() => onSelect(job)}
            >
              <Eye size={14} />
              詳細
            </button>

            {onDelete && (
              <button 
                className="btn-secondary"
                style={{ padding: '0.45rem 0.6rem', color: 'var(--accent-rose)' }}
                onClick={() => onDelete(job.id)}
                title="この求人を削除"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 原文ソース モーダル */}
      {showSource && (
        <SourceViewerModal 
          job={job} 
          onClose={() => setShowSource(false)} 
        />
      )}
    </>
  );
}
