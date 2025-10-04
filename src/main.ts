import kaplay, { GameObj } from "kaplay";

// Initialize the game
const k = kaplay({
  width: 800,
  height: 600,
  canvas: document.querySelector("#game") as HTMLCanvasElement,
  background: [100, 149, 237], // Cornflower blue background for road
});

// Game variables
let score = 0;
let gameSpeed = 200;
let isGameOver = false;

let obs_cars = [];

// Scene: game
k.scene("game", () => {
  //TODO: Need to spawn obstacles randomly, with diff speed, from the top
  // A collision animation, maybe rotate the car at 360 degree
  const carWidth = 100;
  const carHeight = 200;
  const roadBarW = 10;
  const roadBarH = 40;
  const vSpace = 10;
  const lane_switch_d = 100;
  const arr_of_obstacles = [];
  // Load sprites with frame slicing
  k.loadSprite("pcar1", "./assets/images/cars/images/pcar1.png");
  k.loadSprite("barrier", "./assets/images/cars/images/barrier.png");
  k.loadSprite("line", "./assets/images/cars/images/line.png");
  k.loadSprite("cone", "./assets/images/cars/images/cone.png");
  k.loadSprite("pcar2", "./assets/images/cars/images/pcar2.png");

  k.loadSprite("car1", "./assets/images/cars/images/cars.png", {
    sliceX: 2, // 3 frames per row horizontally
    sliceY: 1, // 4 rows, totaling 12 frames
  });

  // Add player car (represented as a rectangle)
  const player = k.add([
    k.sprite("car1", { frame: 0 }),
    // k.outline(4, 255, 255, 255), // White outline
    k.pos(k.width() / 2, k.height() - 100),
    k.area(),
    k.body(),
    k.anchor("center"),
    "player_car",
    {
      lane_position: "right",
      life: 3,
    },
  ]);

  player.onClick(() => {
    if (player.lane_position == "right") {
      player.pos.x += lane_switch_d;
      player.lane_position = "left";
    } else {
      player.pos.x -= lane_switch_d;
      player.lane_position = "right";
    }
  });

  // Keep player in screen bounds
  player.onUpdate(() => {
    player.pos.x = k.clamp(
      player.pos.x,
      player.width / 2,
      k.width() - player.width / 2
    );
  });

  // Increase difficulty over time
  k.loop(10, () => {
    if (!isGameOver) {
      gameSpeed += 10;
    }
  });

  //the loop responsible for spawning cars and obstacles
  k.loop(1, () => {
    obs_cars.push();
    const newCar = k.add([
      k.sprite("pcar1"),
      k.body(),
      k.area(),
      k.pos(100, -10),
      k.offscreen({ destroy: true }),
      // k.color(k.rand(50, 255), k.rand(50, 255), k.rand(50, 255)),
      "obs_car",
    ]);

    newCar.vel.y = 200;
    newCar.onClick(() => {
      // newCar.destroy();
    });

    newCar.onUpdate(() => {
      if (newCar.pos.y >= k.canvas.height) {
        newCar.destroy();
      }
    });
    // obs_cars.push(newCar);
    // console.log(obs_cars);
  });

  // Collision detection
  player.onCollide("enemy", () => {
    if (isGameOver) return;
    isGameOver = true;
    k.debug.log("Game Over!");
    k.add([
      k.text("GAME OVER", { size: 60 }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.color(255, 0, 0),
      k.lifespan(2),
    ]);
    k.wait(2, () => {
      k.go("game"); // Restart the game after 2 seconds
    });
  });

  // Score when enemy passes player
  k.onUpdate("enemy", (enemy) => {
    if (enemy.pos.y > k.height && !isGameOver) {
      score++;
    }
  });

  // Display score - using onUpdate to constantly update the text
  const scoreDisplay = k.add([
    k.text(`Score: ${score}`, { size: 24 }),
    k.pos(20, 20),
    k.fixed(), // Fixed position on screen, not affected by camera
  ]);

  k.onUpdate(() => {
    scoreDisplay.text = `Score: ${score}`;
  });

  // Display speed
  const speedDisplay = k.add([
    k.text(`Speed: ${Math.round(gameSpeed)}`, { size: 24 }),
    k.pos(20, 50),
    k.fixed(),
  ]);

  k.onUpdate(() => {
    speedDisplay.text = `Speed: ${Math.round(gameSpeed)}`;
  });

  // Add road markings (center line)
  k.loop(0.2, () => {
    if (isGameOver) return;
    k.add([
      k.rect(10, 30),
      k.color(255, 255, 255),
      k.pos(k.width() / 2, -20),
      k.move(0, gameSpeed * 0.8), // Road markings move slightly slower than cars
      k.offscreen({ destroy: true }),
      k.anchor("center"),
    ]);
  });

  // Add road borders
  k.add([
    k.rect(k.width(), 10),
    k.color(200, 200, 200),
    k.pos(0, 0),
    k.fixed(),
    k.area(),
  ]);

  k.add([
    k.rect(k.width(), 10),
    k.color(200, 200, 200),
    k.pos(0, k.height() - 10),
    k.fixed(),
    k.area(),
  ]);

  // Restart game on spacebar
  k.onKeyPress("space", () => {
    k.go("game");
  });

  // Game title
  k.add([
    k.text("ONE TAP CAR DODGE", { size: 30 }),
    k.pos(k.width() / 2, 20),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.fixed(),
  ]);
});

// Start the game scene
k.go("game");
