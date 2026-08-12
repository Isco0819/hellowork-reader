import React, { useState, useMemo, useEffect } from 'react';
import JobCard from './JobCard';
import { Search, ArrowUpDown, MapPin, Briefcase, DollarSign, RotateCcw, Globe, Loader2, Sparkles } from 'lucide-react';
import { calculateEstimatedSalary, extractPrefecture, extractCategory } from '../utils/helloworkParser';

export default function JobList({ 
  jobs, 
  onSelectJob, 
  comparedIds, 
  onToggleCompare, 
  favoriteIds, 
  onToggleFavorite,
  onDeleteJob,
  onAddJob
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEmployment, setSelectedEmployment] = useState('all');
  const [minSalaryFilter, setMinSalaryFilter] = useState('0');
  const [sortBy, setSortBy] = useState('annualSalaryDesc');
  const [filterHoliday, setFilterHoliday] = useState('all');
  const [filterOvertime, setFilterOvertime] = useState('all');
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false);
  const [isLiveScraping, setIsLiveScraping] = useState(false);

  // 検索ワードまたは都道府県入力時に「毎度ハローワークから自動スクレイピング」
  useEffect(() => {
    if (!searchTerm.trim() && selectedPrefecture === 'all') return;

    const timer = setTimeout(async () => {
      setIsLiveScraping(true);
      try {
        const query = `${selectedPrefecture !== 'all' ? selectedPrefecture + ' ' : ''}${searchTerm}`.trim();
        const response = await fetch('/api/scrape-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: query, prefecture: selectedPrefecture })
        });
        const data = await response.json();
        if (data.success && data.jobs && data.jobs.length > 0) {
          data.jobs.forEach(newJob => {
            if (onAddJob) onAddJob(newJob);
          });
        }
      } catch (err) {
        console.error('Auto live scraping error:', err);
      } finally {
        setIsLiveScraping(false);
      }
    }, 600); // 0.6秒デバウンス

    return () => clearTimeout(timer);
  }, [searchTerm, selectedPrefecture]);

  // フィルターリセット
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedPrefecture('all');
    setSelectedCategory('all');
    setSelectedEmployment('all');
    setMinSalaryFilter('0');
    setSortBy('annualSalaryDesc');
    setFilterHoliday('all');
    setFilterOvertime('all');
    setShowFavoriteOnly(false);
  };

  // 都道府県リストの動的生成
  const prefectureList = useMemo(() => {
    const prefs = new Set(jobs.map(j => j.prefecture || extractPrefecture(j.location)));
    return Array.from(prefs).filter(Boolean);
  }, [jobs]);

  // フィルタ＆ソート処理
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 1. テキスト検索 (タイトル・会社名・場所・都道府県・特記事項)
      const text = `${job.title} ${job.company} ${job.location} ${job.prefecture || ''} ${job.specialNotes || ''}`.toLowerCase();
      if (searchTerm && !text.includes(searchTerm.toLowerCase())) {
        return false;
      }

      // 2. お気に入り絞り込み
      if (showFavoriteOnly && !favoriteIds.includes(job.id)) {
        return false;
      }

      // 3. 都道府県・エリア絞り込み
      const pref = job.prefecture || extractPrefecture(job.location);
      if (selectedPrefecture !== 'all' && pref !== selectedPrefecture) {
        return false;
      }

      // 4. 職種カテゴリー絞り込み
      const cat = job.category || extractCategory(job.title);
      if (selectedCategory !== 'all' && cat !== selectedCategory) {
        return false;
      }

      // 5. 雇用形態絞り込み
      if (selectedEmployment === 'regular' && job.employmentType !== '正社員') {
        return false;
      }
      if (selectedEmployment === 'nonRegular' && job.employmentType === '正社員') {
        return false;
      }

      // 6. 最低想定年収絞り込み (万円)
      const annualSalaryMan = calculateEstimatedSalary(job).annualTotal / 10000;
      const minSalaryNeeded = Number(minSalaryFilter);
      if (minSalaryNeeded > 0 && annualSalaryMan < minSalaryNeeded) {
        return false;
      }

      // 7. 年間休日フィルター
      const holidays = Number(job.annualHolidays) || 0;
      if (filterHoliday === '120plus' && holidays < 120) {
        return false;
      }
      if (filterHoliday === '125plus' && holidays < 125) {
        return false;
      }

      // 8. 残業フィルター
      const overtime = Number(job.monthlyOvertime) || 0;
      if (filterOvertime === '10less' && overtime > 10) {
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
  }, [
    jobs, searchTerm, selectedPrefecture, selectedCategory, selectedEmployment,
    minSalaryFilter, sortBy, filterHoliday, filterOvertime, showFavoriteOnly, favoriteIds
  ]);

  return (
    <div>
      {/* 毎度自動スクレイピング状態インジケーター */}
      {isLiveScraping && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid var(--accent-blue)',
          color: '#60a5fa',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Loader2 size={16} className="animate-spin" />
          <span>⚡️ ハローワーク公式Webから最新求人を自動スクレイピング中...</span>
        </div>
      )}

      {/* Expanded Control & Filter Bar */}
      <div className="control-bar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
        
        {/* 1段目: キーワード検索 & 並び替え */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="フリーワード検索 (例: 鹿児島 データセンター、神田、リモート)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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

          <button 
            className={`btn-secondary ${showFavoriteOnly ? 'active' : ''}`}
            onClick={() => setShowFavoriteOnly(!showFavoriteOnly)}
            style={{
              borderColor: showFavoriteOnly ? 'var(--accent-amber)' : 'var(--border-light)',
              color: showFavoriteOnly ? 'var(--accent-amber)' : 'inherit'
            }}
          >
            ★ お気に入り ({favoriteIds.length})
          </button>
        </div>

        {/* 2段目: 地域・都道府県、職種、雇用形態、年収条件絞り込み */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-light)' }}>
          
          {/* 都道府県・エリア */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} style={{ color: 'var(--accent-cyan)' }} />
            <select 
              className="filter-select"
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
            >
              <option value="all">都道府県：すべて</option>
              {prefectureList.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
              <option value="鹿児島県">鹿児島県</option>
              <option value="東京都">東京都</option>
              <option value="神奈川県">神奈川県</option>
              <option value="埼玉県">埼玉県</option>
              <option value="大阪府">大阪府</option>
              <option value="福岡県">福岡県</option>
            </select>
          </div>

          {/* 職種カテゴリー */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Briefcase size={15} style={{ color: 'var(--accent-emerald)' }} />
            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">職種：すべて</option>
              <option value="IT・Web・エンジニア">IT・Web・エンジニア</option>
              <option value="事務・管理・経理">事務・管理・経理</option>
              <option value="営業・企画・販売">営業・企画・販売</option>
              <option value="医療・福祉・介護">医療・福祉・介護</option>
              <option value="製造・技術・作業">製造・技術・作業</option>
            </select>
          </div>

          {/* 最低想定年収 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <DollarSign size={15} style={{ color: 'var(--accent-amber)' }} />
            <select 
              className="filter-select"
              value={minSalaryFilter}
              onChange={(e) => setMinSalaryFilter(e.target.value)}
            >
              <option value="0">想定年収：指定なし</option>
              <option value="300">年収 300万円以上</option>
              <option value="350">年収 350万円以上</option>
              <option value="400">年収 400万円以上</option>
              <option value="450">年収 450万円以上</option>
            </select>
          </div>

          {/* 年間休日 */}
          <select 
            className="filter-select"
            value={filterHoliday}
            onChange={(e) => setFilterHoliday(e.target.value)}
          >
            <option value="all">年間休日：すべて</option>
            <option value="120plus">年間休日 120日以上 (土日祝目安)</option>
            <option value="125plus">年間休日 125日以上 (特別休暇多)</option>
          </select>

          {/* 雇用形態 */}
          <select 
            className="filter-select"
            value={selectedEmployment}
            onChange={(e) => setSelectedEmployment(e.target.value)}
          >
            <option value="all">雇用形態：すべて</option>
            <option value="regular">正社員のみ</option>
            <option value="nonRegular">契約社員・パート他</option>
          </select>

          {/* リセットボタン */}
          <button 
            className="btn-secondary"
            onClick={handleResetFilters}
            style={{ fontSize: '0.82rem', padding: '0.55rem 0.8rem', marginLeft: 'auto' }}
            title="条件をクリア"
          >
            <RotateCcw size={14} />
            条件クリア
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
          <h3>条件に該当する求人が見つかりませんでした</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            「条件クリア」を押すか、ハローワークから求人を自動取得中ですので少々お待ちください。
          </p>
        </div>
      )}
    </div>
  );
}
