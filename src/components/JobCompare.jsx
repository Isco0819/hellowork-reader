import React from 'react';
import { calculateEstimatedSalary, extractRiskAlerts } from '../utils/helloworkParser';
import { Layers, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function JobCompare({ jobs, comparedIds, onRemoveCompare, onSelectJob }) {
  const comparedJobs = jobs.filter(j => comparedIds.includes(j.id));

  if (comparedJobs.length === 0) {
    return (
      <div className="empty-state">
        <Layers size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h3>比較リストに求人が登録されていません</h3>
        <p style={{ marginTop: '0.5rem' }}>
          求人一覧画面で「比較リストに追加」をチェックすると、ここに2〜5件の求人を並べて比較できます。
        </p>
      </div>
    );
  }

  // 最高年収・年間休日・残業最小のハイライト値を計算
  const maxSalary = Math.max(...comparedJobs.map(j => calculateEstimatedSalary(j).annualTotal));
  const maxHolidays = Math.max(...comparedJobs.map(j => Number(j.annualHolidays) || 0));
  const minOvertime = Math.min(...comparedJobs.map(j => Number(j.monthlyOvertime) || 0));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={22} style={{ color: 'var(--accent-blue)' }} />
          求人条件 横並び比較マトリックス ({comparedJobs.length}件)
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
          ※優秀な数値をハイライト表示中
        </span>
      </div>

      <div className="compare-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th>比較項目</th>
              {comparedJobs.map(job => (
                <th key={job.id} style={{ minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>{job.company}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0' }}>{job.title}</div>
                    </div>
                    <button 
                      onClick={() => onRemoveCompare(job.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      title="比較から外す"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 1. 想定年収 */}
            <tr>
              <th>推定想定年収</th>
              {comparedJobs.map(job => {
                const sal = calculateEstimatedSalary(job);
                const isMax = sal.annualTotal === maxSalary && comparedJobs.length > 1;
                return (
                  <td key={job.id} style={{ background: isMax ? 'rgba(16, 185, 129, 0.12)' : 'transparent' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isMax ? 'var(--accent-emerald)' : '#fff' }}>
                      約 {(sal.annualTotal / 10000).toFixed(1)} 万円
                      {isMax && <span style={{ fontSize: '0.72rem', background: 'var(--accent-emerald)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem' }}>最高値</span>}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 2. 月給内訳 */}
            <tr>
              <th>月給内訳 (基本給+手当)</th>
              {comparedJobs.map(job => (
                <td key={job.id}>
                  <div>基本給: {(job.baseSalary / 10000).toFixed(1)}万円</div>
                  {job.regularAllowance > 0 && <div>手当: {(job.regularAllowance / 10000).toFixed(1)}万円</div>}
                  {job.fixedOvertimePay > 0 && <div style={{ color: 'var(--accent-amber)', fontSize: '0.8rem' }}>固定残業代: {(job.fixedOvertimePay / 10000).toFixed(1)}万円 ({job.fixedOvertimeHours}h分)</div>}
                </td>
              ))}
            </tr>

            {/* 3. 賞与実績 */}
            <tr>
              <th>賞与 (支給実績)</th>
              {comparedJobs.map(job => (
                <td key={job.id}>
                  <strong style={{ color: 'var(--accent-blue)' }}>{job.bonusMonths} ヶ月分</strong> / 年
                </td>
              ))}
            </tr>

            {/* 4. 年間休日数 */}
            <tr>
              <th>年間休日数</th>
              {comparedJobs.map(job => {
                const holidays = Number(job.annualHolidays) || 0;
                const isMax = holidays === maxHolidays && comparedJobs.length > 1;
                return (
                  <td key={job.id} style={{ background: isMax ? 'rgba(16, 185, 129, 0.12)' : 'transparent' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: isMax ? 'var(--accent-emerald)' : '#fff' }}>
                      {holidays} 日
                      {isMax && <span style={{ fontSize: '0.72rem', background: 'var(--accent-emerald)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem' }}>最長</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{job.weeklyDaysOff}</div>
                  </td>
                );
              })}
            </tr>

            {/* 5. 月平均残業 */}
            <tr>
              <th>月平均残業時間</th>
              {comparedJobs.map(job => {
                const overtime = Number(job.monthlyOvertime) || 0;
                const isMin = overtime === minOvertime && comparedJobs.length > 1;
                return (
                  <td key={job.id} style={{ background: isMin ? 'rgba(139, 92, 246, 0.12)' : 'transparent' }}>
                    <div style={{ fontWeight: 700, color: isMin ? 'var(--accent-purple)' : '#fff' }}>
                      約 {overtime} 時間
                      {isMin && <span style={{ fontSize: '0.72rem', background: 'var(--accent-purple)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem' }}>最小</span>}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 6. 注意点アラート */}
            <tr>
              <th>注意点・懸念ポイント</th>
              {comparedJobs.map(job => {
                const alerts = extractRiskAlerts(job);
                return (
                  <td key={job.id}>
                    {alerts.length > 0 ? (
                      alerts.map((a, i) => (
                        <div key={i} style={{ color: '#fde68a', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'flex', gap: '0.3rem' }}>
                          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{a.title}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: 'var(--accent-emerald)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={14} /> 特記事項なし
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 7. アクション */}
            <tr>
              <th>詳細</th>
              {comparedJobs.map(job => (
                <td key={job.id}>
                  <button className="btn-primary" onClick={() => onSelectJob(job)} style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}>
                    詳細を見る
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
