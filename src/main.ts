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
let isGameOver = false;

let obs_cars = [];

// Scene: game
k.scene("game", () => {
  //TODO: Need to spawn obstacles randomly, with diff speed, from the top
  // A collision animation, maybe rotate the car at 360 degree
  //Draw road lines in the middle of the road; they will not be used for collision detection
  //score system, difficulty increase by time
  let game_speed = 200;
  const carWidth = 100;
  const player_initial_height = 80;
  const obj_scale_factor = 0.8;
  const carHeight = 200;
  const roadBarW = 10;
  const roadBarH = 40;
  const vSpace = 10;
  const arr_of_obstacles = [];
  const lane_pos = {
    left: { x: k.canvas.width / 2 - 100, y: 0 },
    right: { x: k.canvas.width / 2 + 100, y: 0 },
  };
  const lane_switch_d = Math.abs(lane_pos.right.x - lane_pos.left.x);
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

  //debug
  //left lane line
  k.add([
    k.rect(3, k.height()),
    k.color(200, 200, 200),
    k.pos(lane_pos.left.x, lane_pos.left.y),
    k.fixed(),
    k.area(),
  ]);
  //right lane line
  k.add([
    k.rect(3, k.height()),
    k.color(200, 200, 200),
    k.pos(lane_pos.right.x, lane_pos.right.y),
    k.fixed(),
    k.area(),
  ]);
  //

  const obstacles = [
    {
      name: "police_car_1",
      type: "obstacle",
      initial_vel: { x: 0, y: 200 },
      sprite: "pcar1",
      initial_lane: "left",
      scale: { x: obj_scale_factor, y: obj_scale_factor },
    },
    {
      name: "police_car_2",
      type: "obstacle",
      initial_vel: { x: 0, y: 200 },
      sprite: "pcar2",
      initial_lane: "right",
      scale: { x: obj_scale_factor, y: obj_scale_factor },
    },
    {
      name: "cone",
      type: "obstacle",
      initial_vel: { x: 0, y: 200 },
      sprite: "cone",
      initial_lane: "right",
      scale: { x: obj_scale_factor, y: obj_scale_factor },
    },
    {
      name: "barrier",
      type: "obstacle",
      initial_vel: { x: 0, y: 200 },
      sprite: "barrier",
      initial_lane: "right",
      scale: { x: obj_scale_factor, y: obj_scale_factor },
    },
  ];
  const choose_lane = () => {
    const r_lane = +k.rand(0, 1).toFixed(0);
    if (r_lane == 0) {
      return lane_pos.left;
    } else {
      return lane_pos.right;
    }
  };
  // Add player car (represented as a rectangle)
  const player_initial_lane = choose_lane();
  const player = k.add([
    k.sprite("car1", { frame: 0 }),
    // k.outline(4, 255, 255, 255), // White outline
    k.pos(lane_pos.right.x + 3, k.height() - player_initial_height),
    k.area(),
    k.body(),
    k.rotate(),
    k.scale(obj_scale_factor),
    k.anchor("center"),
    "player_car",
    {
      lane_position: "right",
      life: 3,
    },
  ]);

  player.onClick(() => {
    if (player.lane_position == "right") {
      player.pos.x -= lane_switch_d;
      player.lane_position = "left";
    } else {
      player.pos.x += lane_switch_d;
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
  k.loop(1, () => {
    if (!isGameOver) {
      game_speed += 10;
    }
    console.log("Hello");
  });
  //function to choose a random lane

  // const sample = k.add([
  //   k.rect(100, 100),
  //   k.color("#000fff"),
  //   k.body(),
  //   k.area(),
  //   k.pos(200, 200),
  // ]);

  //the loop responsible for spawning cars and obstacles
  k.loop(k.rand(0.5, 3), () => {
    //randomly select 1 obstacle to spawn;
    console.log(obstacles); //debug purpose
    const r_i = +k.rand(0, obstacles.length - 1).toFixed(0);
    const rand_obs = obstacles[r_i];
    const rand_lane = choose_lane();
    const new_obs = k.add([
      k.sprite(rand_obs.sprite),
      k.body(),
      k.area(),
      k.scale(obj_scale_factor),
      k.anchor("center"),
      k.pos(rand_lane.x, rand_lane.y), //replace with const initial_spawn_pos
      k.offscreen({ destroy: true }),
      rand_obs.type,
      {
        name: rand_obs.name,
      },
    ]);

    new_obs.pos.x = rand_lane.x;
    new_obs.vel.y = rand_obs.initial_vel.y;
    console.log(new_obs);
  });

  //drawing road middle lines
  const lineSpacing = 60;
  const roadLines: any[] = [];
  for (let i = 0; i < Math.ceil(k.height() / lineSpacing) + 2; i++) {
    const l = k.add([
      k.sprite("line"),
      k.pos(k.canvas.width / 2, i * lineSpacing),
      k.scale(0.5),
      k.z(-100),
      k.anchor("center"),
      k.offscreen({ destroy: true }),
      "line",
    ]);
    l.onUpdate(() => l.move(0, 100));
    roadLines.push(l);
  }

  k.onUpdate(() => {
    for (const line of roadLines) {
      if (line.pos.y > k.height() + lineSpacing / 2) {
        line.pos.y = -lineSpacing;
      }
    }
  });

  // Collision detection
  player.onCollide("obstacle", () => {
    if (isGameOver) return;
    isGameOver = true;
    k.debug.log("Game Over!");
    const spinTime = 1;
    const totalRot = 360;
    const startRot = player.angle;
    k.tween(
      startRot,
      startRot + totalRot,
      spinTime,
      (v) => (player.angle = v),
      k.easings.easeOutBounce
    );
    k.add([
      k.text("GAME OVER", { size: 60 }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.color(255, 0, 0),
      k.opacity(1),
      k.lifespan(2),
    ]);
    k.wait(spinTime + 1.5, () => {
      k.go("game"); // Restart the game after 2 seconds
    });
  });

  // Score when obstacle passes player
  k.onUpdate("obstacle", (obstacle) => {
    if (obstacle.pos.y > k.height && !isGameOver) {
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
    k.text(`Speed: ${Math.round(game_speed)}`, { size: 24 }),
    k.pos(20, 50),
    k.fixed(),
  ]);

  k.onUpdate(() => {
    speedDisplay.text = `Speed: ${Math.round(game_speed)}`;
  });

  // Restart game on spacebar
  // k.onKeyPress("space", () => {
  //   k.go("game");
  // });

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
