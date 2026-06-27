const imageUpload = document.querySelector("#imageUpload");
const loginForm = document.querySelector("#loginForm");
const climberNameInput = document.querySelector("#climberName");
const climberPasswordInput = document.querySelector("#climberPassword");
const loggedOutView = document.querySelector("#loggedOutView");
const loggedInView = document.querySelector("#loggedInView");
const activeClimberName = document.querySelector("#activeClimberName");
const logoutButton = document.querySelector("#logoutButton");
const routeForm = document.querySelector("#routeForm");
const routeNameInput = document.querySelector("#routeName");
const routeGradeInput = document.querySelector("#routeGrade");
const routeColorInput = document.querySelector("#routeColor");
const difficultySelect = document.querySelector("#difficultySelect");
const difficultyInfo = document.querySelector("#difficultyInfo");
const generateButton = document.querySelector("#generateButton");
const premiumButton = document.querySelector("#premiumButton");
const premiumMessage = document.querySelector("#premiumMessage");
const routeList = document.querySelector("#routeList");
const routeCount = document.querySelector("#routeCount");
const canvasWrap = document.querySelector("#canvasWrap");
const emptyState = document.querySelector("#emptyState");
const canvas = document.querySelector("#routeCanvas");
const undoButton = document.querySelector("#undoButton");
const clearButton = document.querySelector("#clearButton");
const installButton = document.querySelector("#installButton");
const downloadButton = document.querySelector("#downloadButton");
const helpText = document.querySelector("#helpText");
const context = canvas.getContext("2d");

let mapImage = null;
let routes = [];
let activeRouteId = null;
let generatedRouteNumber = 1;
let deferredInstallPrompt = null;
let climberName = localStorage.getItem("climbase_climber_name") || "";

const difficultyDetails = {
  easy: {
    title: "Easy route",
    grade: "V0-V2",
    audience: "Beginner friendly",
    description: "Best for new climbers. Bigger moves are avoided and the route stays straighter."
  },
  moderate: {
    title: "Moderate route",
    grade: "V3-V4",
    audience: "For climbers with some practice",
    description: "Adds more side movement and a few trickier holds, but still keeps the route controlled."
  },
  hard: {
    title: "Hard route",
    grade: "V5-V7",
    audience: "For advanced climbers",
    description: "Uses more holds, wider movement, and harder body positions for a stronger challenge."
  }
};

function createRoute(name, grade, color) {
  const route = {
    id: crypto.randomUUID(),
    name,
    grade,
    audience: "",
    description: "",
    color,
    points: []
  };

  routes.push(route);
  activeRouteId = route.id;
  render();
}

function cleanInput(value) {
  return value.trim().replace(/\s+/g, " ");
}

