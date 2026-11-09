// ==========================================
// Free Fire Glory Bot Simulator v2
// Guild UID + Auto Account + Random Names
// ==========================================

// ---------- State ----------
let selectedCount = 0;
let running = false;
let intervalIds = [];
let totalGlory = 0;
let guildJoined = false;
let currentGuildUid = "";

const bots = [];

// ---------- DOM ----------
const botsGrid = document.getElementById("botsGrid");
const consoleEl = document.getElementById("console");
const totalGloryEl = document.getElementById("totalGlory");
const activeBotsEl = document.getElementById("activeBots");
const guildStatusEl = document.getElementById("guildStatus");
const matchModeEl = document.getElementById("matchMode");
const guildUidInput = document.getElementById("guildUid");
const guildUidHint = document.getElementById("guildUidHint");
const guildUidDisplay = document.getElementById("guildUidDisplay");
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

// ---------- Random Name Generator ----------
// Format: shawon + random 6 digit (e.g., shawon376336)
function generateBotName() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `shawon${digits}`;
}

// ---------- Random FF UID Generator ----------
function generateFFUid() {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

// ---------- Generate 4 Bot Accounts ----------
function initBots() {
  bots.length = 0;
  for (let i = 0; i < 4; i++) {
    bots.push({
      id: i,
      name: generateBotName(),
      ffUid: generateFFUid(),
      active: false,
      glory: 0,
      matches: 0,
      status: "Idle",
      joinedGuild: false,
    });
  }
}

// ---------- Render Bot Cards ----------
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
        <span>🆔 FF UID: <b>${bot.ffUid}</b></span>
        <span>🏆 Glory: <b>${bot.glory}</b></span>
        <span>🎮 Matches: <b>${bot.matches}</b></span>
        <span>🛡️ Guild: <b>${bot.joinedGuild ? "Joined ✅" : "Not Joined"}</b></span>
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
  guildUidDisplay.textContent = currentGuildUid || "—";

  if (selectedCount === 0) matchModeEl.textContent = "—";
  else if (selectedCount === 1) matchModeEl.textContent = "Solo";
  else if (selectedCount === 2) matchModeEl.textContent = "Duo";
  else matchModeEl.textContent = "Squad";
}

// ---------- Validate Guild UID ----------
function validateGuildUid() {
  const val = guildUidInput.value.trim();
  const isValid = /^[0-9]{6,20}$/.test(val);

  guildUidInput.classList.remove("valid", "invalid");
  guildUidHint.classList.remove("ok", "err");

  if (val === "") {
    guildUidHint.textContent = "Guild UID না দিলে bot guild-এ join করতে পারবে না।";
    currentGuildUid = "";
  } else if (isValid) {
    guildUidInput.classList.add("valid");
    guildUidHint.textContent = `✅ Valid Guild UID: ${val}`;
    guildUidHint.classList.add("ok");
    currentGuildUid = val;
  } else {
    guildUidInput.classList.add("invalid");
    guildUidHint.textContent = "❌ Guild UID শুধু ৬-২০ সংখ্যার হতে হবে।";
    guildUidHint.classList.add("err");
    currentGuildUid = "";
  }

  updateStartButton();
  updateScoreboard();
}

// ---------- Update Start Button State ----------
function updateStartButton() {
  const canStart =
    !running &&
    currentGuildUid !== "" &&
    selectedCount > 0;
  startBtn.disabled = !canStart;
}

// ---------- Guild UID Input Listener ----------
guildUidInput.addEventListener("input", validateGuildUid);

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
    const modeName = selectedCount === 1 ? "Solo" : selectedCount === 2 ? "Duo" : "Squad";
    log(`🎯 Selected ${selectedCount} bot(s) — Mode: ${modeName}`, "info");
    updateStartButton();
    updateScoreboard();
  });
});

