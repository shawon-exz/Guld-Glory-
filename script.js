// ================================================================
// XH SHAWON - FF Glory Bot Engine (Fixed & Realistic)
// ================================================================

// --- Auth Credentials ---
const AUTH_USER = "XH-SHAWON";
const AUTH_PASS = "XH-GLORY";

// --- DOM Elements ---
const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");

const botsGrid = document.getElementById("botsGrid");
const consoleEl = document.getElementById("console");
const totalGloryEl = document.getElementById("totalGlory");
const activeBotsEl = document.getElementById("activeBots");
const guildStatusEl = document.getElementById("guildStatus");
const guildUidInput = document.getElementById("guildUid");
const guildUidHint = document.getElementById("guildUidHint");
const guildUidDisplay = document.getElementById("guildUidDisplay");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const clearConsole = document.getElementById("clearConsole");

// --- State ---
let selectedCount = 0;
let running = false;
let timers = [];
let totalGlory = 0;
let currentGuildUid = "";
let bots = [];

// ================================================================
// 🔐 LOGIN SYSTEM
// ================================================================
loginBtn.addEventListener("click", () => {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === AUTH_USER && pass === AUTH_PASS) {
    loginScreen.style.display = "none";
    mainApp.style.display = "block";
    loginError.textContent = "";
    init();
  } else {
    loginError.textContent = "❌ Invalid Username or Password!";
  }
});

logoutBtn.addEventListener("click", () => {
  if (running) stopBots(); // Stop before logout
  mainApp.style.display = "none";
  loginScreen.style.display = "flex";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
});

// ================================================================
// 🛠️ UTILITIES & INIT
// ================================================================
function log(msg, type = "info") {
  const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
  const line = document.createElement("div");
  line.className = `log-line ${type}`;
  line.innerHTML = `<span class="log-time">[${time}]</span> ${msg}`;
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function schedule(fn, ms) {
  const id = setTimeout(fn, ms);
  timers.push({ type: "timeout", id });
  return id;
}

function repeat(fn, ms) {
  const id = setInterval(fn, ms);
  timers.push({ type: "interval", id });
  return id;
}

function clearAllTimers() {
  timers.forEach((t) => {
    t.type === "timeout" ? clearTimeout(t.id) : clearInterval(t.id);
  });
  timers = [];
}

// Realistic Account Name: Shawon_glory + 4 Random Digits
function randomBotName() {
  return `Shawon_glory${Math.floor(1000 + Math.random() * 9000)}`;
}
function randomFFUid() {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

function initBots() {
  bots = [];
  for (let i = 0; i < 4; i++) {
    bots.push({
      id: i,
      name: randomBotName(),
      ffUid: randomFFUid(),
      active: false,
      glory: 0,
      kills: 0,
      status: "Offline",
      joinedGuild: false,
    });
  }
}

function init() {
  clearAllTimers();
  initBots();
  totalGlory = 0;
  selectedCount = 0;
  running = false;
  currentGuildUid = "";
  guildUidInput.value = "";
  guildUidInput.classList.remove("valid", "invalid");
  guildUidHint.textContent = "Guild UID is required for bots to join.";
  guildUidHint.className = "hint";
  document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
  startBtn.disabled = true;
  stopBtn.disabled = true;
  
  renderBots();
  updateScoreboard();
  
  consoleEl.innerHTML = "";
  log("🔥 XH SHAWON FF Glory Bot Loaded.", "success");
  log("👉 Step 1: Enter Guild UID", "info");
  log("👉 Step 2: Select Bot Count", "info");
  log("👉 Step 3: Click Start Bots", "info");
}

// ================================================================
// 🎨 RENDER & UI UPDATES
// ================================================================
function renderBots() {
  botsGrid.innerHTML = "";
  bots.forEach((bot) => {
    const card = document.createElement("div");
    card.className = `bot-card ${bot.active ? "active" : ""}`;
    card.innerHTML = `
      <div class="bot-header">
        <span class="bot-name">🤖 ${bot.name}</span>
        <span class="bot-status">${bot.status}</span>
      </div>
      <div class="bot-stats">
        <span>🆔 UID: <b>${bot.ffUid}</b></span>
        <span>🏆 Glory: <b>${bot.glory}</b></span>
        <span>💀 Kills: <b>${bot.kills}</b></span>
        <span>🛡️ Guild: <b>${bot.joinedGuild ? "Joined ✅" : "No"}</b></span>
      </div>
    `;
    botsGrid.appendChild(card);
  });
}

function updateScoreboard() {
  totalGloryEl.textContent = totalGlory;
  activeBotsEl.textContent = bots.filter((b) => b.active).length;
  guildStatusEl.textContent = currentGuildUid && bots.some(b => b.joinedGuild) ? "Connected ✅" : "Not Connected";
  guildStatusEl.style.color = (currentGuildUid && bots.some(b => b.joinedGuild)) ? "var(--accent-green)" : "var(--accent-blue)";
  guildUidDisplay.textContent = currentGuildUid || "—";
}

// ================================================================
// ⚙️ GUILD UID VALIDATION
// ================================================================
guildUidInput.addEventListener("input", () => {
  const val = guildUidInput.value.trim();
  const ok = /^[0-9]{6,20}$/.test(val);

  guildUidInput.classList.remove("valid", "invalid");
  guildUidHint.classList.remove("ok", "err");

  if (!val) {
    guildUidHint.textContent = "Guild UID is required for bots to join.";
    currentGuildUid = "";
  } else if (ok) {
    guildUidInput.classList.add("valid");
    guildUidHint.textContent = `✅ Valid Guild UID: ${val}`;
    guildUidHint.classList.add("ok");
    currentGuildUid = val;
  } else {
    guildUidInput.classList.add("invalid");
    guildUidHint.textContent = "❌ Must be 6-20 digits.";
    guildUidHint.classList.add("err");
    currentGuildUid = "";
  }
  updateStartBtn();
});

// ================================================================
// 🎯 MODE SELECTION
// ================================================================
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (running) return log("⚠️ Stop bots before changing mode!", "warn");
    document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCount = parseInt(btn.dataset.count);
    log(`🎯 ${selectedCount} Bot(s) selected.`, "info");
    updateStartBtn();
  });
});

