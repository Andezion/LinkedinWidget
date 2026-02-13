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
    'Power BI', 'Tableau', 'Looker'
  ];

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function extractJobSkills(text) {
    const found = [];
    const seen = new Set();

    for (const skill of KNOWN_SKILLS) {
      const key = skill.toLowerCase();
      if (seen.has(key)) continue;

      const pattern = new RegExp('\\b' + escapeRegex(skill) + '\\b', 'i');
      if (pattern.test(text)) {
        seen.add(key);

        const yearsPatterns = [
          new RegExp('(\\d+)\\+?\\s*(?:years?|yrs?)\\s+(?:of\\s+)?(?:experience\\s+(?:with|in)\\s+)?' + escapeRegex(skill), 'i'),
          new RegExp(escapeRegex(skill) + '\\s*[:\\-]?\\s*(\\d+)\\+?\\s*(?:years?|yrs?)', 'i'),
          new RegExp('(\\d+)\\+?\\s*(?:years?|yrs?)\\s+' + escapeRegex(skill), 'i'),
        ];

        let requiredYears = 0;
        for (const yp of yearsPatterns) {
          const m = text.match(yp);
          if (m) {
            requiredYears = parseInt(m[1]);
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
        partial.push({
          ...job,
          userYears: userSkill.years,
        });
      } else {
        matched.push({
          ...job,
          userYears: userSkill.years,
        });
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

    badge.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      background: ${bgColor};
      border: 2px solid ${color};
      border-radius: 16px;
      padding: 12px 18px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: transform 0.15s;
      user-select: none;
    `;

    badge.innerHTML = `
      <div style="font-size: 28px; font-weight: 700; color: ${color}; text-align: center;">
        ${result.score}%
      </div>
      <div style="font-size: 11px; color: #666; text-align: center;">
        ${result.matched.length + result.partial.length}/${result.matched.length + result.partial.length + result.missing.length} skills
      </div>
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

    panel.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 24px;
      z-index: 99999;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      width: 320px;
      max-height: 420px;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #333;
    `;

    let html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <strong style="font-size: 15px; color: ${color};">Match: ${result.score}%</strong>
        <span id="ljm-close" style="cursor: pointer; font-size: 18px; color: #999;">&times;</span>
      </div>
    `;

    if (result.matched.length > 0) {
      html += `<div style="margin-bottom: 10px;"><strong style="color: #16a34a;">Matched:</strong></div>`;
      for (const s of result.matched) {
        html += `<div style="padding: 4px 0; color: #16a34a;">
          &#10003; ${esc(s.name)}
          <span style="color: #999; font-size: 11px; margin-left: 4px;">
            (you: ${s.userYears}y${s.requiredYears ? ` / need: ${s.requiredYears}y` : ''})
          </span>
        </div>`;
      }
    }

    if (result.partial.length > 0) {
      html += `<div style="margin-top: 8px; margin-bottom: 10px;"><strong style="color: #d97706;">Partial (less experience):</strong></div>`;
      for (const s of result.partial) {
        html += `<div style="padding: 4px 0; color: #d97706;">
          &#9888; ${esc(s.name)}
          <span style="color: #999; font-size: 11px; margin-left: 4px;">
            (you: ${s.userYears}y / need: ${s.requiredYears}y)
          </span>
        </div>`;
      }
    }

    if (result.missing.length > 0) {
      html += `<div style="margin-top: 8px; margin-bottom: 10px;"><strong style="color: #dc2626;">Missing:</strong></div>`;
      for (const s of result.missing) {
        html += `<div style="padding: 4px 0; color: #dc2626;">
          &#10007; ${esc(s.name)}
          ${s.requiredYears ? `<span style="color: #999; font-size: 11px;">(${s.requiredYears}y required)</span>` : ''}
        </div>`;
      }
    }

    if (result.matched.length === 0 && result.partial.length === 0 && result.missing.length === 0) {
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
      '.jobs-unified-top-card',
      '#job-details',
      '.job-details-jobs-unified-top-card__job-insight',
      '[class*="jobs-description"]',
      '[class*="job-details"]',
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

  function analyze() {
    chrome.storage.local.get('skills', (data) => {
      const userSkills = data.skills || [];

      if (userSkills.length === 0) {
        renderBadge({ score: 0, matched: [], missing: [], partial: [] });
        return;
      }

      const jobText = getJobDescription();
      const jobSkills = extractJobSkills(jobText);
      const result = calculateMatch(userSkills, jobSkills);
      renderBadge(result);
    });
  }

  let lastUrl = location.href;

  function checkAndRun() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      const oldBadge = document.getElementById(BADGE_ID);
      const oldPanel = document.getElementById(PANEL_ID);
      if (oldBadge) oldBadge.remove();
      if (oldPanel) oldPanel.remove();
    }

    if (location.href.includes('/jobs/')) {
      setTimeout(analyze, 1500);
    }
  }

  checkAndRun();

  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      checkAndRun();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', checkAndRun);
})();
