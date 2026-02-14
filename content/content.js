(function () {
  'use strict';

  const BADGE_ID = 'ljm-match-badge';
  const PANEL_ID = 'ljm-match-panel';

  const KNOWN_SKILLS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Go', 'Golang',
    'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'Perl', 'Haskell',
    'Elixir', 'Clojure', 'Dart', 'Lua', 'MATLAB', 'Objective-C',
    'React', 'Angular', 'Vue', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt', 'Gatsby',
    'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot',
    'Laravel', 'Rails', 'Ruby on Rails', 'ASP.NET', '.NET', 'Blazor',
    'HTML', 'CSS', 'SASS', 'SCSS', 'Tailwind', 'Bootstrap', 'Material UI',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'SQLite', 'Oracle', 'DynamoDB', 'Cassandra', 'CouchDB', 'Neo4j',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Google Cloud',
    'Terraform', 'Ansible', 'Jenkins', 'CI/CD', 'GitHub Actions', 'GitLab CI',
    'Linux', 'Bash', 'Shell', 'PowerShell', 'Nginx', 'Apache',
    'GraphQL', 'REST', 'gRPC', 'WebSocket', 'RabbitMQ', 'Kafka',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'Git', 'SVN', 'Jira', 'Figma', 'Photoshop',
    'Agile', 'Scrum', 'Kanban', 'DevOps', 'SRE',
    'Cypress', 'Jest', 'Mocha', 'Selenium', 'Playwright',
    'Firebase', 'Supabase', 'Vercel', 'Heroku', 'Netlify',
    'React Native', 'Flutter', 'Ionic', 'Xamarin', 'Electron',
    'Unity', 'Unreal Engine', 'Godot',
    'Blockchain', 'Solidity', 'Web3', 'Ethereum',
    'Three.js', 'WebGL', 'OpenGL', 'Vulkan',
    'RxJS', 'Redux', 'MobX', 'Zustand', 'Pinia', 'Vuex',
    'Webpack', 'Vite', 'Rollup', 'esbuild', 'Babel',
    'OAuth', 'JWT', 'SAML', 'OpenID',
    'Microservices', 'Monolith', 'Serverless', 'Lambda',
    'S3', 'EC2', 'ECS', 'EKS', 'CloudFormation',
    'Datadog', 'Grafana', 'Prometheus', 'New Relic',
    'Hadoop', 'Spark', 'Airflow', 'dbt', 'Snowflake', 'BigQuery',
    'Power BI', 'Tableau', 'Looker',
    'Visual Studio', 'VS Code', 'IntelliJ', 'Eclipse',
    'OOP', 'Object-Oriented Programming', 'Design Patterns',
    'Data Structures', 'Algorithms', 'Multithreading', 'Concurrency',
    'Windows', 'macOS', 'Unix',
    'TCP/IP', 'HTTP', 'HTTPS', 'FTP', 'SSH',
    'XML', 'JSON', 'YAML', 'Protobuf',
    'CMake', 'Make', 'MSBuild', 'Gradle', 'Maven',
    'Fixed Income', 'Trading', 'Finance',
    'Problem Solving', 'Troubleshooting',
    'English', 'Communication'
  ];

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function makeSkillPattern(skill) {
    const escaped = escapeRegex(skill);
    const endsWithSpecial = /[^a-zA-Z0-9]$/.test(skill);
    const startsWithSpecial = /^[^a-zA-Z0-9]/.test(skill);

    if (skill.length <= 2) {
      return new RegExp('(?:^|[\\s,;/|(])' + escaped + '(?=[\\s,;/|).:\\-]|$)', 'i');
    }

    const left = startsWithSpecial ? '(?:^|[\\s,;/|(])' : '\\b';
    const right = endsWithSpecial ? '(?=[\\s,;/|).:\\-]|$)' : '\\b';
    return new RegExp(left + escaped + right, 'i');
  }

  function extractJobSkills(text) {
    const found = [];
    const seen = new Set();

    for (const skill of KNOWN_SKILLS) {
      const key = skill.toLowerCase();
      if (seen.has(key)) continue;

      const pattern = makeSkillPattern(skill);

      if (pattern.test(text)) {
        seen.add(key);

        const yearsPatterns = [
          new RegExp('(\\d{1,2})\\+?\\s*(?:years?|yrs?)\\s+(?:of\\s+)?(?:experience\\s+(?:with|in)\\s+)?' + escapeRegex(skill), 'i'),
          new RegExp(escapeRegex(skill) + '\\s*[:\\-]?\\s*(\\d{1,2})\\+?\\s*(?:years?|yrs?)', 'i'),
          new RegExp('(\\d{1,2})\\+?\\s*(?:years?|yrs?)\\s+' + escapeRegex(skill), 'i'),
        ];

        let requiredYears = 0;
        for (const yp of yearsPatterns) {
          const m = text.match(yp);
          if (m) {
            const parsed = parseInt(m[1]);
            if (parsed > 0 && parsed <= 50) {
              requiredYears = parsed;
            }
            break;
          }
        }

        found.push({ name: skill, requiredYears });
      }
    }

    return found;
  }

  function calculateMatch(userSkills, jobSkills) {
    if (jobSkills.length === 0) return { score: 0, matched: [], missing: [], partial: [] };

    const matched = [];
    const missing = [];
    const partial = [];

    for (const job of jobSkills) {
      const userSkill = userSkills.find(
        u => u.name.toLowerCase() === job.name.toLowerCase()
      );

      if (!userSkill) {
        missing.push(job);
      } else if (job.requiredYears > 0 && userSkill.years < job.requiredYears) {
        partial.push({ ...job, userYears: userSkill.years });
      } else {
        matched.push({ ...job, userYears: userSkill.years });
      }
    }

    const score = Math.round(
      ((matched.length + partial.length * 0.5) / jobSkills.length) * 100
    );

    return { score, matched, missing, partial };
  }

  function scoreColor(score) {
    const hue = score * 1.2;
    return `hsl(${hue}, 80%, 45%)`;
  }

  function scoreBgColor(score) {
    const hue = score * 1.2;
    return `hsl(${hue}, 85%, 95%)`;
  }

  function renderBadge(result) {
    let badge = document.getElementById(BADGE_ID);
    if (!badge) {
      badge = document.createElement('div');
      badge.id = BADGE_ID;
      document.body.appendChild(badge);
    }

    const color = scoreColor(result.score);
    const bgColor = scoreBgColor(result.score);
    const total = result.matched.length + result.partial.length + result.missing.length;

    badge.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      background: ${bgColor};
      border: 2px solid ${color};
      border-radius: 16px;
      padding: 14px 20px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: transform 0.15s;
      user-select: none;
      min-width: 120px;
      max-width: 240px;
      max-height: 60vh;
      overflow-y: auto;
      text-align: center;
    `;

    let missingHtml = '';
    if (result.missing.length > 0) {
      missingHtml = `
        <div style="margin-top: 6px; border-top: 1px solid ${color}33; padding-top: 6px; text-align: left;">
          ${result.missing.map(s =>
            `<div style="font-size: 10px; color: #dc2626; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;">&#10007; ${esc(s.name)}</div>`
          ).join('')}
        </div>
      `;
    }
    let partialHtml = '';
    if (result.partial.length > 0) {
      partialHtml = `
        <div style="margin-top: 4px; border-top: 1px solid ${color}33; padding-top: 4px; text-align: left;">
          ${result.partial.map(s =>
            `<div style="font-size: 10px; color: #d97706; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;">&#9888; ${esc(s.name)} (${s.userYears}y/${s.requiredYears}y)</div>`
          ).join('')}
        </div>
      `;
    }
    let matchedHtml = '';
    if (result.matched.length > 0) {
      matchedHtml = `
        <div style="margin-top: 4px; border-top: 1px solid ${color}33; padding-top: 4px; text-align: left;">
          ${result.matched.map(s =>
            `<div style="font-size: 10px; color: #16a34a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;">&#10003; ${esc(s.name)}</div>`
          ).join('')}
        </div>
      `;
    }

    badge.innerHTML = `
      <div style="font-size: 28px; font-weight: 700; color: ${color}; line-height: 1.2; white-space: nowrap;">
        ${result.score}%
      </div>
      <div style="font-size: 11px; color: #666; white-space: nowrap;">
        ${total > 0 ? `${result.matched.length + result.partial.length}/${total} skills` : 'No skills found'}
      </div>
      ${matchedHtml}
      ${partialHtml}
      ${missingHtml}
    `;

    badge.onmouseenter = () => badge.style.transform = 'scale(1.05)';
    badge.onmouseleave = () => badge.style.transform = 'scale(1)';
    badge.onclick = () => togglePanel(result);
  }

  function togglePanel(result) {
    let panel = document.getElementById(PANEL_ID);
    if (panel) {
      panel.remove();
      return;
    }

    panel = document.createElement('div');
    panel.id = PANEL_ID;

    const color = scoreColor(result.score);
    const total = result.matched.length + result.partial.length + result.missing.length;

    panel.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 24px;
      z-index: 99999;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      width: 340px;
      max-height: 520px;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
    `;

    let html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <strong style="font-size: 15px; color: ${color};">Match: ${result.score}%</strong>
        <span id="ljm-close" style="cursor: pointer; font-size: 20px; color: #999; padding: 0 4px;">&times;</span>
      </div>
    `;

    if (result.matched.length > 0) {
      html += `<div style="margin-bottom: 6px;"><strong style="color: #16a34a;">Matched (${result.matched.length}):</strong></div>`;
      for (const s of result.matched) {
        html += `<div style="padding: 3px 0; color: #16a34a; display: flex; align-items: baseline; gap: 6px;">
          <span>&#10003;</span>
          <span>${esc(s.name)}
            <span style="color: #999; font-size: 11px;">
              (you: ${s.userYears}y${s.requiredYears ? ` / need: ${s.requiredYears}y` : ''})
            </span>
          </span>
        </div>`;
      }
    }

    if (result.partial.length > 0) {
      html += `<div style="margin-top: 10px; margin-bottom: 6px;"><strong style="color: #d97706;">Partial (${result.partial.length}):</strong></div>`;
      for (const s of result.partial) {
        html += `<div style="padding: 3px 0; color: #d97706; display: flex; align-items: baseline; gap: 6px;">
          <span>&#9888;</span>
          <span>${esc(s.name)}
            <span style="color: #999; font-size: 11px;">
              (you: ${s.userYears}y / need: ${s.requiredYears}y)
            </span>
          </span>
        </div>`;
      }
    }

    if (result.missing.length > 0) {
      html += `<div style="margin-top: 10px; margin-bottom: 6px;"><strong style="color: #dc2626;">Missing (${result.missing.length}):</strong></div>`;
      for (const s of result.missing) {
        html += `<div style="padding: 3px 0; color: #dc2626; display: flex; align-items: baseline; gap: 6px;">
          <span>&#10007;</span>
          <span>${esc(s.name)}
            ${s.requiredYears ? `<span style="color: #999; font-size: 11px;">(${s.requiredYears}y required)</span>` : ''}
          </span>
        </div>`;
      }
    }

    if (total === 0) {
      html += `<div style="color: #999; text-align: center; padding: 20px 0;">
        No tech skills detected in this job posting.<br>
        Try adding skills in the extension popup.
      </div>`;
    }

    panel.innerHTML = html;
    document.body.appendChild(panel);

    document.getElementById('ljm-close').onclick = () => panel.remove();
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function getJobDescription() {
    const selectors = [
      '.jobs-description__content',
      '.jobs-box__html-content',
      '.jobs-description-content__text',
      '#job-details',
      '.jobs-search__job-details--container',
      '.jobs-search__job-details',
      '.job-details-module',
      '.jobs-details__main-content',
      '.jobs-details-top-card',
      '.jobs-unified-top-card',
      '.job-details-jobs-unified-top-card__job-insight',
      '[class*="jobs-description"]',
      '[class*="job-details"]',
      '[class*="jobs-details"]',
      'article[class*="jobs"]',
      '.scaffold-layout__detail',
      '.jobs-search__right-rail',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 50) {
        return el.textContent;
      }
    }

    const main = document.querySelector('main') || document.body;
    return main.textContent;
  }

  function waitForJobDescription(callback, maxAttempts) {
    let attempts = 0;
    const max = maxAttempts || 10;

    function tryFind() {
      attempts++;
      const text = getJobDescription();
      if (text && text.length > 200) {
        callback(text);
      } else if (attempts < max) {
        setTimeout(tryFind, 1000);
      } else {
        callback(text || '');
      }
    }

    tryFind();
  }

  function analyze() {
    chrome.storage.local.get('skills', (data) => {
      const userSkills = data.skills || [];

      if (userSkills.length === 0) {
        renderBadge({ score: 0, matched: [], missing: [], partial: [] });
        return;
      }

      waitForJobDescription((jobText) => {
        const jobSkills = extractJobSkills(jobText);
        const result = calculateMatch(userSkills, jobSkills);
        renderBadge(result);
      });
    });
  }

  function cleanup() {
    const oldBadge = document.getElementById(BADGE_ID);
    const oldPanel = document.getElementById(PANEL_ID);
    if (oldBadge) oldBadge.remove();
    if (oldPanel) oldPanel.remove();
  }

  let lastUrl = '';
  let lastJobId = null;
  let analyzeTimer = null;

  function getJobId() {
    const param = new URLSearchParams(location.search).get('currentJobId');
    if (param) return param;
    const viewMatch = location.pathname.match(/\/jobs\/view\/(\d+)/);
    if (viewMatch) return viewMatch[1];
    return null;
  }

  function checkAndRun() {
    const currentUrl = location.href;
    const currentJobId = getJobId();

    if (currentUrl === lastUrl && currentJobId === lastJobId) return;

    lastUrl = currentUrl;
    lastJobId = currentJobId;

    if (analyzeTimer) clearTimeout(analyzeTimer);

    cleanup();

    if (location.href.includes('/jobs/')) {
      analyzeTimer = setTimeout(analyze, 800);
    }
  }

  checkAndRun();

  const observer = new MutationObserver(() => {
    checkAndRun();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', checkAndRun);

  const origPushState = history.pushState;
  const origReplaceState = history.replaceState;
  history.pushState = function () {
    origPushState.apply(this, arguments);
    setTimeout(checkAndRun, 100);
  };
  history.replaceState = function () {
    origReplaceState.apply(this, arguments);
    setTimeout(checkAndRun, 100);
  };
})();
