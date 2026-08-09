(() => {
  const arena = document.querySelector("#arena");
  const ship = document.querySelector("#ship");
  const overlay = document.querySelector("#overlay");
  const message = document.querySelector("#message");
  const scoreNode = document.querySelector("#score");
  const bestNode = document.querySelector("#best");
  const livesNode = document.querySelector("#lives");
  const startButton = document.querySelector("#start");
  const leftButton = document.querySelector("#left");
  const rightButton = document.querySelector("#right");

  let running = false;
  let score = 0;
  let lives = 3;
  let playerX = 50;
  let nextDropAt = 0;
  let lastFrame = 0;
  let drops = [];
  let best = Number(localStorage.getItem("vova-star-best") || 0);
  bestNode.textContent = String(best);

  function move(delta) {
    playerX = Math.max(8, Math.min(92, playerX + delta));
    ship.style.left = `${playerX}%`;
  }

  function updateStats() {
    scoreNode.textContent = String(score);
    livesNode.textContent = "♥".repeat(lives) + "♡".repeat(3 - lives);
    livesNode.setAttribute("aria-label", `${lives} жизни`);
  }

  function removeDrop(drop) {
    drop.element.remove();
    drops = drops.filter((item) => item !== drop);
  }

  function spawnDrop() {
    const kind = Math.random() < 0.72 ? "star" : "rock";
    const element = document.createElement("div");
    element.className = `drop ${kind}`;
    element.textContent = kind === "star" ? "★" : "☄";
    element.setAttribute("aria-hidden", "true");
    arena.append(element);
    drops.push({
      element,
      kind,
      x: 7 + Math.random() * 86,
      y: -8,
      speed: 20 + Math.random() * 16,
      spin: Math.random() * 150 - 75,
    });
  }

  function finish() {
    running = false;
    best = Math.max(best, score);
    localStorage.setItem("vova-star-best", String(best));
    bestNode.textContent = String(best);
    message.textContent = `Отличный полёт, Вова! Твой счёт: ${score}`;
    startButton.innerHTML = "Ещё раз <span>→</span>";
    overlay.classList.remove("hidden");
  }

  function frame(time) {
    if (!running) return;
    const seconds = Math.min((time - lastFrame) / 1000, 0.05);
    lastFrame = time;
    if (time >= nextDropAt) {
      spawnDrop();
      nextDropAt = time + Math.max(330, 700 - score * 6);
    }
    [...drops].forEach((drop) => {
      drop.y += drop.speed * seconds;
      drop.element.style.left = `${drop.x}%`;
      drop.element.style.top = `${drop.y}%`;
      drop.element.style.transform = `translate(-50%,-50%) rotate(${drop.y * drop.spin / 20}deg)`;
      if (drop.y > 78 && drop.y < 94 && Math.abs(drop.x - playerX) < 9) {
        if (drop.kind === "star") score += 1;
        else lives = Math.max(0, lives - 1);
        updateStats();
        removeDrop(drop);
      } else if (drop.y > 108) {
        removeDrop(drop);
      }
    });
    if (lives === 0) finish();
    else requestAnimationFrame(frame);
  }

  function start() {
    drops.forEach((drop) => drop.element.remove());
    drops = [];
    score = 0;
    lives = 3;
    updateStats();
    overlay.classList.add("hidden");
    running = true;
    lastFrame = performance.now();
    nextDropAt = lastFrame + 350;
    requestAnimationFrame(frame);
  }

  function bindHold(button, delta) {
    let timer;
    const begin = (event) => {
      event.preventDefault();
      move(delta);
      timer = window.setInterval(() => move(delta), 75);
    };
    const end = () => window.clearInterval(timer);
    button.addEventListener("pointerdown", begin);
    button.addEventListener("pointerup", end);
    button.addEventListener("pointercancel", end);
    button.addEventListener("pointerleave", end);
  }

  document.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-6);
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(6);
    if ((event.key === " " || event.key === "Enter") && !running) start();
  });
  bindHold(leftButton, -5);
  bindHold(rightButton, 5);
  startButton.addEventListener("click", start);
})();

