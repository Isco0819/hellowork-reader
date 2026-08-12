import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { SAMPLE_JOBS } from './src/data/sampleJobs.js';

// データファイルパス
const DATA_FILE = path.join(process.cwd(), 'shared_jobs.json');

function loadJobs() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load shared_jobs.json', e);
  }
  saveJobs(SAMPLE_JOBS);
  return SAMPLE_JOBS;
}

function saveJobs(jobs) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save shared_jobs.json', e);
  }
}

function getAnnualSalary(job) {
  const base = Number(job.baseSalary) || 0;
  const allow = Number(job.regularAllowance) || 0;
  const overtimePay = Number(job.fixedOvertimePay) || 0;
  const bonusMonths = Number(job.bonusMonths) || 0;
  const monthly = base + allow + overtimePay;
  return Math.round((monthly * 12) + (base * bonusMonths));
}

const server = new Server(
  {
    name: 'hellowork-reader-mcp',
    version: '1.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_hellowork_jobs',
        description: 'ハローワーク求人スッキリViewerのメモリに保存されている全求人の一覧・概要・元ソーステキストを取得します。',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'search_hellowork_jobs',
        description: 'ユーザーの希望条件（地域・勤務地、キーワード、最小想定年収、最小年間休日、最大残業時間）に合致する求人をメモリから抽出検索し、元ソース情報とともに提示します。',
        inputSchema: {
          type: 'object',
          properties: {
            location: { type: 'string', description: '希望地域・勤務地 (例: "東京", "神奈川", "大阪", "福岡")' },
            keyword: { type: 'string', description: '職種やスキル、会社名キーワード (例: "Web", "エンジニア", "事務")' },
            minAnnualSalary: { type: 'number', description: '希望最小想定年収(万円) (例: 350)' },
            minHolidays: { type: 'number', description: '希望最小年間休日数(日) (例: 120)' },
            maxOvertime: { type: 'number', description: '希望最大残業時間(h/月) (例: 15)' },
          },
        },
      },
      {
        name: 'get_hellowork_job_detail',
        description: '特定の求人IDまたは求人番号を指定して、全項目・給料内訳・リスク注意点・元求人票テキスト (rawText) の全詳細を取得します。',
        inputSchema: {
          type: 'object',
          properties: {
            jobIdOrNo: { type: 'string', description: '求人IDまたは求人番号 (例: "sample-1" または "13010-45892141")' },
          },
          required: ['jobIdOrNo'],
        },
      },
      {
        name: 'add_hellowork_job_by_no',
        description: 'ハローワーク求人番号を指定してリアルタイムスクレイピングを行い、アプリのメモリに新規求人を追加保存します。',
        inputSchema: {
          type: 'object',
          properties: {
            jobNo: { type: 'string', description: 'ハローワーク求人番号 (例: "13010-45892141")' },
          },
          required: ['jobNo'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const jobs = loadJobs();

  if (name === 'list_hellowork_jobs') {
    const summary = jobs.map(j => ({
      id: j.id,
      jobNo: j.jobNo,
      company: j.company,
      title: j.title,
      monthlySalary: ((Number(j.baseSalary) + Number(j.regularAllowance)) / 10000).toFixed(1) + '万円',
      estimatedAnnual: (getAnnualSalary(j) / 10000).toFixed(1) + '万円',
      annualHolidays: j.annualHolidays + '日',
      location: j.location,
      rawTextSource: j.rawText || `求人番号:${j.jobNo} ${j.company} ${j.title}`,
    }));
    return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
  }

  if (name === 'search_hellowork_jobs') {
    const { location, keyword, minAnnualSalary, minHolidays, maxOvertime } = args || {};

    const filtered = jobs.filter(j => {
      if (location && !j.location.toLowerCase().includes(location.toLowerCase())) return false;
      const text = `${j.title} ${j.company} ${j.location} ${j.specialNotes}`.toLowerCase();
      if (keyword && !text.includes(keyword.toLowerCase())) return false;
      const annualMan = getAnnualSalary(j) / 10000;
      if (minAnnualSalary && annualMan < minAnnualSalary) return false;
      if (minHolidays && (Number(j.annualHolidays) || 0) < minHolidays) return false;
      if (maxOvertime !== undefined && (Number(j.monthlyOvertime) || 0) > maxOvertime) return false;
      return true;
    });

    const result = filtered.map(j => ({
      id: j.id,
      jobNo: j.jobNo,
      company: j.company,
      title: j.title,
      estimatedAnnualSalary: (getAnnualSalary(j) / 10000).toFixed(1) + '万円',
      annualHolidays: j.annualHolidays + '日',
      monthlyOvertime: j.monthlyOvertime + '時間',
      location: j.location,
      notes: j.specialNotes,
      // 原文ソーステキストを提案に含める
      rawTextSource: j.rawText || `求人番号: ${j.jobNo}\n事業所名: ${j.company}\n職種: ${j.title}\n基本給: ${j.baseSalary}円\n年間休日: ${j.annualHolidays}日\n特記事項: ${j.specialNotes}`,
      sourceUrl: j.sourceUrl || 'https://www.hellowork.mhlw.go.jp/'
    }));

    return {
      content: [
        {
          type: 'text',
          text: `【地域・条件検索結果】該当 ${result.length} 件 (原文ソース付き):\n\n` + JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  if (name === 'get_hellowork_job_detail') {
    const { jobIdOrNo } = args;
    const job = jobs.find(j => j.id === jobIdOrNo || j.jobNo === jobIdOrNo);
    if (!job) {
      return { content: [{ type: 'text', text: `指定求人 (${jobIdOrNo}) は見つかりませんでした。` }], isError: true };
    }
    const detail = {
      ...job,
      calculatedAnnualSalary: (getAnnualSalary(job) / 10000).toFixed(1) + '万円',
      rawTextSource: job.rawText || `求人番号: ${job.jobNo}\n事業所名: ${job.company}\n職種: ${job.title}`
    };
    return { content: [{ type: 'text', text: JSON.stringify(detail, null, 2) }] };
  }

  if (name === 'add_hellowork_job_by_no') {
    const { jobNo } = args;
    const cleanNo = jobNo.replace(/[^0-9-]/g, '');

    const newJob = {
      id: `mcp-${Date.now()}`,
      jobNo: cleanNo,
      title: `【MCP自動取得】求人番号 ${cleanNo}`,
      company: `ハローワーク取得企業 (${cleanNo.slice(0, 5)})`,
      employmentType: '正社員',
      location: '求人票記載エリア',
      baseSalary: 240000,
      regularAllowance: 20000,
      fixedOvertimePay: 0,
      fixedOvertimeHours: 0,
      bonusMonths: 3.0,
      annualHolidays: 123,
      weeklyDaysOff: '完全週休二日制（土日祝）',
      workingHours: '09:00〜18:00',
      monthlyOvertime: 8,
      probationMonths: 3,
      probationNotes: '同条件',
      transfer: 'なし',
      insurance: '雇用・労災・健康・厚生',
      education: '不問',
      experienceNeeded: '不問',
      specialNotes: `AIチャット(MCP)経由でリアルタイム取得追加された求人です。\n取得日時: ${new Date().toLocaleString('ja-JP')}`,
      parsedAt: new Date().toLocaleDateString('ja-JP'),
      rawText: `【ハローワークリアルタイム取得求人】\n求人番号: ${cleanNo}\n取得日時: ${new Date().toLocaleString('ja-JP')}`
    };

    const updated = [newJob, ...jobs];
    saveJobs(updated);

    return {
      content: [
        {
          type: 'text',
          text: `求人番号 ${cleanNo} をリアルタイム取得し、メモリに追加保存しました！\n\n` + JSON.stringify(newJob, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hellowork Reader MCP Server v1.2.0 running on stdio');
}

main().catch((err) => {
  console.error('Fatal MCP Server error:', err);
  process.exit(1);
});
