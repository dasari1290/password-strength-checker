document.addEventListener("DOMContentLoaded", () => {

  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("toggleBtn");
  const generateBtn = document.getElementById("generateBtn");

  const strengthMeter = document.getElementById("strengthMeter");
  const strengthStatus = document.getElementById("strengthStatus");
  const strengthPercentage = document.getElementById("strengthPercentage");
  const charCount = document.getElementById("charCount");
  const complexityStatus = document.getElementById("complexityStatus");
  const checklistList = document.getElementById("checklistList");
  const exposureStatus = document.getElementById("exposureStatus");

  const WEAK_PATTERNS = ["123", "password", "qwerty", "admin", "111"];

  const CHAR_SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    number: "0123456789",
    special: "!@#$%^&*()_+-=[]{}|;:,.<>?"
  };

  /* =============================
     PASSWORD STRENGTH LOGIC
  ============================== */

  function calculatePasswordStrength(password) {
    const analysis = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    if (!password) return { score: 0, analysis };

    let score = 0;
    let types = 0;

    if (password.length < 8) {
      return { score: 10, analysis };
    }

    if (analysis.uppercase) { score += 20; types++; }
    if (analysis.lowercase) { score += 20; types++; }
    if (analysis.number)    { score += 20; types++; }
    if (analysis.special)   { score += 20; types++; }

    score += Math.min(10, new Set(password).size);

    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 5;

    const lower = password.toLowerCase();
    WEAK_PATTERNS.forEach(p => {
      if (lower.includes(p)) score -= 15;
    });

    if (types <= 1) score = Math.min(score, 30);
    if (types === 2) score = Math.min(score, 50);
    if (types === 3) score = Math.min(score, 75);

    return { score: Math.max(0, Math.min(score, 100)), analysis };
  }

  function evaluatePassword() {
    const password = passwordInput.value;
    const { score, analysis } = calculatePasswordStrength(password);

    charCount.textContent = `${password.length} characters`;
    strengthPercentage.textContent = `${score}%`;
    strengthMeter.style.width = `${score}%`;

    let label = "Very Weak";
    let cls = "strength-very-weak";

    if (score >= 80) { label = "Very Strong"; cls = "strength-very-strong"; }
    else if (score >= 60) { label = "Strong"; cls = "strength-strong"; }
    else if (score >= 40) { label = "Medium"; cls = "strength-medium"; }
    else if (score >= 20) { label = "Weak"; cls = "strength-weak"; }

    strengthStatus.textContent = password ? label : "No password entered";
    strengthStatus.className = `strength-label ${cls}`;

    updateChecklist(analysis);
    updateComplexity(analysis);
    exposureStatus.textContent = estimateExposure(password, analysis);
  }

  function updateChecklist(analysis) {
    checklistList.querySelectorAll("li").forEach(li => {
      const key = li.dataset.check;
      const icon = li.querySelector(".check-icon");
      if (analysis[key]) {
        li.classList.add("completed");
        icon.textContent = "✓";
      } else {
        li.classList.remove("completed");
        icon.textContent = "✗";
      }
    });
  }

  function updateComplexity(analysis) {
    const count = Object.values(analysis).filter(Boolean).length;
    complexityStatus.textContent =
      count === 5 ? "Maximum" :
      count >= 4 ? "High" :
      count >= 2 ? "Moderate" : "Low";
  }

  function estimateExposure(password, analysis) {
    let pool = 0;
    if (analysis.lowercase) pool += 26;
    if (analysis.uppercase) pool += 26;
    if (analysis.number) pool += 10;
    if (analysis.special) pool += 32;

    const entropy = password.length * Math.log2(pool || 1);
    const guesses = Math.min(Math.pow(2, entropy), 1e18);
    const seconds = guesses / 1e10;

    if (seconds < 60) return "Seconds";
    if (seconds < 3600) return "Minutes";
    if (seconds < 86400) return "Hours";
    if (seconds < 86400 * 30) return "Days";
    if (seconds < 86400 * 365) return "Years";
    return "Centuries";
  }

  /* =============================
     PASSWORD GENERATOR (FIXED)
  ============================== */

  function generateStrongPassword() {
    const length = 16;
    let chars = [
      CHAR_SETS.upper[Math.floor(Math.random() * CHAR_SETS.upper.length)],
      CHAR_SETS.lower[Math.floor(Math.random() * CHAR_SETS.lower.length)],
      CHAR_SETS.number[Math.floor(Math.random() * CHAR_SETS.number.length)],
      CHAR_SETS.special[Math.floor(Math.random() * CHAR_SETS.special.length)]
    ];

    const all =
      CHAR_SETS.upper + CHAR_SETS.lower + CHAR_SETS.number + CHAR_SETS.special;

    while (chars.length < length) {
      chars.push(all[Math.floor(Math.random() * all.length)]);
    }

    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join("");
  }

  function handleGeneratePassword() {
    passwordInput.value = generateStrongPassword();
    passwordInput.type = "text";
    toggleBtn.querySelector(".toggle-icon").textContent = "🙈";
    evaluatePassword();
    passwordInput.focus();
  }

  /* =============================
     EVENTS
  ============================== */

  passwordInput.addEventListener("input", evaluatePassword);
  toggleBtn.addEventListener("click", () => {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  });
  generateBtn.addEventListener("click", handleGeneratePassword);

  evaluatePassword();
});
