import React, { useState } from 'react';
import { 
  calculateEstimatedSalary, 
  generateBadges, 
  extractRiskAlerts 
} from '../utils/helloworkParser';
import SourceViewerModal from './SourceViewerModal';
import { 
  X, 
  AlertTriangle, 
  Calculator, 
  CheckCircle2, 
  Building2, 
  Copy,
  Code
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function JobDetailModal({ job, onClose, onUpdateMemo }) {
  if (!job) return null;

  const [simBonusMonths, setSimBonusMonths] = useState(job.bonusMonths || 2.0);
  const [userMemo, setUserMemo] = useState(job.userMemo || '');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);

  const baseSalary = Number(job.baseSalary) || 0;
  const allowance = Number(job.regularAllowance) || 0;
  const fixedOvertimePay = Number(job.fixedOvertimePay) || 0;
  const monthlyFixedTotal = baseSalary + allowance + fixedOvertimePay;

  const simulatedAnnual = Math.round(
    (monthlyFixedTotal * 12) + (baseSalary * simBonusMonths)
  );

  const badges = generateBadges(job);
  const alerts = extractRiskAlerts(job);

  const handleShareCopy = () => {
    const text = `【求人共有】${job.company} (${job.title})
■ 推定年収: 約 ${(simulatedAnnual / 10000).toFixed(1)}万円
■ 月給内訳: 基本給 ${(baseSalary/10000).toFixed(1)}万 + 手当 ${(allowance/10000).toFixed(1)}万 (賞与:${simBonusMonths}ヶ月)
■ 年間休日: ${job.annualHolidays}日 (${job.weeklyDaysOff})
■ 残業時間: 月約${job.monthlyOvertime}時間
■ 勤務地: ${job.location}
■ 特記事項/注意点: ${alerts.map(a => a.title).join(' / ') || '特になし'}
---
ハロワ求人スッキリViewerで確認`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleSaveMemo = () => {
    if (onUpdateMemo) {
      onUpdateMemo(job.id, userMemo);
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      } catch (e) {}
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: 600 }}>
                <Building2 size={16} />
                <span>{job.company}</span>
                {job.jobNo && <span className="job-no-tag">求人番号: {job.jobNo}</span>}
              </div>

              {/* ソース確認ボタン */}
              <button 
                className="btn-secondary" 
                onClick={() => setShowSourceModal(true)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', gap: '0.35rem' }}
              >
                <Code size={14} style={{ color: 'var(--accent-blue)' }} />
                ソース・元テキスト確認
              </button>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0.4rem 0 0.8rem' }}>
              {job.title}
            </h2>

            <div className="badge-group">
              {badges.map((b, i) => (
                <span key={i} className={`badge ${b.type}`}>
                  {b.text}
                </span>
              ))}
            </div>
          </div>

          {/* 1. リスク・注意点アラート */}
          {alerts.length > 0 && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '1.2rem',
              marginBottom: '1.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem' }}>
                <AlertTriangle size={20} />
                <span>要チェック！求人の注意点・要約アラート ({alerts.length}件)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {alerts.map((alt, i) => (
                  <div key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem' }}>
                    <strong style={{ color: '#fde68a' }}>• {alt.title}</strong>
                    <div style={{ color: 'var(--text-sub)', marginTop: '0.2rem', fontSize: '0.82rem' }}>{alt.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 給与構造プログレスバー & シミュレーター */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '1.05rem' }}>
                <Calculator size={20} />
                <span>給与内訳 & 想定年収リアルタイム試算</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                約 {(simulatedAnnual / 10000).toFixed(1)} <span style={{ fontSize: '1rem' }}>万円/年</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: '0.3rem' }}>
              月給構成内訳（計 {(monthlyFixedTotal / 10000).toFixed(1)}万円）:
            </div>
            <div className="salary-breakdown-bar">
              <div 
                className="bar-segment bar-base" 
                style={{ width: `${(baseSalary / monthlyFixedTotal) * 100}%` }}
                title={`基本給: ${baseSalary.toLocaleString()}円`}
              />
              {allowance > 0 && (
                <div 
                  className="bar-segment bar-allowance" 
                  style={{ width: `${(allowance / monthlyFixedTotal) * 100}%` }}
                  title={`手当: ${allowance.toLocaleString()}円`}
                />
              )}
              {fixedOvertimePay > 0 && (
                <div 
                  className="bar-segment bar-overtime" 
                  style={{ width: `${(fixedOvertimePay / monthlyFixedTotal) * 100}%` }}
                  title={`固定残業代: ${fixedOvertimePay.toLocaleString()}円`}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
                基本給: {(baseSalary / 10000).toFixed(1)}万円
              </span>
              {allowance > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                  定額手当: {(allowance / 10000).toFixed(1)}万円
                </span>
              )}
              {fixedOvertimePay > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-amber)' }} />
                  固定残業代: {(fixedOvertimePay / 10000).toFixed(1)}万円
                </span>
              )}
            </div>

            {/* Interactive Controls */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-light)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-sub)', display: 'block', marginBottom: '0.4rem' }}>
                  賞与（年間支給月数）のシミュレート: <strong>{simBonusMonths} ヶ月分</strong>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="6" 
                  step="0.5" 
                  value={simBonusMonths}
                  onChange={(e) => setSimBonusMonths(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
                />
              </div>
            </div>
          </div>

          {/* 3. 詳細項目グリッド */}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
            労働環境・応募条件一覧
          </h3>

          <div className="detail-grid">
            <div className="detail-box">
              <div className="detail-box-label">年間休日数 / 週休制</div>
              <div className="detail-box-value" style={{ color: 'var(--accent-emerald)' }}>
                {job.annualHolidays} 日
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                {job.weeklyDaysOff}
              </div>
            </div>

            <div className="detail-box">
              <div className="detail-box-label">就業時間 / 残業目安</div>
              <div className="detail-box-value">
                {job.workingHours}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                月平均残業: 約 {job.monthlyOvertime} 時間
              </div>
            </div>

            <div className="detail-box">
              <div className="detail-box-label">試用期間</div>
              <div className="detail-box-value">
                {job.probationMonths} ヶ月
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
                {job.probationNotes}
              </div>
            </div>

            <div className="detail-box">
              <div className="detail-box-label">加入保険・制度</div>
              <div className="detail-box-value" style={{ fontSize: '0.9rem' }}>
                {job.insurance}
              </div>
            </div>
          </div>

          {/* 特記事項・備考 */}
          {job.specialNotes && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.75rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
                求人票の特記事項・備考
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                {job.specialNotes}
              </p>
            </div>
          )}

          {/* 4. 応募・面接用 個人メモ */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              応募メモ・気になった点（自分用）
            </label>
            <textarea 
              rows={2}
              placeholder="例: 面接でリモート頻度と賞与支給条件を質問する。"
              value={userMemo}
              onChange={(e) => setUserMemo(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                outline: 'none',
                marginBottom: '0.5rem'
              }}
            />
            <button 
              className="btn-secondary" 
              onClick={handleSaveMemo}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
            >
              メモを保存
            </button>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button 
              className="btn-secondary"
              onClick={handleShareCopy}
              style={{ borderColor: copiedSuccess ? 'var(--accent-emerald)' : 'var(--border-light)' }}
            >
              {copiedSuccess ? <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={16} />}
              {copiedSuccess ? '要約テキストをコピーしました！' : '同期・仲間にLINE/チャットで共有'}
            </button>

            <button className="btn-primary" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>

      {/* ソース確認サブモーダル */}
      {showSourceModal && (
        <SourceViewerModal 
          job={job}
          onClose={() => setShowSourceModal(false)}
        />
      )}
    </>
  );
}