// ---------- Start Match ----------
startBtn.addEventListener("click", () => {
  if (!currentGuildUid) {
    log("❌ Guild UID ছাড়া bot guild-এ join করতে পারবে না!", "error");
    return;
  }
  if (selectedCount === 0) {
    log("❌ আগে Bot সংখ্যা সিলেক্ট করুন!", "error");
    return;
  }
  if (running) return;

  running = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;

  log("═══════════════════════════════════════════", "glow");
  log(`🚀 Free Fire Glory Push শুরু হচ্ছে — ${selectedCount} Bot(s)`, "success");
  log(`🛡️ Target Guild UID: ${currentGuildUid}`, "warn");
  log("═══════════════════════════════════════════", "glow");

  // Reset active flags
  bots.forEach((b) => {
    b.active = false;
    b.status = "Idle";
    b.joinedGuild = false;
  });

  // Activate selected bots
  for (let i = 0; i < selectedCount; i++) {
    bots[i].active = true;
    bots[i].status = "Booting...";
  }
  renderBots();
  updateScoreboard();

  // Phase 1: Bot account open
  setTimeout(() => {
    bots.filter((b) => b.active).forEach((bot, idx) => {
      setTimeout(() => {
        bot.status = "Opening FF Account";
        log(`📱 [${bot.name}] Free Fire account খোলা হচ্ছে... (UID: ${bot.ffUid})`, "info");
        renderBots();
      }, idx * 400);
    });
  }, 400);

  // Phase 2: Login
  setTimeout(() => {
    bots.filter((b) => b.active).forEach((bot, idx) => {
      setTimeout(() => {
        bot.status = "Logged In";
        log(`🔐 [${bot.name}] Login successful → Account: ${bot.name} (${bot.ffUid})`, "success");
        renderBots();
      }, idx * 400);
    });
  }, 1800);

  // Phase 3: Join Guild
  setTimeout(() => {
    bots.filter((b) => b.active).forEach((bot, idx) => {
      setTimeout(() => {
        bot.status = "Joining Guild...";
        log(`🛡️ [${bot.name}] Guild UID ${currentGuildUid}-এ join request পাঠাচ্ছে...`, "info");
        renderBots();
      }, idx * 450);
    });
  }, 3200);

  // Phase 4: Guild Joined
  setTimeout(() => {
    let count = 0;
    bots.forEach((bot) => {
      if (bot.active && !bot.joinedGuild) {
        bot.joinedGuild = true;
        bot.status = "In Guild";
        count++;
        log(`✅ [${bot.name}] Guild-এ join হয়েছে (Guild UID: ${currentGuildUid})`, "success");
      }
    });
    guildJoined = count > 0;
    renderBots();
    updateScoreboard();
  }, 5000);

  // Phase 5: Team Formation + Battle Royale Start
  setTimeout(() => {
    const activeBots = bots.filter((b) => b.active);
    const modeName = selectedCount === 1 ? "Solo" : selectedCount === 2 ? "Duo" : "Squad";
    log(`👥 Team Formed: ${activeBots.map((b) => b.name).join(", ")}`, "glow");
    log(`🎮 Battle Royale Match Started — Mode: ${modeName}`, "glow");

    activeBots.forEach((b) => {
      b.status = "In Match";
    });
    renderBots();

    // Glory earning loop
    activeBots.forEach((bot) => {
      const id = setInterval(() => {
        if (!running) return;
        const gain = Math.floor(Math.random() * 40) + 10; // 10-50 glory per tick
        bot.glory += gain;
        totalGlory += gain;
        if (Math.random() > 0.6) bot.matches += 1;

        log(
          `🏆 [${bot.name}] +${gain} Glory → নিজের Total: ${bot.glory}`,
          "success"
        );
        log(`📊 Squad Total Glory: ${totalGlory}`, "warn");

        updateScoreboard();
        renderBots();
      }, 2500 + Math.random() * 1500);
      intervalIds.push(id);
    });
  }, 6000);
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
      log(`⏹ [${b.name}] Stopped — Final Glory: ${b.glory}`, "warn");
    }
  });

  log("═══════════════════════════════════════════", "glow");
  log(`🛑 Match Stopped — Total Squad Glory: ${totalGlory}`, "error");
  log("═══════════════════════════════════════════", "glow");

  renderBots();
  updateScoreboard();
  updateStartButton();
});

// ---------- Reset ----------
resetBtn.addEventListener("click", () => {
  if (running) {
    log("⚠️ আগে Stop করুন!", "warn");
    return;
  }
  intervalIds.forEach(clearInterval);
  intervalIds = [];

  initBots();
  totalGlory = 0;
  selectedCount = 0;
  guildJoined = false;

  document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
  guildUidInput.value = "";
  guildUidInput.classList.remove("valid", "invalid");
  guildUidHint.textContent = "Guild UID না দিলে bot guild-এ join করতে পারবে না।";
  guildUidHint.classList.remove("ok", "err");
  currentGuildUid = "";

  renderBots();
  updateScoreboard();
  updateStartButton();

  log("🔄 Reset complete — নতুন random bot name + FF UID generate হয়েছে।", "info");
  bots.forEach((b) => log(`   → ${b.name} (UID: ${b.ffUid})`, "info"));
});

// ---------- Clear Console ----------
clearConsole.addEventListener("click", () => {
  consoleEl.innerHTML = "";
  log("🧹 Console cleared.", "info");
});

// ---------- Initial Load ----------
initBots();
renderBots();
updateScoreboard();
updateStartButton();

log("🔥 Free Fire Glory Bot Simulator v2 loaded.", "success");
log("👉 Step 1: Guild UID দিন (required!)", "info");
log("👉 Step 2: Bot count সিলেক্ট করুন", "info");
log("👉 Step 3: Start Match চাপুন", "info");
log("─── Random Bot Accounts Generated ───", "glow");
bots.forEach((b) => log(`   🤖 ${b.name} (UID: ${b.ffUid})`, "info"));
