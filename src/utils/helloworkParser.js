/**
 * ハローワーク求人票テキストの自動パース & 解析ユーティリティ
 */

// 想定年収の計算
export function calculateEstimatedSalary(job) {
  const baseSalaryMonth = Number(job.baseSalary) || 0;
  const allowanceMonth = Number(job.regularAllowance) || 0;
  const fixedOvertimeMonth = Number(job.fixedOvertimePay) || 0;
  const totalMonthly = baseSalaryMonth + allowanceMonth + fixedOvertimeMonth;

  // 賞与月数 (数値にパース)
  const bonusMonths = Number(job.bonusMonths) || 0;

  // 想定年収 = (月給計 * 12) + (基本給 * 賞与月数)
  const annualSalary = (totalMonthly * 12) + (baseSalaryMonth * bonusMonths);
  
  return {
    monthlyTotal: totalMonthly,
    annualTotal: Math.round(annualSalary),
    annualTotalMin: Math.round(annualSalary * 0.95), // 下限目安
    annualTotalMax: Math.round(annualSalary * 1.1)   // 残業やインセンティブを含む上限目安
  };
}

// 自動条件バッジの生成
export function generateBadges(job) {
  const badges = [];

  // 年間休日
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

  // 完全週休2日
  if (job.weeklyDaysOff && (job.weeklyDaysOff.includes('完全') || job.weeklyDaysOff.includes('毎週'))) {
    badges.push({ text: '完全週休二日制', type: 'emerald' });
  } else if (job.weeklyDaysOff && job.weeklyDaysOff.includes('土 日 祝')) {
    badges.push({ text: '土日祝休み', type: 'emerald' });
  }

  // 残業時間
  const overtime = Number(job.monthlyOvertime) || 0;
  if (overtime === 0) {
    badges.push({ text: '残業ほぼゼロ', type: 'purple' });
  } else if (overtime <= 10) {
    badges.push({ text: `残業少なめ (${overtime}h/月)`, type: 'emerald' });
  } else if (overtime >= 30) {
    badges.push({ text: `残業多め (${overtime}h/月)`, type: 'amber' });
  }

  // 賞与
  const bonusMonths = Number(job.bonusMonths) || 0;
  if (bonusMonths >= 3) {
    badges.push({ text: `賞与実績 ${bonusMonths}ヶ月分`, type: 'blue' });
  }

  // 転勤なし
  if (job.transfer === 'なし' || (job.notes && job.notes.includes('転勤なし'))) {
    badges.push({ text: '転勤なし', type: 'cyan' });
  }

  // 学歴・経験不問
  if (job.experienceNeeded === '不問' || job.education === '不問') {
    badges.push({ text: '未経験・学歴不問', type: 'indigo' });
  }

  return badges;
}

// 評価・リスク・注意点アラートの自動抽出
export function extractRiskAlerts(job) {
  const alerts = [];

  // 1. 試用期間の減額
  if (job.probationNotes && (job.probationNotes.includes('減額') || job.probationNotes.includes('時給') || job.probationNotes.includes('異なる'))) {
    alerts.push({
      level: 'warning',
      title: '試用期間中の条件変更あり',
      description: job.probationNotes
    });
  }

  // 2. 固定残業代の含有
  if (job.fixedOvertimePay > 0 || (job.fixedOvertimeHours && job.fixedOvertimeHours > 0)) {
    alerts.push({
      level: 'info',
      title: `固定残業代 (${job.fixedOvertimeHours || '一定'}時間分) が含まれます`,
      description: `月給のうち ${Number(job.fixedOvertimePay).toLocaleString()}円 は固定残業代です。超過分は別途全額支給されます。`
    });
  }

  // 3. 年間休日の少なさ
  const holidays = Number(job.annualHolidays) || 0;
  if (holidays > 0 && holidays < 105) {
    alerts.push({
      level: 'warning',
      title: '年間休日に注意 (105日未満)',
      description: '一般的な週休2日制（年間約120日）に比べて年間休日数が少なめです。変形労働時間制や隔週休の可能性があります。'
    });
  }

  // 4. マイカー通勤駐車場
  if (job.parkingFee && job.parkingFee.includes('自己負担')) {
    alerts.push({
      level: 'info',
      title: '駐車場代自己負担あり',
      description: job.parkingFee
    });
  }

  // 5. 特記事項の留意文言
  if (job.specialNotes) {
    if (job.specialNotes.includes('能力による') || job.specialNotes.includes('業績による')) {
      alerts.push({
        level: 'info',
        title: '昇給・賞与は業績連動の可能性',
        description: '特記事項に業績・能力依存の記載があります。面接時に実績を確認すると安心です。'
      });
    }
  }

  return alerts;
}