function updateStartBtn() {
  startBtn.disabled = running || !currentGuildUid || selectedCount === 0;
}

// ================================================================
// 🚀 MAIN EXECUTION FLOW
// ================================================================
startBtn.addEventListener("click", () => {
  if (!currentGuildUid || selectedCount === 0) return;
  
  running = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  totalGlory = 0;
  
  bots.forEach(b => {
    b.active = false;
    b.joinedGuild = false;
    b.glory = 0;
    b.kills = 0;
    b.status = "Offline";
  });

  log("==========================================", "glow");
  log(`🚀 Starting Bot Engine — Target Guild: ${currentGuildUid}`, "success");
  log("==========================================", "glow");

  for (let i = 0; i < selectedCount; i++) bots[i].active = true;
  renderBots();
  updateScoreboard();

  const activeBots = bots.filter(b => b.active);

  // STEP 1: Open FF Account
  activeBots.forEach((bot, i) => {
    schedule(() => {
      bot.status = "Opening Account";
      log(`📱 [${bot.name}] Opening Free Fire Official Account... (UID: ${bot.ffUid})`, "info");
      renderBots();
    }, 500 + i * 600);
  });

  // STEP 2: Login
  activeBots.forEach((bot, i) => {
    schedule(() => {
      bot.status = "Logging In";
      log(`🔐 [${bot.name}] Authenticating with FF Server...`, "info");
      renderBots();
    }, 1500 + i * 600);
  });

  activeBots.forEach((bot, i) => {
    schedule(() => {
      bot.status = "Logged In";
      log(`✅ [${bot.name}] Successfully Logged In.`, "success");
      renderBots();
    }, 2200 + i * 600);
  });

  // STEP 3: Search Guild
  activeBots.forEach((bot, i) => {
    schedule(() => {
      bot.status = "Searching Guild";
      log(`🔍 [${bot.name}] Searching for Guild UID: ${currentGuildUid}...`, "info");
      renderBots();
    }, 3000 + i * 600);
  });

  // STEP 4: Send Request
  activeBots.forEach((bot, i) => {
    schedule(() => {
      bot.status = "Request Sent";
      log(`📨 [${bot.name}] Join request sent to Guild ${currentGuildUid}.`, "warn");
      renderBots();
    }, 3600 + i * 600);
  });

  // STEP 5: Admin Accept
  schedule(() => {
    log(`⏳ Waiting for Guild Admin approval...`, "warn");
  }, 4200);

  activeBots.forEach((bot, i) => {
    schedule(() => {
      bot.joinedGuild = true;
      bot.status = "In Guild";
      log(`🎉 [${bot.name}] Guild accepted! Successfully joined.`, "success");
      renderBots();
      updateScoreboard();
    }, 5000 + i * 700);
  });

  // STEP 6: Start Match
  const matchStartDelay = 5000 + activeBots.length * 700 + 500;
  schedule(() => {
    log(`🛡️ All bots successfully joined the Guild.`, "success");
    log(`🎮 Starting Battle Royale Match...`, "glow");
    startMatchLoop(activeBots);
  }, matchStartDelay);
});

