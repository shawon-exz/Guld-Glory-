// ==========================================
// Free Fire Glory Bot Simulator
// ==========================================

const BOT_NAMES = ["Alpha", "Bravo", "Charlie", "Delta"];

let selectedCount = 0;
let running = false;
let intervalIds = [];
let totalGlory = 0;
let guildJoined = false;

const bots = BOT_NAMES.map((name, i) => ({
  id: i,
  name,
  active: false,
  glory: 0,
  matches: 0,
  status: "Idle",
  joinedGuild: false,
}));

// ---------- DOM ----------
const botsGrid = document.getElementById("botsGrid");
const consoleEl = document.getElementById("console");
const totalGloryEl = document.getElementById("totalGlory");
const activeBotsEl = document.getElementById("activeBots");
const guildStatusEl = document.getElementById("guildStatus");
const matchModeEl = document.getElementById("matchMode");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const clearConsole = document.getElementById("clearConsole");

// ---------- Console Logger ----------
function log(msg, type = "info") {
  const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
  const line = document.createElement("div");
  line.className = `log-line ${type}`;
  line.innerHTML = `<span class="log-time">[${time}]</span> ${msg}`;
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

// ---------- Render Bot Cards ----------
function renderBots() {
  botsGrid.innerHTML = "";
  bots.forEach((bot) => {
    const card = document.createElement("div");
    card.className = `bot-card ${bot.active ? "active" : ""}`;
    card.innerHTML = `
      <div class="bot-header">
        <span class="bot-name">🤖 Bot ${bot.name}</span>
        <span class="bot-status">${bot.status}</span>
      </div>
      <div class="bot-stats">
        <span>🏆 Glory: <b>${bot.glory}</b></span>
        <span>🎮 Matches: <b>${bot.matches}</b></span>
        <span>🛡️ Guild: <b>${bot.joinedGuild ? "Joined" : "No"}</b></span>
      </div>
    `;
    botsGrid.appendChild(card);
  });
}

// ---------- Update Scoreboard ----------
function updateScoreboard() {
  totalGloryEl.textContent = totalGlory;
  activeBotsEl.textContent = bots.filter((b) => b.active).length;
  guildStatusEl.textContent = guildJoined ? "Joined ✅" : "Not Joined";
  guildStatusEl.style.color = guildJoined ? "var(--accent-green)" : "var(--accent-blue)";

  if (selectedCount === 0) matchModeEl.textContent = "—";
  else if (selectedCount === 1) matchModeEl.textContent = "Solo";
  else if (selectedCount === 2) matchModeEl.textContent = "Duo";
  else matchModeEl.textContent = "Squad";
}

// ---------- Mode Selection ----------
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (running) {
      log("⚠️ Match চলছে, আগে Stop করুন!", "warn");
      return;
    }
    document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCount = parseInt(btn.dataset.count);
    log(`🎯 Selected ${selectedCount} bot(s) — Mode: ${selectedCount === 1 ? "Solo" : selectedCount === 2 ? "Duo" : "Squad"}`, "info");
    updateScoreboard();
  });
});

// ---------- Start Match ----------
startBtn.addEventListener("click", () => {
  if (selectedCount === 0) {
    log("❌ আগে Bot সংখ্যা সিলেক্ট করুন!", "error");
    return;
  }
  if (running) return;

  running = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;

  log("═══════════════════════════════════════", "glow");
  log(`🚀 Starting Free Fire Glory Push with ${selectedCount} Bot(s)`, "success");
  log("═══════════════════════════════════════", "glow");

  // Activate selected bots
  bots.forEach((b) => {
    b.active = false;
    b.status = "Idle";
  });
  for (let i = 0; i < selectedCount; i++) {
    bots[i].active = true;
    bots[i].status = "Connecting...";
  }
  renderBots();

  // Step 1: Connect
  setTimeout(() => {
    bots.forEach((b) => {
      if (b.active) {
        b.status = "Joining Guild...";
        log(`🤖 Bot ${b.name} → Connecting to Free Fire server...`, "info");
      }
    });
    renderBots();
  }, 500);

  // Step 2: Guild Join
  setTimeout(() => {
    bots.forEach((b) => {
      if (b.active && !b.joinedGuild) {
        b.joinedGuild = true;
        b.status = "In Guild";
        log(`🛡️ Bot ${b.name} → Joined Guild [Glory Push]`, "success");
      }
    });
    guildJoined = true;
    updateScoreboard();
    renderBots();
  }, 1500);

  // Step 3: Start Match
  setTimeout(() => {
    log(`🎮 Battle Royale Match Started — ${selectedCount === 1 ? "Solo" : selectedCount === 2 ? "Duo Squad" : "Squad"}: ${bots.filter(b => b.active).map(b => b.name).join(", ")}`, "glow");
    bots.forEach((b) => {
      if (b.active) b.status = "In Match";
    });
    renderBots();

    // Glory earning loop
    bots.forEach((bot) => {
      if (!bot.active) return;
      const id = setInterval(() => {
        if (!running) return;
        const gain = Math.floor(Math.random() * 40) + 10; // 10-50 glory per tick
        bot.glory += gain;
        totalGlory += gain;
        bot.matches += Math.random() > 0.7 ? 1 : 0;

        log(`🏆 Bot ${bot.name} earned +${gain} Glory (Total: ${bot.glory})`, "success");
        log(`📊 Squad Total Glory: ${totalGlory}`, "warn");

        updateScoreboard();
        renderBots();
      }, 2500 + Math.random() * 1500);
      intervalIds.push(id);
    });
  }, 3000);
});

// ---------- Stop ----------
stopBtn.addEventListener("click", () => {
  running = false;
  intervalIds.forEach(clearInterval);
  intervalIds = [];
  startBtn.disabled = false;
  stopBtn.disabled = true;

  bots.forEach((b) => {
    if (b.active) {
      b.status = "Stopped";
      log(`⏹ Bot ${b.name} stopped. Final Glory: ${b.glory}`, "warn");
    }
  });
  log("═══════════════════════════════════════", "glow");
  log(`🛑 Match Stopped — Total Squad Glory: ${totalGlory}`, "error");
  log("═══════════════════════════════════════", "glow");
  renderBots();
  updateScoreboard();
});

// ---------- Reset ----------
resetBtn.addEventListener("click", () => {
  if (running) {
    log("⚠️ আগে Stop করুন!", "warn");
    return;
  }
  bots.forEach((b) => {
    b.active = false;
    b.glory = 0;
    b.matches = 0;
    b.status = "Idle";
    b.joinedGuild = false;
  });
  totalGlory = 0;
  selectedCount = 0;
  guildJoined = false;
  document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
  renderBots();
  updateScoreboard();
  log("🔄 All bots and stats reset.", "info");
});

// ---------- Clear Console ----------
clearConsole.addEventListener("click", () => {
  consoleEl.innerHTML = "";
  log("🧹 Console cleared.", "info");
});

// ---------- Initial ----------
renderBots();
updateScoreboard();
log("🔥 Free Fire Glory Bot Simulator loaded.", "success");
log("👉 Select bot count → Click Start Match", "info");
