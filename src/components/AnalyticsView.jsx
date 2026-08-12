import React from 'react';
import { calculateEstimatedSalary } from '../utils/helloworkParser';
import { BarChart2, TrendingUp, Calendar, Clock, Download, Upload, Share2, CheckCircle2 } from 'lucide-react';

export default function AnalyticsView({ jobs, onExportData, onImportData }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="empty-state">
        <BarChart2 size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h3>分析対象の求人データがありません</h3>
        <p style={{ marginTop: '0.5rem' }}>求人を追加またはサンプル求人を読み込むと、全体の給与相場や休日傾向を分析できます。</p>
      </div>
    );
  }

  // 統計計算
  const salaries = jobs.map(j => calculateEstimatedSalary(j).annualTotal);
  const avgSalary = Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length);
  const maxSalary = Math.max(...salaries);
  const minSalary = Math.min(...salaries);

  const holidays = jobs.map(j => Number(j.annualHolidays) || 0);
  const avgHolidays = Math.round(holidays.reduce((a, b) => a + b, 0) / holidays.length);

  const overtimes = jobs.map(j => Number(j.monthlyOvertime) || 0);
  const avgOvertime = (overtimes.reduce((a, b) => a + b, 0) / overtimes.length).toFixed(1);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={22} style={{ color: 'var(--accent-emerald)' }} />
          保存中求人 ({jobs.length}件) の傾向・相場分析ダッシュボード
        </h2>
      </div>

      {/* KPI Cards Grid */}
      <div className="detail-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
        <div className="detail-box" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div className="detail-box-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--accent-emerald)' }} />
            平均想定年収
          </div>
          <div className="detail-box-value" style={{ color: 'var(--accent-emerald)', fontSize: '1.6rem' }}>
            約 {(avgSalary / 10000).toFixed(1)} <span style={{ fontSize: '1rem' }}>万円</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
            最高: {(maxSalary/10000).toFixed(1)}万 / 最低: {(minSalary/10000).toFixed(1)}万
          </div>
        </div>

        <div className="detail-box" style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}>
          <div className="detail-box-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} style={{ color: 'var(--accent-blue)' }} />
            平均年間休日数
          </div>
          <div className="detail-box-value" style={{ color: 'var(--accent-blue)', fontSize: '1.6rem' }}>
            {avgHolidays} <span style={{ fontSize: '1rem' }}>日</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
            年間休日120日以上の割合: {Math.round((holidays.filter(h => h >= 120).length / jobs.length) * 100)}%
          </div>
        </div>

        <div className="detail-box" style={{ borderColor: 'rgba(139, 92, 246, 0.4)' }}>
          <div className="detail-box-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} style={{ color: 'var(--accent-purple)' }} />
            平均残業時間
          </div>
          <div className="detail-box-value" style={{ color: 'var(--accent-purple)', fontSize: '1.6rem' }}>
            {avgOvertime} <span style={{ fontSize: '1rem' }}>時間/月</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
            残業10時間以下の求人: {overtimes.filter(o => o <= 10).length}件
          </div>
        </div>
      </div>

      {/* Visual Chart / Distribution List */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
          各求人の年収・年間休日・残業比較マップ
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map(job => {
            const sal = calculateEstimatedSalary(job);
            const holidayPct = Math.min(100, Math.max(10, ((job.annualHolidays - 90) / 40) * 100));
            const salaryPct = Math.min(100, Math.max(10, (sal.annualTotal / 6000000) * 100));

            return (
              <div key={job.id} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{job.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginLeft: '0.5rem' }}>{job.company}</span>
                  </div>
                  <strong style={{ color: 'var(--accent-emerald)' }}>約 {(sal.annualTotal / 10000).toFixed(1)}万円/年</strong>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.2rem' }}>
                      年間休日: {job.annualHolidays}日
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${holidayPct}%`, background: 'var(--accent-blue)' }} />
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '0.2rem' }}>
                      残業: 約{job.monthlyOvertime}時間
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (job.monthlyOvertime / 40) * 100)}%`, background: 'var(--accent-amber)' }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synchronize & Export Section for classmates */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={18} style={{ color: 'var(--accent-blue)' }} />
            同期・訓練生仲間との求人データ共有・エクスポート
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
            あなたが保存・整理した求人リストをJSONファイルとして出力し、同期のパソコンにそのまま引き継げます。
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={onExportData}>
            <Download size={16} />
            JSON出力
          </button>
        </div>
      </div>
    </div>
  );
}