// ================================================================
// 🎮 MATCH LOOP & GLORY
// ================================================================
function startMatchLoop(activeBots) {
  if (!running) return;

  const matchDuration = 60000; // 60 seconds per match
  const startTime = Date.now();

  activeBots.forEach((b) => {
    b.status = "In Match";
    b.matches = (b.matches || 0) + 1;
  });
  renderBots();

  log(`📥 Drop zone selected → Pochinki`, "info");
  log(`🎒 Looting started... Match is live!`, "info");

  // Kill & Glory Loop
  const killInterval = repeat(() => {
    if (!running) return;
    const elapsed = Date.now() - startTime;
    if (elapsed > matchDuration) return;

    const bot = activeBots[Math.floor(Math.random() * activeBots.length)];
    const kills = Math.floor(Math.random() * 2) + 1; // 1-2 kills
    const gloryPerKill = Math.floor(Math.random() * 6) + 5; // 5-10 glory
    const glory = kills * gloryPerKill;

    bot.kills += kills;
    bot.glory += glory;
    totalGlory += glory;

    log(`💀 [${bot.name}] ${kills} kill → +${glory} Glory (Total: ${bot.glory})`, "success");
    log(`📊 Squad Glory: ${totalGlory}`, "warn");

    renderBots();
    updateScoreboard();
  }, 8000 + Math.random() * 4000);

  timers.push({ type: "interval", id: killInterval });

  // Match End
  schedule(() => {
    if (!running) return;
    
    const winner = activeBots[Math.floor(Math.random() * activeBots.length)];
    const bonus = Math.floor(Math.random() * 20) + 15;
    winner.glory += bonus;
    totalGlory += bonus;

    log(`🏁 Match Ended — 🏆 Winner: ${winner.name}`, "glow");
    log(`💰 Booyah Bonus: +${bonus} Glory`, "success");
    log(`📊 Squad Total Glory: ${totalGlory}`, "warn");
    
    renderBots();
    updateScoreboard();

    // Restart Match
    schedule(() => {
      if (!running) return;
      log(`🔄 Starting next Match...`, "glow");
      startMatchLoop(activeBots);
    }, 5000);
  }, matchDuration);
}

// ================================================================
// 🛑 STOP & RESET
// ================================================================
function stopBots() {
  running = false;
  clearAllTimers();
  startBtn.disabled = false;
  stopBtn.disabled = true;

  bots.forEach((b) => {
    if (b.active) {
      b.status = "Stopped";
      log(`⏹ [${b.name}] Stopped. Final Glory: ${b.glory}`, "warn");
    }
  });

  log("==========================================", "glow");
  log(`🛑 Bot Engine Stopped. Total Glory: ${totalGlory}`, "error");
  log("==========================================", "glow");

  renderBots();
  updateScoreboard();
  updateStartBtn();
}

stopBtn.addEventListener("click", stopBots);

resetBtn.addEventListener("click", () => {
  if (running) return log("⚠️ Stop bots before resetting!", "warn");
  init();
  log("🔄 System Reset. New random accounts generated.", "info");
});

clearConsole.addEventListener("click", () => {
  consoleEl.innerHTML = "";
  log("🧹 Console cleared.", "info");
});
