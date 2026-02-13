const skillForm = document.getElementById('skillForm');
const skillNameInput = document.getElementById('skillName');
const skillYearsInput = document.getElementById('skillYears');
const skillsContainer = document.getElementById('skills');
const skillCount = document.getElementById('skillCount');
const clearAllBtn = document.getElementById('clearAll');
const cvFile = document.getElementById('cvFile');
const cvStatus = document.getElementById('cvStatus');

let skills = [];

chrome.storage.local.get('skills', (data) => {
  skills = data.skills || [];
  render();
});

skillForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = skillNameInput.value.trim();
  const years = parseFloat(skillYearsInput.value);
  if (!name) return;

  const exists = skills.some(s => s.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    skillNameInput.focus();
    return;
  }

  skills.push({ name, years: years || 0 });
  save();
  skillNameInput.value = '';
  skillYearsInput.value = '';
  skillNameInput.focus();
});

clearAllBtn.addEventListener('click', () => {
  skills = [];
  save();
});

function removeSkill(index) {
  skills.splice(index, 1);
  save();
}

function save() {
  chrome.storage.local.set({ skills }, render);
}

function render() {
  skillsContainer.innerHTML = '';
  skills.forEach((skill, i) => {
    const chip = document.createElement('span');
    chip.className = 'skill-chip';
    chip.innerHTML = `
      ${esc(skill.name)}
      <span class="years">${skill.years}y</span>
      <span class="remove" data-i="${i}">&times;</span>
    `;
    skillsContainer.appendChild(chip);
  });

  skillsContainer.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', () => removeSkill(parseInt(btn.dataset.i)));
  });

  skillCount.textContent = `(${skills.length})`;
  clearAllBtn.hidden = skills.length === 0;
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

cvFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  cvStatus.textContent = 'Parsing...';

  try {
    const text = await extractTextFromPDF(file);
    const extracted = extractSkillsFromText(text);

    if (extracted.length === 0) {
      cvStatus.textContent = 'No skills found in CV';
      return;
    }
    let added = 0;
    for (const s of extracted) {
      const exists = skills.some(x => x.name.toLowerCase() === s.name.toLowerCase());
      if (!exists) {
        skills.push(s);
        added++;
      }
    }
    save();
    cvStatus.textContent = `Added ${added} skill(s) from CV`;
  } catch (err) {
    cvStatus.textContent = 'Failed to parse PDF';
    console.error(err);
  }
});

async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const bytes = new Uint8Array(reader.result);
        let text = '';

        const decoder = new TextDecoder('utf-8', { fatal: false });
        const raw = decoder.decode(bytes);

        const btBlocks = raw.match(/BT[\s\S]*?ET/g) || [];
        for (const block of btBlocks) {
          const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g) || [];
          for (const m of tjMatches) {
            const inner = m.match(/\(([^)]*)\)/);
            if (inner) text += inner[1] + ' ';
          }
          const tjArrays = block.match(/\[([^\]]*)\]\s*TJ/g) || [];
          for (const m of tjArrays) {
            const strings = m.match(/\(([^)]*)\)/g) || [];
            for (const s of strings) {
              const inner = s.match(/\(([^)]*)\)/);
              if (inner) text += inner[1];
            }
            text += ' ';
          }
        }

        const readable = raw.match(/[\w\s.+#]{3,}/g) || [];
        text += ' ' + readable.join(' ');

        resolve(text);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

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

function extractSkillsFromText(text) {
  const found = [];
  const normalized = text.toLowerCase();

  for (const skill of KNOWN_SKILLS) {
    const pattern = new RegExp('\\b' + escapeRegex(skill) + '\\b', 'i');
    if (pattern.test(text) || normalized.includes(skill.toLowerCase())) {
      const yearsPattern = new RegExp(
        escapeRegex(skill) + '[^.]*?(\\d+)\\+?\\s*(?:years?|yrs?|\\+)',
        'i'
      );
      const yearsMatch = text.match(yearsPattern);
      const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;

      found.push({ name: skill, years });
    }
  }

  return found;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
