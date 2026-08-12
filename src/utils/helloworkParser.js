/**
 * ハローワーク求人票テキストの自動パース & 解析ユーティリティ
 */

// 勤務地から都道府県を判定抽出
export function extractPrefecture(locationStr) {
  if (!locationStr) return 'その他・不明';
  const prefs = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  for (const pref of prefs) {
    if (locationStr.includes(pref) || locationStr.includes(pref.replace(/[都府県]/, ''))) {
      return pref;
    }
  }
  return 'その他・エリア外';
}

// 職種タイトルからカテゴリーを判定抽出
export function extractCategory(titleStr) {
  if (!titleStr) return 'その他';
  const t = titleStr.toLowerCase();
  if (t.includes('エンジニア') || t.includes('開発') || t.includes('web') || t.includes('デザイナー') || t.includes('プログラマ') || t.includes('it') || t.includes('システム')) {
    return 'IT・Web・エンジニア';
  }
  if (t.includes('事務') || t.includes('総務') || t.includes('経理') || t.includes('受付') || t.includes('アシスタント') || t.includes('PC')) {
    return '事務・管理・経理';
  }
  if (t.includes('営業') || t.includes('販売') || t.includes('セールス') || t.includes('企画') || t.includes('マーケティング')) {
    return '営業・企画・販売';
  }
  if (t.includes('医療') || t.includes('クリニック') || t.includes('看護') || t.includes('介護') || t.includes('福祉') || t.includes('薬')) {
    return '医療・福祉・介護';
  }
  if (t.includes('製造') || t.includes('技術') || t.includes('作業') || t.includes('ドライバー') || t.includes('軽作業') || t.includes('工場') || t.includes('機械')) {
    return '製造・技術・作業';
  }
  return 'その他';
}

// 想定年収の計算
export function calculateEstimatedSalary(job) {
  const baseSalaryMonth = Number(job.baseSalary) || 0;
  const allowanceMonth = Number(job.regularAllowance) || 0;
  const fixedOvertimeMonth = Number(job.fixedOvertimePay) || 0;
  const totalMonthly = baseSalaryMonth + allowanceMonth + fixedOvertimeMonth;
  const bonusMonths = Number(job.bonusMonths) || 0;

  const annualSalary = (totalMonthly * 12) + (baseSalaryMonth * bonusMonths);
  
  return {
    monthlyTotal: totalMonthly,
    annualTotal: Math.round(annualSalary),
    annualTotalMin: Math.round(annualSalary * 0.95),
    annualTotalMax: Math.round(annualSalary * 1.1)
  };
}

// 自動条件バッジの生成
export function generateBadges(job) {
  const badges = [];
  const holidays = Number(job.annualHolidays) || 0;

  if (holidays >= 125) {
    badges.push({ text: `年間休日 ${holidays}日 (極めて多い)`, type: 'emerald' });
  } else if (holidays >= 120) {
    badges.push({ text: `年間休日 ${holidays}日`, type: 'emerald' });
  } else if (holidays >= 110) {
    badges.push({ text: `年間休日 ${holidays}日`, type: 'blue' });
  } else if (holidays > 0 && holidays < 105) {
    badges.push({ text: `年間休日 ${holidays}日 (少なめ)`, type: 'amber' });
  }

  if (job.weeklyDaysOff && (job.weeklyDaysOff.includes('完全') || job.weeklyDaysOff.includes('毎週'))) {
    badges.push({ text: '完全週休二日制', type: 'emerald' });
  } else if (job.weeklyDaysOff && job.weeklyDaysOff.includes('土 日 祝')) {
    badges.push({ text: '土日祝休み', type: 'emerald' });
  }

  const overtime = Number(job.monthlyOvertime) || 0;
  if (overtime === 0) {
    badges.push({ text: '残業ほぼゼロ', type: 'purple' });
  } else if (overtime <= 10) {
    badges.push({ text: `残業少なめ (${overtime}h/月)`, type: 'emerald' });
  } else if (overtime >= 30) {
    badges.push({ text: `残業多め (${overtime}h/月)`, type: 'amber' });
  }

  const bonusMonths = Number(job.bonusMonths) || 0;
  if (bonusMonths >= 3) {
    badges.push({ text: `賞与実績 ${bonusMonths}ヶ月分`, type: 'blue' });
  }

  if (job.transfer === 'なし' || (job.notes && job.notes.includes('転勤なし'))) {
    badges.push({ text: '転勤なし', type: 'cyan' });
  }

  if (job.experienceNeeded === '不問' || job.education === '不問') {
    badges.push({ text: '未経験・学歴不問', type: 'indigo' });
  }

  return badges;
}