function renderLoginState() {
  const isLoggedIn = Boolean(climberName);

  loggedOutView.hidden = isLoggedIn;
  loggedInView.hidden = !isLoggedIn;
  activeClimberName.textContent = climberName;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getGeneratedGrade(difficulty) {
  return difficultyDetails[difficulty].grade;
}

function getGeneratedColor(difficulty) {
  if (difficulty === "hard") {
    return "#c94735";
  }

  if (difficulty === "moderate") {
    return "#f59e0b";
  }

  return "#1f8a5b";
}

function generateRoutePoints(difficulty) {
  const isHard = difficulty === "hard";
  const isModerate = difficulty === "moderate";
  const pointCount = isHard ? 10 : isModerate ? 8 : 6;
  const startX = randomBetween(0.28, 0.72);
  const points = [];

  for (let index = 0; index < pointCount; index += 1) {
    const progress = index / (pointCount - 1);
    const y = 0.9 - progress * 0.78;
    const waveCount = isHard ? 4.5 : isModerate ? 3 : 1.5;
    const wave = Math.sin(progress * Math.PI * waveCount);
    const drift = isHard ? wave * 0.28 : isModerate ? wave * 0.19 : wave * 0.11;
    const jitter = isHard
      ? randomBetween(-0.1, 0.1)
      : isModerate
        ? randomBetween(-0.07, 0.07)
        : randomBetween(-0.04, 0.04);

    points.push({
      x: clamp(startX + drift + jitter, 0.08, 0.92),
      y: clamp(y + randomBetween(-0.025, 0.025), 0.08, 0.92)
    });
  }

  return points;
}

function generateClimb() {
  if (!mapImage) {
    helpText.textContent = "Upload a climbing wall picture first, then generate a route.";
    return;
  }

  const difficulty = difficultySelect.value;
  const details = difficultyDetails[difficulty];
  const label = details.title.replace(" route", "");
  const route = {
    id: crypto.randomUUID(),
    name: `${label} generated climb ${generatedRouteNumber}`,
    grade: details.grade,
    audience: details.audience,
    description: details.description,
    color: getGeneratedColor(difficulty),
    points: generateRoutePoints(difficulty)
  };

  generatedRouteNumber += 1;
  routes.push(route);
  activeRouteId = route.id;
  helpText.textContent = `${label} route generated. You can click more holds to adjust it.`;
  render();
}

function updateDifficultyInfo() {
  const details = difficultyDetails[difficultySelect.value];

  difficultyInfo.innerHTML = `
    <strong>${escapeHtml(details.title)}</strong>
    <span>${escapeHtml(details.description)}</span>
    <small>${escapeHtml(details.audience)} - Suggested grade: ${escapeHtml(details.grade)}</small>
  `;
}

function getActiveRoute() {
  return routes.find((route) => route.id === activeRouteId) || null;
}

function fitCanvasToImage() {
  const maxWidth = canvasWrap.clientWidth;
  const scale = Math.min(1, maxWidth / mapImage.naturalWidth);

  canvas.width = Math.round(mapImage.naturalWidth * scale);
  canvas.height = Math.round(mapImage.naturalHeight * scale);
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height
  };
}

function drawRoute(route) {
  if (route.points.length === 0) {
    return;
  }

  context.strokeStyle = route.color;
  context.fillStyle = route.color;
  context.lineWidth = 5;
  context.lineCap = "round";
  context.lineJoin = "round";

  context.beginPath();
  route.points.forEach((point, index) => {
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;

    if (index === 0) {
      context.moveTo(x, y);
      return;
    }

    context.lineTo(x, y);
  });
  context.stroke();

  route.points.forEach((point, index) => {
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;

    context.beginPath();
    context.arc(x, y, index === 0 ? 8 : 6, 0, Math.PI * 2);
    context.fill();

    if (index === 0 || index === route.points.length - 1) {
      const holdLabel = index === 0 ? "START" : "TOP";
      context.fillStyle = "#111827";
      context.font = "bold 13px Arial";
      context.fillText(holdLabel, x + 10, y - 10);
      context.fillStyle = route.color;
    }
  });

  const lastPoint = route.points.at(-1);
  const label = route.grade ? `${route.name} - ${route.grade}` : route.name;

  context.fillStyle = "#111827";
  context.font = "bold 15px Arial";
  context.fillText(label, lastPoint.x * canvas.width + 10, lastPoint.y * canvas.height + 12);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (!mapImage) {
    return;
  }

  context.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
  routes.forEach(drawRoute);
}

function renderRouteList() {
  routeCount.textContent = String(routes.length);

  if (routes.length === 0) {
    routeList.innerHTML = '<div class="small-empty">No routes yet.</div>';
    return;
  }

  routeList.innerHTML = routes.map((route) => {
    const isActive = route.id === activeRouteId;
    const pointText = route.points.length === 1 ? "1 point" : `${route.points.length} points`;
    const detailText = route.grade ? `${route.grade} - ${pointText}` : pointText;
    const guideText = route.audience ? `<em>${escapeHtml(route.audience)}</em>` : "";

    return `
      <button class="route-item ${isActive ? "active" : ""}" type="button" data-route-id="${route.id}">
        <span class="color-dot" style="background: ${route.color}"></span>
        <span>
          <strong>${escapeHtml(route.name)}</strong>
          ${guideText}
          <small>${escapeHtml(detailText)}</small>
        </span>
      </button>
    `;
  }).join("");
}

