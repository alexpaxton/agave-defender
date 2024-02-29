import GameView from "./scripts/game_view";

const preloadedImages = [];
const imageUrls = [
  "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/466ac424-0a07-406e-84cb-4510aef458c8/logo.png",
  "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/07783292-53fc-470b-8b8c-2299bd8e7a01/boss1.png",
  "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/740c1152-1afc-40a3-8d50-8e2cdec8261f/enemy1.pngg",
  "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/48067fa2-57f9-42c8-baed-7207d4b4085c/player1.png",
  "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/c73080e6-fa02-4ce0-a799-d37804d79578/game_background.jpg",
  "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/dfd05171-57ad-4a36-9e7b-7110cdab1baf/explosion1.png",
  "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/a8f574e9-b0db-4cb8-bc91-f626fae49fd6/explosion2.png",
  "https://images.squarespace-cdn.com/content/6316c6e206a7993959718879/f0cc2cc7-6f4f-4ecb-80d9-b13bbd04720c/enemy_projectile.png",
]

imageUrls.forEach((url, i) => {
  preloadedImages[i] = new Image();
  preloadedImages[i].src = url;
})

window.addEventListener("load", () => {
  window.canvas = document.getElementById("game-view");
  window.ctx = canvas.getContext("2d");
  const view = new GameView(canvas, ctx);
  view.start()
});