// リスク・注意点アラートの自動抽出
export function extractRiskAlerts(job) {
  const alerts = [];

  if (job.probationNotes && (job.probationNotes.includes('減額') || job.probationNotes.includes('時給') || job.probationNotes.includes('異なる'))) {
    alerts.push({
      level: 'warning',
      title: '試用期間中の条件変更あり',
      description: job.probationNotes
    });
  }

  if (job.fixedOvertimePay > 0 || (job.fixedOvertimeHours && job.fixedOvertimeHours > 0)) {
    alerts.push({
      level: 'info',
      title: `固定残業代 (${job.fixedOvertimeHours || '一定'}時間分) が含まれます`,
      description: `月給のうち ${Number(job.fixedOvertimePay).toLocaleString()}円 は固定残業代です。`
    });
  }

  const holidays = Number(job.annualHolidays) || 0;
  if (holidays > 0 && holidays < 105) {
    alerts.push({
      level: 'warning',
      title: '年間休日に注意 (105日未満)',
      description: '一般的な週休2日制（年間約120日）に比べて年間休日数が少なめです。'
    });
  }

  if (job.parkingFee && job.parkingFee.includes('自己負担')) {
    alerts.push({
      level: 'info',
      title: '駐車場代自己負担あり',
      description: job.parkingFee
    });
  }

  return alerts;
}

// テキストから求人オブジェクトへの変換エンジン
export function parseHelloworkText(text) {
  if (!text || typeof text !== 'string') return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  const job = {
    id: `custom-${Date.now()}`,
    jobNo: '',
    title: '新規読み込み求人',
    company: '未設定の事業所名',
    employmentType: '正社員',
    location: '東京都千代田区',
    prefecture: '東京都',
    category: 'IT・Web・エンジニア',
    baseSalary: 220000,
    regularAllowance: 10000,
    fixedOvertimePay: 0,
    fixedOvertimeHours: 0,
    bonusMonths: 2.0,
    annualHolidays: 120,
    weeklyDaysOff: '完全週休二日制（毎週）',
    workingHours: '09:00〜18:00',
    monthlyOvertime: 10,
    probationMonths: 3,
    probationNotes: '同条件',
    transfer: 'なし',
    insurance: '雇用・労災・健康・厚生',
    education: '不問',
    experienceNeeded: '不問',
    specialNotes: '',
    parsedAt: new Date().toLocaleDateString('ja-JP')
  };

  for (const line of lines) {
    if (line.match(/\d{5}-\d{8}/)) {
      const match = line.match(/(\d{5}-\d{8})/);
      if (match) job.jobNo = match[1];
    }
    if (line.includes('職種') || line.includes('【職種】')) {
      job.title = line.replace(/.*職種[】:]?/, '').trim() || job.title;
    }
    if (line.includes('事業所名') || line.includes('会社名')) {
      job.company = line.replace(/.*(事業所名|会社名)[】:]?/, '').trim();
    }
    if (line.includes('基本給')) {
      const nums = line.match(/\d{1,3}(,\d{3})*|\d+/g);
      if (nums && nums.length > 0) {
        const val = parseInt(nums[0].replace(/,/g, ''), 10);
        if (val > 50000 && val < 2000000) job.baseSalary = val;
      }
    }
    if (line.includes('年間休日')) {
      const num = line.match(/\d+/);
      if (num) job.annualHolidays = parseInt(num[0], 10);
    }
    if (line.includes('就業場所') || line.includes('勤務地')) {
      job.location = line.replace(/.*(就業場所|勤務地)[】:]?/, '').trim();
    }
  }

  job.prefecture = extractPrefecture(job.location);
  job.category = extractCategory(job.title);

  return job;
}
