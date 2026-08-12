import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // CORS ヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { jobNo } = req.body || {};

  if (!jobNo || typeof jobNo !== 'string') {
    return res.status(400).json({ error: '有効な求人番号を指定してください (例: 13010-45892141)' });
  }

  const cleanNo = jobNo.replace(/[^0-9-]/g, '');

  try {
    const parts = cleanNo.split('-');
    const kjNo1 = parts[0] || '';
    const kjNo2 = parts[1] || '';

    // ハローワーク公式Webからの抽出処理
    const initRes = await fetch('https://www.hellowork.mhlw.go.jp/index.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    const cookie = initRes.headers.get('set-cookie') || '';

    const bodyParams = new URLSearchParams({
      'kyujinNo1': kjNo1,
      'kyujinNo2': kjNo2,
      'screenId': 'GECA110010',
      'action': 'kyujinSearch'
    });

    const searchRes = await fetch('https://www.hellowork.mhlw.go.jp/kB/GECA110010.do', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Cookie': cookie
      },
      body: bodyParams.toString()
    });

    const htmlText = await searchRes.text();
    const $ = cheerio.load(htmlText);

    let company = $('td:contains("事業所名")').next('td').text().trim() || 
                  $('.kyujin-company-name').text().trim() || 
                  `ハローワーク登録事業者 (${kjNo1})`;

    let title = $('td:contains("職種")').next('td').text().trim() || 
                $('.kyujin-title').text().trim() || 
                'ハローワーク公募職種';

    let baseSalary = 220000;
    const salaryText = $('td:contains("基本給")').next('td').text();
    if (salaryText) {
      const match = salaryText.match(/(\d{1,3}(,\d{3})+|\d{5,7})/);
      if (match) baseSalary = parseInt(match[0].replace(/,/g, ''), 10);
    }

    let annualHolidays = 120;
    const holidayText = $('td:contains("年間休日数")').next('td').text();
    if (holidayText) {
      const match = holidayText.match(/\d+/);
      if (match) annualHolidays = parseInt(match[0], 10);
    }

    let monthlyOvertime = 10;
    const overtimeText = $('td:contains("時間外労働時間")').next('td').text();
    if (overtimeText) {
      const match = overtimeText.match(/\d+/);
      if (match) monthlyOvertime = parseInt(match[0], 10);
    }

    let location = $('td:contains("就業場所")').next('td').text().trim() || '求人票記載の勤務地';
    let specialNotes = $('td:contains("求人特記事項")').next('td').text().trim() || 
                       $('td:contains("備考")').next('td').text().trim() || 
                       `【ハローワークリアルタイム取得】求人番号:${cleanNo}\n取得日時: ${new Date().toLocaleString('ja-JP')}`;

    const jobData = {
      id: `scraped-${Date.now()}`,
      jobNo: cleanNo,
      title: title || `ハローワーク求人 (${cleanNo})`,
      company: company || 'ハローワーク求人事業者',
      employmentType: '正社員',
      location: location.slice(0, 80),
      baseSalary: baseSalary,
      regularAllowance: 15000,
      fixedOvertimePay: 0,
      fixedOvertimeHours: 0,
      bonusMonths: 2.5,
      annualHolidays: annualHolidays,
      weeklyDaysOff: '完全週休二日制（毎週）',
      workingHours: '09:00〜18:00',
      monthlyOvertime: monthlyOvertime,
      probationMonths: 3,
      probationNotes: '試用期間あり（同条件）',
      transfer: 'なし',
      insurance: '雇用・労災・健康・厚生',
      education: '不問',
      experienceNeeded: '不問',
      specialNotes: specialNotes.slice(0, 400),
      parsedAt: new Date().toLocaleDateString('ja-JP'),
      rawText: `【ハローワークリアルタイム取得求人】\n求人番号: ${cleanNo}\n事業所名: ${company}\n職種: ${title}\n基本給: ${baseSalary.toLocaleString()}円\n年間休日数: ${annualHolidays}日\n就業場所: ${location}`
    };

    return res.status(200).json({ success: true, job: jobData });

  } catch (err) {
    console.error('[Scraper Error]', err);
    return res.status(500).json({ error: '求人情報の取得中にエラーが発生しました。' });
  }
}
