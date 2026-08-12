import React from 'react';
import { 
  calculateEstimatedSalary, 
  generateBadges, 
  extractRiskAlerts 
} from '../utils/helloworkParser';
import { MapPin, Clock, AlertTriangle, Eye, Star, Trash2 } from 'lucide-react';

export default function JobCard({ 
  job, 
  onSelect, 
  onToggleCompare, 
  isCompared, 
  onToggleFavorite, 
  isFavorite,
  onDelete 
}) {
  const salary = calculateEstimatedSalary(job);
  const badges = generateBadges(job);
  const alerts = extractRiskAlerts(job);

  return (
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

        {/* Risk / Alert Highlight (1件目のみカード表示) */}
        {alerts.length > 0 && (
          <div className="risk-alert-box">
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{alerts[0].title}</strong>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{alerts[0].description}</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="card-footer">
        <label className="compare-checkbox">
          <input 
            type="checkbox" 
            checked={isCompared}
            onChange={() => onToggleCompare(job.id)}
          />
          <span>比較リストに追加</span>
        </label>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.65rem', color: isFavorite ? 'var(--accent-amber)' : 'inherit' }}
            onClick={() => onToggleFavorite(job.id)}
            title="お気に入りに追加"
          >
            <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button 
            className="btn-primary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            onClick={() => onSelect(job)}
          >
            <Eye size={15} />
            詳細・シミュレーション
          </button>

          {onDelete && (
            <button 
              className="btn-secondary"
              style={{ padding: '0.45rem 0.65rem', color: 'var(--accent-rose)' }}
              onClick={() => onDelete(job.id)}
              title="この求人を削除"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
