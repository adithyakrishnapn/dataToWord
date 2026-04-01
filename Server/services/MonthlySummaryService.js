import env from '../config/env.js';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

function normalizeMonth(month) {
  return String(month || '').trim();
}

function countBy(list, pick) {
  const map = {};
  for (const item of list || []) {
    const key = String(pick(item) || 'Unknown').trim() || 'Unknown';
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}

function topEntries(map, limit = 8) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function buildPrompt(month, snapshot) {
  // Compact format to reduce tokens
  const compactData = {
    month: snapshot.month,
    totalRecords: snapshot.totalRecords,
    p1: {
      teaching: snapshot.pillar1.innovativeTeaching,
      eContent: snapshot.pillar1.eContents,
      guestLectures: snapshot.pillar1.guestLectures,
      fdps: snapshot.pillar1.fdpsOrganized,
      courseSessions: snapshot.pillar1.courseFacilitatorSessions,
      facultyEvents: snapshot.pillar1.facultyEvents,
      studentEvents: snapshot.pillar1.studentEvents,
      nptel: snapshot.pillar1.nptelMooc,
      achievements: snapshot.pillar1.academicAchievements,
      topDepts: snapshot.pillar1.topDepartments.slice(0, 5).map(x => `${x.name}(${x.value})`).join(', '),
    },
    p2: { total: snapshot.pillar2.total, top: snapshot.pillar2.activeSections.slice(0, 3).map(x => `${x.name}(${x.value})`).join(', ') },
    p3: { total: snapshot.pillar3.total, top: snapshot.pillar3.activeSections.slice(0, 3).map(x => `${x.name}(${x.value})`).join(', ') },
    p4: { total: snapshot.pillar4.total, top: snapshot.pillar4.activeSections.slice(0, 3).map(x => `${x.name}(${x.value})`).join(', ') },
    p5: { total: snapshot.pillar5.total, top: snapshot.pillar5.activeSections.slice(0, 3).map(x => `${x.name}(${x.value})`).join(', ') },
  };

  return [
    'Write a formal monthly college report summary (not tables) from the snapshot.',
    `Month: ${month}`,
    'Instructions: Use clear headings, concise paragraphs. Mention all 5 pillars. Include achievements, participation, events. Keep formal and institution-ready tone. Do not fabricate. If data missing, say "Data not available for this pillar." Output: 450-700 words markdown.',
    '',
    'SNAPSHOT:',
    JSON.stringify(compactData),
  ].join('\n');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryDelayMs(message) {
  const text = String(message || '');
  const match = text.match(/retry in\s*([0-9]+(?:\.[0-9]+)?)s/i);
  if (!match) {
    return null;
  }
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  return Math.min(Math.ceil(seconds * 1000), 12000);
}

function isModelNotFoundError(message) {
  return /not found|not supported|unsupported/i.test(String(message || ''));
}

function isRetryableDemandError(message, status) {
  const text = String(message || '');
  if ([429, 500, 502, 503, 504].includes(Number(status))) {
    return true;
  }
  return /high demand|spikes in demand|please try again later|temporarily unavailable|rate limit|resource exhausted|deadline exceeded|internal error/i.test(text);
}

function fallbackSummary(month, snapshot) {
  const p1 = snapshot.pillar1;
  const p2 = snapshot.pillar2;
  const p3 = snapshot.pillar3;
  const p4 = snapshot.pillar4;
  const p5 = snapshot.pillar5;

  const topDeptText = p1.topDepartments.length
    ? p1.topDepartments.map((item) => `${item.name} (${item.value})`).join(', ')
    : 'No department-level trend was observed for this month.';

  const p2Text = p2.total
    ? `A total of ${p2.total} entries were recorded, with notable activity in ${p2.activeSections.map((x) => `${x.name} (${x.value})`).join(', ')}.`
    : 'No records were captured under Pillar 2 for this month.';

  const p3Text = p3.total
    ? `A total of ${p3.total} entries were recorded, with the strongest contribution in ${p3.activeSections.map((x) => `${x.name} (${x.value})`).join(', ')}.`
    : 'No records were captured under Pillar 3 for this month.';

  const p4Text = p4.total
    ? `A total of ${p4.total} entries were recorded, with participation concentrated in ${p4.activeSections.map((x) => `${x.name} (${x.value})`).join(', ')}.`
    : 'No records were captured under Pillar 4 for this month.';

  const p5Text = p5.total
    ? `A total of ${p5.total} entries were recorded, with key focus areas in ${p5.activeSections.map((x) => `${x.name} (${x.value})`).join(', ')}.`
    : 'No records were captured under Pillar 5 for this month.';

  return [
    `# Monthly Institutional Summary - ${month}`,
    '',
    `During ${month}, the institution recorded a total of ${snapshot.totalRecords} activity entries across all reporting pillars. This summary presents a consolidated narrative of teaching-learning initiatives, creativity and research outputs, career development engagement, industry linkage activities, and social responsibility interventions captured during the month.`,
    '',
    `Under Pillar 1 (Center for Learning and Teaching), ${p1.innovativeTeaching} innovative teaching practices, ${p1.eContents} e-content submissions, ${p1.guestLectures} guest lecture/workshop events, ${p1.fdpsOrganized} FDP initiatives, and ${p1.courseFacilitatorSessions} course facilitator sessions were documented. Faculty participation entries were ${p1.facultyEvents}, student participation entries were ${p1.studentEvents}, and NPTEL/MOOC completions were ${p1.nptelMooc}. Academic achievement records added in this period were ${p1.academicAchievements}. The strongest departmental concentration was observed in ${topDeptText}`,
    '',
    `For Pillar 2 (Center for Creativity), ${p2Text}`,
    '',
    `For Pillar 3 (Skill and Career Development), ${p3Text}`,
    '',
    `For Pillar 4 (Industry Institute Partnership Cell), ${p4Text}`,
    '',
    `For Pillar 5 (Social Responsibility Initiatives), ${p5Text}`,
    '',
    `Overall, ${month} reflects a balanced institutional contribution with clear strengths in active pillars and identifiable scope for expansion in low-activity domains. The recorded dataset should be used for evidence mapping, accreditation documentation, and planning of targeted interventions for the upcoming month.`,
  ].join('\n');
}

function cleanInlineMarkdown(text = '') {
  return String(text)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim();
}

async function buildSummaryDocx(summaryMarkdown, month) {
  const content = String(summaryMarkdown || '').trim();
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun(`Monthly Institutional Summary - ${month}`)],
      spacing: { after: 280 },
    }),
  ];

  for (const block of blocks) {
    if (/^#\s+/.test(block) || /^##\s+/.test(block) || /^###\s+/.test(block)) {
      const headingText = cleanInlineMarkdown(block.replace(/^#{1,3}\s+/, ''));
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun(headingText)],
          spacing: { before: 180, after: 120 },
        })
      );
      continue;
    }

    children.push(
      new Paragraph({
        children: [new TextRun(cleanInlineMarkdown(block.replace(/\n/g, ' ')))],
        spacing: { after: 180 },
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}

async function callGemini(prompt) {
  const configuredModel = String(env.geminiModel || 'gemini-3-flash-preview').trim();
  const key = env.geminiApiKey || '';
  const customUrl = String(env.geminiApiUrl || '').trim();

  if (!key && !customUrl) {
    throw new Error('Gemini is not configured. Set GEMINI_API_KEY (and optionally GEMINI_API_URL).');
  }

  const normalizeModelName = (value) => String(value || '').trim().replace(/^models\//i, '');
  const candidateModels = Array.from(new Set([
    normalizeModelName(configuredModel),
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
  ].filter(Boolean)));

  const buildUrl = (model) => {
    const defaultUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    if (!customUrl) {
      return defaultUrl;
    }

    const normalizedCustom = customUrl.replace(/\/+$/, '');

    if (/generateContent/i.test(normalizedCustom)) {
      // If custom URL hardcodes a model path, use as-is (only key replacement/append).
      if (/\/models\//i.test(normalizedCustom)) {
        if (normalizedCustom.includes('{API_KEY}')) {
          return normalizedCustom.replace('{API_KEY}', encodeURIComponent(key));
        }
        if (key && !/[?&]key=/.test(normalizedCustom)) {
          const separator = normalizedCustom.includes('?') ? '&' : '?';
          return `${normalizedCustom}${separator}key=${encodeURIComponent(key)}`;
        }
        return normalizedCustom;
      }

      // If it's a generateContent base without model, append model safely.
      let base = normalizedCustom;
      if (!/\/models\//i.test(base)) {
        base = `${base}/models/${encodeURIComponent(model)}:generateContent`;
      }
      if (base.includes('{API_KEY}')) {
        return base.replace('{API_KEY}', encodeURIComponent(key));
      }
      if (key && !/[?&]key=/.test(base)) {
        const separator = base.includes('?') ? '&' : '?';
        return `${base}${separator}key=${encodeURIComponent(key)}`;
      }
      return base;
    }

    if (/generativelanguage\.googleapis\.com/i.test(normalizedCustom)) {
      return `${normalizedCustom}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    }

    return defaultUrl;
  };

  let lastError = null;
  const maxAttemptsPerModel = 3;

  for (const model of candidateModels) {
    const url = buildUrl(model);

    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt += 1) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.9,
            maxOutputTokens: 1200,
          },
        }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const message = payload?.error?.message || `Gemini request failed with status ${response.status}`;
        lastError = new Error(`${message} (model: ${model})`);

        if (isModelNotFoundError(message)) {
          break;
        }

        if (isRetryableDemandError(message, response.status)) {
          if (attempt < maxAttemptsPerModel) {
            const parsedDelay = parseRetryDelayMs(message);
            const backoff = Math.min(12000, (2 ** (attempt - 1)) * 1500);
            const jitter = Math.floor(Math.random() * 500);
            await delay((parsedDelay ?? backoff) + jitter);
            continue;
          }
          // Try next model if this one is under temporary demand pressure.
          break;
        }

        throw lastError;
      }

      const text = payload?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('')?.trim();
      if (!text) {
        lastError = new Error(`Gemini returned an empty summary (model: ${model}).`);
        if (attempt < maxAttemptsPerModel) {
          await delay(600 + Math.floor(Math.random() * 300));
          continue;
        }
        break;
      }

      return text;
    }
  }

  throw lastError || new Error('Gemini failed for all candidate models.');
}

function buildSnapshot(month, data) {
  // Limit records to reduce token count (sample representative data)
  const limit = (arr, max = 100) => arr.slice(0, max);
  
  const p2Sections = countBy(limit(data.pillarRecords.filter((r) => r.pillarNumber === 2), 50), (r) => r.sectionTitle || r.sectionKey);
  const p3Sections = countBy(limit(data.pillarRecords.filter((r) => r.pillarNumber === 3), 50), (r) => r.sectionTitle || r.sectionKey);
  const p4Sections = countBy(limit(data.pillarRecords.filter((r) => r.pillarNumber === 4), 50), (r) => r.sectionTitle || r.sectionKey);
  const p5Sections = countBy(limit(data.pillarRecords.filter((r) => r.pillarNumber === 5), 50), (r) => r.sectionTitle || r.sectionKey);

  const snapshot = {
    month,
    totalRecords:
      data.innovativeTeaching.length + data.eContents.length + data.guestLectures.length + data.fdpsOrganized.length +
      data.courseFacilitatorSessions.length + data.facultyEvents.length + data.studentEvents.length +
      data.nptelMooc.length + data.academicAchievements.length + data.pillarRecords.length,
    pillar1: {
      innovativeTeaching: data.innovativeTeaching.length,
      eContents: data.eContents.length,
      guestLectures: data.guestLectures.length,
      fdpsOrganized: data.fdpsOrganized.length,
      courseFacilitatorSessions: data.courseFacilitatorSessions.length,
      facultyEvents: data.facultyEvents.length,
      studentEvents: data.studentEvents.length,
      nptelMooc: data.nptelMooc.length,
      academicAchievements: data.academicAchievements.length,
      topDepartments: topEntries(countBy([
        ...limit(data.innovativeTeaching, 50),
        ...limit(data.guestLectures, 50),
        ...limit(data.fdpsOrganized, 50),
        ...limit(data.courseFacilitatorSessions, 50),
        ...limit(data.facultyEvents, 50),
        ...limit(data.studentEvents, 50),
      ], (item) => item.department || item.branch || item.classOrDepartment), 8),
    },
    pillar2: {
      total: data.pillarRecords.filter((r) => r.pillarNumber === 2).length,
      activeSections: topEntries(p2Sections, 8),
    },
    pillar3: {
      total: data.pillarRecords.filter((r) => r.pillarNumber === 3).length,
      activeSections: topEntries(p3Sections, 8),
    },
    pillar4: {
      total: data.pillarRecords.filter((r) => r.pillarNumber === 4).length,
      activeSections: topEntries(p4Sections, 8),
    },
    pillar5: {
      total: data.pillarRecords.filter((r) => r.pillarNumber === 5).length,
      activeSections: topEntries(p5Sections, 8),
    },
  };

  return snapshot;
}

const MonthlySummaryService = {
  async generate(month, allData, options = {}) {
    const normalizedMonth = normalizeMonth(month) || 'All Months';
    const snapshot = buildSnapshot(normalizedMonth, allData);
    const provider = String(options.provider || env.summaryProvider || 'local').trim().toLowerCase();

    if (provider === 'local' || provider === 'deterministic') {
      return {
        source: 'local',
        month: normalizedMonth,
        summaryMarkdown: fallbackSummary(normalizedMonth, snapshot),
        snapshot,
      };
    }

    const prompt = buildPrompt(normalizedMonth, snapshot);

    try {
      const summaryMarkdown = await callGemini(prompt);
      return {
        source: 'gemini',
        month: normalizedMonth,
        summaryMarkdown,
        snapshot,
      };
    } catch (error) {
      if (provider === 'gemini') {
        throw error;
      }

      return {
        source: 'fallback',
        month: normalizedMonth,
        warning: error.message,
        summaryMarkdown: fallbackSummary(normalizedMonth, snapshot),
        snapshot,
      };
    }
  },

  async generateDocx(summaryMarkdown, month) {
    const normalizedMonth = normalizeMonth(month) || 'All Months';
    return buildSummaryDocx(summaryMarkdown, normalizedMonth);
  },
};

export default MonthlySummaryService;