function renderButtons() {
  const activeRoute = getActiveRoute();
  const hasImage = Boolean(mapImage);
  const hasPoints = Boolean(activeRoute && activeRoute.points.length > 0);

  undoButton.disabled = !hasPoints;
  clearButton.disabled = !hasPoints;
  generateButton.disabled = !hasImage;
  downloadButton.disabled = !hasImage;
}

function render() {
  renderRouteList();
  renderButtons();
  draw();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

imageUpload.addEventListener("change", () => {
  const file = imageUpload.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    mapImage = new Image();
    mapImage.addEventListener("load", () => {
      canvasWrap.classList.remove("empty");
      emptyState.hidden = true;
      fitCanvasToImage();

      if (routes.length === 0) {
        createRoute("Route 1", "", routeColorInput.value);
      } else {
        render();
      }

      helpText.textContent = "Click each climbing hold in order. The first hold becomes START and the last hold becomes TOP.";
    });
    mapImage.src = reader.result;
  });

  reader.readAsDataURL(file);
});

routeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = cleanInput(routeNameInput.value);
  const grade = cleanInput(routeGradeInput.value);

  if (!name) {
    return;
  }

  createRoute(name, grade, routeColorInput.value);
  routeNameInput.value = "";
  routeGradeInput.value = "";
  routeNameInput.focus();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = cleanInput(climberNameInput.value);
  const password = climberPasswordInput.value;

  if (!name || !password) {
    return;
  }

  climberName = name;
  localStorage.setItem("climbase_climber_name", climberName);
  localStorage.setItem("climbase_has_local_password", "true");
  climberNameInput.value = "";
  climberPasswordInput.value = "";
  helpText.textContent = `Welcome, ${climberName}. Upload a wall photo or generate a climb.`;
  renderLoginState();
});

logoutButton.addEventListener("click", () => {
  climberName = "";
  localStorage.removeItem("climbase_climber_name");
  localStorage.removeItem("climbase_has_local_password");
  helpText.textContent = "Logged out. You can still use Climbase on this device.";
  renderLoginState();
});

canvas.addEventListener("click", (event) => {
  if (!mapImage) {
    return;
  }

  let activeRoute = getActiveRoute();

  if (!activeRoute) {
    createRoute("Route 1", "", routeColorInput.value);
    activeRoute = getActiveRoute();
  }

  activeRoute.points.push(getCanvasPoint(event));
  render();
});

routeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-route-id]");

  if (!button) {
    return;
  }

  activeRouteId = button.dataset.routeId;
  render();
});

difficultySelect.addEventListener("change", updateDifficultyInfo);

premiumButton.addEventListener("click", () => {
  premiumMessage.textContent = "Premium is coming soon. For now, all current Climbase tools are free to use.";
});

undoButton.addEventListener("click", () => {
  const activeRoute = getActiveRoute();

  if (!activeRoute) {
    return;
  }

  activeRoute.points.pop();
  render();
});

clearButton.addEventListener("click", () => {
  const activeRoute = getActiveRoute();

  if (!activeRoute) {
    return;
  }

  activeRoute.points = [];
  render();
});

generateButton.addEventListener("click", generateClimb);

downloadButton.addEventListener("click", () => {
  const link = document.createElement("a");

  link.download = "climbing-route.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

window.addEventListener("resize", () => {
  if (!mapImage) {
    return;
  }

  fitCanvasToImage();
  draw();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

updateDifficultyInfo();
renderLoginState();
render();
