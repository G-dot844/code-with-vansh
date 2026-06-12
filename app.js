const form = document.querySelector("#workerForm");
const nameInput = document.querySelector("#workerName");
const message = document.querySelector("#message");
const workerList = document.querySelector("#workerList");
const onDutyCount = document.querySelector("#onDutyCount");
const totalCount = document.querySelector("#totalCount");
const todayText = document.querySelector("#todayText");

let nextAction = "in";

function cleanName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function formatTime(dateValue) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dateValue));
}

async function loadWorkers() {
  const response = await fetch("/api/workers");
  const data = await response.json();
  render(data.workers);
}

async function setWorkerStatus(name, action) {
  const response = await fetch("/api/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, action })
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not update worker.");
  }

  render(data.workers);
}

function render(workers) {
  const onDuty = workers.filter((worker) => worker.onDuty).length;

  onDutyCount.textContent = String(onDuty);
  totalCount.textContent = String(workers.length);

  if (workers.length === 0) {
    workerList.innerHTML = '<div class="empty-state">No workers have checked in yet.</div>';
    return;
  }

  workerList.innerHTML = workers.map((worker) => {
    const status = worker.onDuty ? "On duty" : "Off duty";
    const cardClass = worker.onDuty ? "worker-card on" : "worker-card";
    const badgeClass = worker.onDuty ? "badge on" : "badge";

    return `
      <article class="${cardClass}">
        <div>
          <strong>${escapeHtml(worker.name)}</strong>
          <small>Last update: ${formatTime(worker.lastChanged)}</small>
        </div>
        <span class="${badgeClass}">${status}</span>
      </article>
    `;
  }).join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("click", (event) => {
  if (event.target.matches("button[data-action]")) {
    nextAction = event.target.dataset.action;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = cleanName(nameInput.value);

  if (!name) {
    message.textContent = "Please enter a worker name.";
    return;
  }

  try {
    await setWorkerStatus(name, nextAction);
    message.textContent = `${name} is now ${nextAction === "in" ? "on duty" : "off duty"}.`;
    nameInput.value = "";
    nameInput.focus();
  } catch (error) {
    message.textContent = error.message;
  }
});

todayText.textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  day: "2-digit",
  month: "short"
}).format(new Date());

loadWorkers();
