import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import JobList from './components/JobList';
import JobImporter from './components/JobImporter';
import JobDetailModal from './components/JobDetailModal';
import JobCompare from './components/JobCompare';
import AnalyticsView from './components/AnalyticsView';
import { SAMPLE_JOBS } from './data/sampleJobs';

const STORAGE_KEY_JOBS = 'hellowork_reader_jobs_v1';
const STORAGE_KEY_FAVS = 'hellowork_reader_favs_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [jobs, setJobs] = useState([]);
  const [comparedIds, setComparedIds] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem(STORAGE_KEY_JOBS);
      if (savedJobs) {
        setJobs(JSON.parse(savedJobs));
      } else {
        setJobs(SAMPLE_JOBS);
        localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(SAMPLE_JOBS));
      }

      const savedFavs = localStorage.getItem(STORAGE_KEY_FAVS);
      if (savedFavs) {
        setFavoriteIds(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error('Failed to load from LocalStorage', e);
      setJobs(SAMPLE_JOBS);
    }
  }, []);

  const updateJobsState = (newJobs) => {
    setJobs(newJobs);
    try {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(newJobs));
    } catch (e) {
      console.error('Failed to save to LocalStorage', e);
    }
  };

  const handleAddJob = (newJob) => {
    const updated = [newJob, ...jobs];
    updateJobsState(updated);
  };

  const handleDeleteJob = (id) => {
    const updated = jobs.filter(j => j.id !== id);
    updateJobsState(updated);
    setComparedIds(comparedIds.filter(cid => cid !== id));
    setFavoriteIds(favoriteIds.filter(fid => fid !== id));
  };

  const handleResetSamples = () => {
    if (window.confirm('初期サンプル求人を再読み込みしますか？')) {
      updateJobsState(SAMPLE_JOBS);
      setComparedIds([]);
    }
  };

  const handleToggleCompare = (id) => {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter(cid => cid !== id));
    } else {
      if (comparedIds.length >= 5) {
        alert('一度に比較できる求人は最大5件までです。');
        return;
      }
      setComparedIds([...comparedIds, id]);
    }
  };

  const handleToggleFavorite = (id) => {
    let updated;
    if (favoriteIds.includes(id)) {
      updated = favoriteIds.filter(fid => fid !== id);
    } else {
      updated = [...favoriteIds, id];
    }
    setFavoriteIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleUpdateMemo = (id, memoText) => {
    const updated = jobs.map(j => {
      if (j.id === id) {
        return { ...j, userMemo: memoText };
      }
      return j;
    });
    updateJobsState(updated);
    if (selectedJob && selectedJob.id === id) {
      setSelectedJob({ ...selectedJob, userMemo: memoText });
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hellowork_jobs_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compareCount={comparedIds.length}
        jobCount={jobs.length}
        onResetSamples={handleResetSamples}
      />

      <main>
        {activeTab === 'list' && (
          <JobList 
            jobs={jobs}
            onSelectJob={(j) => setSelectedJob(j)}
            comparedIds={comparedIds}
            onToggleCompare={handleToggleCompare}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onDeleteJob={handleDeleteJob}
            onAddJob={handleAddJob}
          />
        )}

        {activeTab === 'compare' && (
          <JobCompare 
            jobs={jobs}
            comparedIds={comparedIds}
            onRemoveCompare={handleToggleCompare}
            onSelectJob={(j) => setSelectedJob(j)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView 
            jobs={jobs}
            onExportData={handleExportData}
          />
        )}

        {activeTab === 'import' && (
          <JobImporter 
            onAddJob={handleAddJob}
            onImportDone={() => setActiveTab('list')}
          />
        )}
      </main>

      {selectedJob && (
        <JobDetailModal 
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdateMemo={handleUpdateMemo}
        />
      )}
    </div>
  );
}
