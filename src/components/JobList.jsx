import React, { useState, useMemo } from 'react';
import JobCard from './JobCard';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { calculateEstimatedSalary } from '../utils/helloworkParser';

export default function JobList({ 
  jobs, 
  onSelectJob, 
  comparedIds, 
  onToggleCompare, 
  favoriteIds, 
  onToggleFavorite,
  onDeleteJob 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('annualSalaryDesc');
  const [filterHoliday, setFilterHoliday] = useState('all');
  const [filterOvertime, setFilterOvertime] = useState('all');
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false);

  // フィルタ＆ソート処理
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 検索キーワードマッチ
      const text = `${job.title} ${job.company} ${job.location} ${job.specialNotes || ''}`.toLowerCase();
      if (searchTerm && !text.includes(searchTerm.toLowerCase())) {
        return false;
      }
      // お気に入り限定
      if (showFavoriteOnly && !favoriteIds.includes(job.id)) {
        return false;
      }
      // 年間休日フィルター
      if (filterHoliday === '120plus' && (Number(job.annualHolidays) || 0) < 120) {
        return false;
      }
      if (filterHoliday === '125plus' && (Number(job.annualHolidays) || 0) < 125) {
        return false;
      }
      // 残業時間フィルター
      if (filterOvertime === '10less' && (Number(job.monthlyOvertime) || 0) > 10) {
        return false;
      }
      if (filterOvertime === 'noOvertimePay' && job.fixedOvertimePay > 0) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'annualSalaryDesc') {
        return calculateEstimatedSalary(b).annualTotal - calculateEstimatedSalary(a).annualTotal;
      }
      if (sortBy === 'annualSalaryAsc') {
        return calculateEstimatedSalary(a).annualTotal - calculateEstimatedSalary(b).annualTotal;
      }
      if (sortBy === 'holidaysDesc') {
        return (Number(b.annualHolidays) || 0) - (Number(a.annualHolidays) || 0);
      }
      if (sortBy === 'overtimeAsc') {
        return (Number(a.monthlyOvertime) || 0) - (Number(b.monthlyOvertime) || 0);
      }
      return 0;
    });
  }, [jobs, searchTerm, sortBy, filterHoliday, filterOvertime, showFavoriteOnly, favoriteIds]);

  return (
    <div>
      {/* Search & Control Bar */}
      <div className="control-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="職種、会社名、エリア、スキルなどで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* ソート設定 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={15} style={{ color: 'var(--accent-blue)' }} />
            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="annualSalaryDesc">想定年収が高い順</option>
              <option value="annualSalaryAsc">想定年収が低い順</option>
              <option value="holidaysDesc">年間休日が多い順</option>
              <option value="overtimeAsc">残業が少ない順</option>
            </select>
          </div>

          {/* 年間休日フィルター */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} style={{ color: 'var(--accent-emerald)' }} />
            <select 
              className="filter-select"
              value={filterHoliday}
              onChange={(e) => setFilterHoliday(e.target.value)}
            >
              <option value="all">年間休日：すべて</option>
              <option value="120plus">120日以上 (土日祝休み目安)</option>
              <option value="125plus">125日以上 (特別休暇多め)</option>
            </select>
          </div>

          {/* 残業・固定残業代フィルター */}
          <select 
            className="filter-select"
            value={filterOvertime}
            onChange={(e) => setFilterOvertime(e.target.value)}
          >
            <option value="all">残業条件：すべて</option>
            <option value="10less">残業月10時間以下</option>
            <option value="noOvertimePay">固定残業代を含まない</option>
          </select>

          {/* お気に入りフィルター */}
          <button 
            className={`btn-secondary ${showFavoriteOnly ? 'active' : ''}`}
            onClick={() => setShowFavoriteOnly(!showFavoriteOnly)}
            style={{
              borderColor: showFavoriteOnly ? 'var(--accent-amber)' : 'var(--border-light)',
              color: showFavoriteOnly ? 'var(--accent-amber)' : 'inherit'
            }}
          >
            ★ ★のみ ({favoriteIds.length})
          </button>
        </div>
      </div>

      {/* Grid view */}
      {filteredJobs.length > 0 ? (
        <div className="job-grid">
          {filteredJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job}
              onSelect={onSelectJob}
              onToggleCompare={onToggleCompare}
              isCompared={comparedIds.includes(job.id)}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favoriteIds.includes(job.id)}
              onDelete={onDeleteJob}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>該当する求人が見つかりませんでした</h3>
          <p style={{ marginTop: '0.5rem' }}>検索条件を変更するか、新規求人を読み込んでみてください。</p>
        </div>
      )}
    </div>
  );
}