// テキストから求人オブジェクトへの変換エンジン
export function parseHelloworkText(text) {
  if (!text || typeof text !== 'string') return null;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // デフォルト値
  const job = {
    id: `custom-${Date.now()}`,
    jobNo: '',
    title: '新規読み込み求人',
    company: '未設定の事業所名',
    employmentType: '正社員',
    location: '勤務地未記載',
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
    insurance: '雇用・労災・健康・厚生・退職金共済',
    education: '不問',
    experienceNeeded: '不問',
    specialNotes: '',
    parsedAt: new Date().toLocaleDateString('ja-JP')
  };

  // 正規表現パターンによる抽出
  for (const line of lines) {
    // 求人番号
    if (line.match(/\d{5}-\d{8}/)) {
      const match = line.match(/(\d{5}-\d{8})/);
      if (match) job.jobNo = match[1];
    }
    // 職種
    if (line.includes('職種') || line.includes('【職種】')) {
      job.title = line.replace(/.*職種[】:]?/, '').trim() || job.title;
    } else if (!job.titleChanged && (line.includes('エンジニア') || line.includes('事務') || line.includes('デザイナー') || line.includes('営業') || line.includes('スタッフ'))) {
      job.title = line.slice(0, 40);
      job.titleChanged = true;
    }

    // 事業所名 / 会社名
    if (line.includes('事業所名') || line.includes('会社名') || line.includes('求人者名')) {
      job.company = line.replace(/.*(事業所名|会社名|求人者名)[】:]?/, '').trim();
    } else if (line.endsWith('株式会社') || line.startsWith('株式会社') || line.endsWith('合同会社')) {
      job.company = line;
    }

    // 基本給
    if (line.includes('基本給') || line.includes('ａ')) {
      const nums = line.match(/\d{1,3}(,\d{3})*|\d+/g);
      if (nums && nums.length > 0) {
        const val = parseInt(nums[0].replace(/,/g, ''), 10);
        if (val > 50000 && val < 2000000) job.baseSalary = val;
      }
    }

    // 定額手当
    if (line.includes('定額的に支払われる手当') || line.includes('ｂ')) {
      const nums = line.match(/\d{1,3}(,\d{3})*|\d+/g);
      if (nums && nums.length > 0) {
        const val = parseInt(nums[0].replace(/,/g, ''), 10);
        if (val >= 0 && val < 500000) job.regularAllowance = val;
      }
    }

    // 年間休日
    if (line.includes('年間休日数') || line.includes('年間休日')) {
      const num = line.match(/\d+/);
      if (num) {
        const val = parseInt(num[0], 10);
        if (val >= 70 && val <= 160) job.annualHolidays = val;
      }
    }

    // 残業
    if (line.includes('時間外労働時間') || line.includes('残業')) {
      const num = line.match(/\d+/);
      if (num) {
        const val = parseInt(num[0], 10);
        if (val >= 0 && val <= 100) job.monthlyOvertime = val;
      }
    }

    // 賞与
    if (line.includes('賞与') && (line.includes('ヶ月') || line.includes('月分'))) {
      const num = line.match(/(\d+(\.\d+)?)\s*(ヶ月|月分)/);
      if (num) {
        job.bonusMonths = parseFloat(num[1]);
      }
    }

    // 特記事項
    if (line.includes('特記事項') || line.includes('備考')) {
      job.specialNotes += line + ' ';
    }
  }

  // 特記事項全体をキャプチャ（求人全体のテキスト保持）
  if (!job.specialNotes) {
    job.specialNotes = text.slice(0, 300);
  }

  return job;
}
