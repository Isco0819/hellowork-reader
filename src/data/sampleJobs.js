/**
 * リアルなハローワーク求人を再現したサンプルデータ
 * 訓練生・求職者が一目で比較検証・分析できるように作成
 */

export const SAMPLE_JOBS = [
  {
    id: 'sample-1',
    jobNo: '13010-45892141',
    title: 'Webアプリケーション開発エンジニア (React / Node.js)',
    company: 'ネクストイノベーション株式会社',
    employmentType: '正社員',
    location: '東京都千代田区（神田駅 徒歩4分）',
    baseSalary: 260000,
    regularAllowance: 30000, // 職務手当
    fixedOvertimePay: 45000, // 固定残業代 (20時間分)
    fixedOvertimeHours: 20,
    bonusMonths: 3.5,
    annualHolidays: 125,
    weeklyDaysOff: '完全週休二日制（土・日・祝日）',
    workingHours: '09:00〜18:00 (休憩60分)',
    monthlyOvertime: 12,
    probationMonths: 3,
    probationNotes: '試用期間中の労働条件：変更なし（同条件）',
    transfer: 'なし',
    insurance: '雇用保険，労災保険，健康保険，厚生年金，退職金制度あり',
    education: '不問',
    experienceNeeded: 'Web開発の実務経験または職業訓練校修了者',
    specialNotes: '★リモートワーク推奨（週2〜3日）。年1回のスキルアップ昇給制度あり。退職金共済加入。受動喫煙対策：屋内完全禁煙。',
    parkingFee: '',
    parsedAt: '2026/08/11',
    rawText: `求人番号: 13010-45892141
事業所名: ネクストイノベーション株式会社
職種: Webアプリケーション開発エンジニア
基本給: 260,000円
定額手当: 30,000円
固定残業代: 45,000円 (20時間分)
年間休日数: 125日
賞与: 前年度実績 年2回・計3.5ヶ月分`
  },
  {
    id: 'sample-2',
    jobNo: '14020-78120351',
    title: '社内Webデザイナー・ECサイト運営担当',
    company: '株式会社サンライズ・マーケティング',
    employmentType: '正社員',
    location: '神奈川県横浜市西区（横浜駅 徒歩8分）',
    baseSalary: 220000,
    regularAllowance: 15000, // 住宅手当
    fixedOvertimePay: 0,
    fixedOvertimeHours: 0,
    bonusMonths: 2.0,
    annualHolidays: 118,
    weeklyDaysOff: '完全週休二日制（毎週）',
    workingHours: '09:30〜18:30 (休憩60分)',
    monthlyOvertime: 8,
    probationMonths: 3,
    probationNotes: '試用期間中（3ヶ月）は基本給200,000円（手当なし）となります',
    transfer: 'なし',
    insurance: '雇用保険，労災保険，健康保険，厚生年金',
    education: '専門学校・職業訓練卒以上',
    experienceNeeded: 'HTML/CSS/Illustratorの基本操作',
    specialNotes: '自社ECサイトのデザイン更新・SNS画像作成。残業月10時間以下でワークライフバランス重視。マイカー通勤不可。受動喫煙対策あり。',
    parkingFee: '',
    parsedAt: '2026/08/11',
    rawText: `求人番号: 14020-78120351
事業所名: 株式会社サンライズ・マーケティング
職種: 社内Webデザイナー
基本給: 220,000円
年間休日数: 118日
賞与: 計2.0ヶ月分
備考: 試用期間中は基本給20万円`
  },
  {
    id: 'sample-3',
    jobNo: '27030-10928371',
    title: '総務・経理事務スタッフ（未経験歓迎）',
    company: '大和精密工業 株式会社',
    employmentType: '正社員',
    location: '大阪府大阪市中央区（本町駅 徒歩3分）',
    baseSalary: 205000,
    regularAllowance: 10000,
    fixedOvertimePay: 0,
    fixedOvertimeHours: 0,
    bonusMonths: 4.0,
    annualHolidays: 122,
    weeklyDaysOff: '完全週休二日制（土日祝）',
    workingHours: '08:45〜17:45 (休憩60分)',
    monthlyOvertime: 5,
    probationMonths: 2,
    probationNotes: '試用期間中の条件：同条件',
    transfer: 'なし',
    insurance: '雇用保険，労災保険，健康保険，厚生年金，財形貯蓄，退職金共済',
    education: '不問',
    experienceNeeded: 'PCの基本操作（Excel・Word）ができる方',
    specialNotes: '創業45年の安定企業。賞与年2回・前年実績4.0ヶ月。決算賞与あり。年間休日122日。退職金制度充実。受動喫煙対策：敷地内禁煙。',
    parkingFee: '',
    parsedAt: '2026/08/11',
    rawText: `求人番号: 27030-10928371
事業所名: 大和精密工業 株式会社
職種: 総務・経理事務
基本給: 205,000円
賞与: 前年実績4.0ヶ月分
年間休日: 122日`
  },
  {
    id: 'sample-4',
    jobNo: '40010-88129031',
    title: '法人営業（既存顧客メイン・ルートセールス）',
    company: '九州マテリアル 株式会社',
    employmentType: '正社員',
    location: '福岡県福岡市博多区（博多駅 徒歩10分）',
    baseSalary: 230000,
    regularAllowance: 20000, // 外勤手当
    fixedOvertimePay: 40000, // 固定残業代30h
    fixedOvertimeHours: 30,
    bonusMonths: 2.5,
    annualHolidays: 108,
    weeklyDaysOff: '週休二日制（第2・第4土曜日は出勤あり）',
    workingHours: '08:30〜17:30 (休憩70分)',
    monthlyOvertime: 25,
    probationMonths: 6,
    probationNotes: '試用期間中は営業手当支給なし（固定残業代は支給）',
    transfer: 'あり（九州エリア内）',
    insurance: '雇用保険，労災保険，健康保険，厚生年金',
    education: '高校以上',
    experienceNeeded: '普通自動車運転免許（AT限定可）',
    specialNotes: '既存クライアントへの定期訪問および資材提案。営業車貸与。車通勤可能（駐車場代自己負担月3,000円）。受動喫煙対策あり。',
    parkingFee: '駐車場代自己負担 月3,000円',
    parsedAt: '2026/08/11',
    rawText: `求人番号: 40010-88129031
事業所名: 九州マテリアル 株式会社
職種: 法人営業
基本給: 230,000円
年間休日数: 108日`
  },
  {
    id: 'sample-5',
    jobNo: '11010-33419081',
    title: '医療事務・受付・会計スタッフ',
    company: '医療法人 社団緑風会 さくらクリニック',
    employmentType: '正社員以外', // 契約社員
    location: '埼玉県さいたま市大宮区（大宮駅 バス10分）',
    baseSalary: 185000,
    regularAllowance: 10000, // 資格手当
    fixedOvertimePay: 0,
    fixedOvertimeHours: 0,
    bonusMonths: 1.5,
    annualHolidays: 112,
    weeklyDaysOff: '週休二日制（水・日・祝日休診）',
    workingHours: '08:30〜19:00 (中抜け休憩150分)',
    monthlyOvertime: 3,
    probationMonths: 3,
    probationNotes: '同条件',
    transfer: 'なし',
    insurance: '雇用保険，労災保険，健康保険，厚生年金',
    education: '不問',
    experienceNeeded: '医療事務講座修了者または実務経験者',
    specialNotes: '地域密着型のクリニック。電子カルテ操作あり。正社員登用実績多数（過去3年で4名登用）。制服貸与。マイカー通勤可（無料駐車場あり）。',
    parkingFee: '無料駐車場あり',
    parsedAt: '2026/08/11',
    rawText: `求人番号: 11010-33419081
事業所名: さくらクリニック
職種: 医療事務
基本給: 185,000円`
  }
];
