import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });

    this.isRaining = false;
    this.clockRadius = 70; // Size of the clock

    this.timeMultiplier = 60; // 1 real second = 1 in-game minute (speed up 60x)
    this.simulatedTime = new Date(); // Start with the current time
  }

  preload() {
    this.load.image("background", "/images/cartoon-room.png");
    this.load.image("mountains-back", "/images/mountains-back.png");
    this.load.image("mountains-mid1", "/images/mountains-mid1.png");
    this.load.image("mountains-mid2", "/images/mountains-mid2.png");
    this.load.image("sun", "/images/moon.png");
    this.load.image("moon", "/images/sun.png");
    this.load.image("sky-day", "/images/sky-day.jpg");
    this.load.image("sky-night", "/images/sky-night.png");
    this.load.image("raindrop", "/images/raindrop.png");

    this.load.gradientTexture;
  }

  create() {
    this.clockCenter = {
      x: this.game.scale.width / 2.9,
      y: this.game.scale.height / 6.2,
    }; // Position of the clock on the wall

    this.lights.enable;

    // Rain particles
    this.rainEmitter = this.add.particles(0, 0, "raindrop", {
      x: { min: 200, max: 400 },
      y: 50,
      quantity: 1,
      lifespan: 2800,
      speedY: { min: 100, max: 150 },
      scale: { start: 0.2, end: 0.4 },
      alpha: { start: 0.8, end: 0.3 },
      blendMode: "NORMAL",
    });
    this.rainEmitter.stop();

    // Create graphics object for sky gradient
    this.skyGraphics = this.add.graphics();
    this.skyColorTop = 0x87ceeb; // Light blue for daytime sky
    this.skyColorBottom = 0x001848; // Dark blue for nighttime sky

    // Add sun and moon
    this.sun = this.add
      .image(this.game.scale.width / 8, this.game.scale.height, "sun")
      .setScale(0.5, 0.5);
    this.moon = this.add
      .image(this.game.scale.width / 2, this.game.scale.height, "moon")
      .setScale(0.5, 0.5);

    // Mountains (update depth)
    this.mountainsBack = this.add
      .image(
        this.game.scale.width / 5.7,
        this.game.scale.height / 2.3,
        "mountains-back"
      )
      .setDisplaySize(this.game.scale.width / 8, this.game.scale.height / 8);

    this.mountainsMid1 = this.add
      .image(
        this.game.scale.width / 5.5,
        this.game.scale.height / 2.2,
        "mountains-mid1"
      )
      .setDisplaySize(this.game.scale.width / 8, this.game.scale.height / 10);

    this.mountainsMid2 = this.add
      .image(
        this.game.scale.width / 5.7,
        this.game.scale.height / 2.1,
        "mountains-mid2"
      )
      .setDisplaySize(this.game.scale.width / 8, this.game.scale.height / 12);

    this.events.on("update", this.updateTimeAndSky, this);

    // Background
    this.background = this.add
      .image(0, 0, "background")
      .setDisplaySize(this.game.scale.width, this.game.scale.height)
      .setOrigin(0, 0);

    // Day/Night Overlay
    this.dayNightOverlay = this.add
      .rectangle(
        0,
        0,
        this.game.scale.width,
        this.game.scale.height,
        0x000000,
        1
      )
      .setOrigin(0, 0);

    this.light = this.add.pointlight(
      this.game.scale.width / 1.67,
      this.game.scale.height / 2.6,
      0xfaf9f3,
      50,
      0.6,
      0.05
    );

    // Debug text
    this.debugText = this.add.text(
      this.game.scale.width / 2.4,
      this.game.scale.height / 2.7,
      "",
      {
        fontSize: "16px",
        fill: "#fff",

        wordWrap: { width: this.game.scale.width / 10 },
      }
    );

    // Create clock
    this.createClock();

    // Update time every second, but scale it
    this.time.addEvent({
      delay: 1000 / this.timeMultiplier, // Adjust delay based on time multiplier
      callback: this.updateSimulatedTime,
      callbackScope: this,
      loop: true,
    });

    this.events.on("update", this.updateTimeAndSky, this);

    // Toggle rain every 10 seconds
    /* this.time.addEvent({
      delay: 10000,
      callback: this.toggleRain,
      callbackScope: this,
      loop: true,
    }); */
  }

  createClock() {
    // Clock hands
    this.hourHand = this.add
      .line(
        this.clockCenter.x,
        this.clockCenter.y,
        0,
        0,
        0,
        -this.clockRadius * 0.4,
        0x5f3a38
      )
      .setLineWidth(4);
    this.minuteHand = this.add
      .line(
        this.clockCenter.x,
        this.clockCenter.y,
        0,
        0,
        0,
        -this.clockRadius * 0.5,
        0x5f3a38
      )
      .setLineWidth(3);
    this.secondHand = this.add
      .line(
        this.clockCenter.x,
        this.clockCenter.y,
        0,
        0,
        0,
        -this.clockRadius * 0.5,
        0x5f3a38
      )
      .setLineWidth(2);
  }

  updateSimulatedTime() {
    // Increment simulated time by one minute per real second
    this.simulatedTime.setMinutes(this.simulatedTime.getMinutes() + 1);
  }

  updateTimeAndSky() {
    const now = this.simulatedTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Update clock hands (same logic as before)
    const hourAngle =
      (((hours % 12) + minutes / 60) * Math.PI) / 6 - Math.PI / 2;
    const minuteAngle = ((minutes + seconds / 60) * Math.PI) / 30 - Math.PI / 2;
    const secondAngle = (seconds * Math.PI) / 30 - Math.PI / 2;

    this.hourHand.setTo(
      0,
      0,
      Math.cos(hourAngle) * this.clockRadius * 0.5,
      Math.sin(hourAngle) * this.clockRadius * 0.5
    );
    this.minuteHand.setTo(
      0,
      0,
      Math.cos(minuteAngle) * this.clockRadius * 0.7,
      Math.sin(minuteAngle) * this.clockRadius * 0.7
    );
    this.secondHand.setTo(
      0,
      0,
      Math.cos(secondAngle) * this.clockRadius * 0.8,
      Math.sin(secondAngle) * this.clockRadius * 0.8
    );

    // Update gradient sky based on time
    const totalMinutes = hours * 60 + minutes;
    const timeOfDay = totalMinutes / 1440; // 1440 minutes in a day

    // Interpolate colors for dawn/dusk transitions
    let skyBlend;
    if (hours >= 22 || hours < 4) {
      // Night (10 PM to 4 AM)
      skyBlend = 1;
    } else if (hours >= 4 && hours < 8) {
      // Sunrise (4 AM to 8 AM)
      skyBlend = Math.max(0, 1 - (totalMinutes - 240) / 240);
    } else if (hours >= 8 && hours < 18) {
      // Day (8 AM to 6 PM)
      skyBlend = 0;
    } else if (hours >= 8 && hours < 22) {
      // Sunset (6 PM to 10 PM)
      skyBlend = Math.min(1, (totalMinutes - 1080) / 240);
    }

    // Update the overlay opacity based on the skyBlend (for night)
    this.dayNightOverlay.setAlpha(skyBlend * 0.6);

    // Interpolate top and bottom colors based on blend
    const topColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      { r: 135, g: 206, b: 235 }, // light blue
      { r: 0, g: 24, b: 72 }, // dark blue
      1,
      skyBlend
    );

    const bottomColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      { r: 176, g: 224, b: 230 }, // light color at the bottom during day
      { r: 0, g: 0, b: 32 }, // dark color at night
      1,
      skyBlend
    );

    // Clear previous frame's graphics
    this.skyGraphics.clear();

    // Fill a rectangle with the interpolated gradient
    this.skyGraphics.fillGradientStyle(
      Phaser.Display.Color.GetColor(topColor.r, topColor.g, topColor.b), // Top left
      Phaser.Display.Color.GetColor(topColor.r, topColor.g, topColor.b), // Top right
      Phaser.Display.Color.GetColor(
        bottomColor.r,
        bottomColor.g,
        bottomColor.b
      ), // Bottom left
      Phaser.Display.Color.GetColor(bottomColor.r, bottomColor.g, bottomColor.b) // Bottom right
    );

    this.skyGraphics.fillRect(
      0,
      0,
      this.game.scale.width,
      this.game.scale.height
    );

    // Update sun and moon positions (same logic as before)
    const angle = timeOfDay * Math.PI * 2 - Math.PI / 2;
    const radius = this.game.scale.height * 0.08;
    const sunX = this.game.scale.width / 5 + Math.cos(angle) * radius;
    const sunY = this.game.scale.height / 2.5 + Math.sin(angle) * radius;
    const moonX =
      this.game.scale.width / 5 + Math.cos(angle + Math.PI) * radius;
    const moonY =
      this.game.scale.height / 2.5 + Math.sin(angle + Math.PI) * radius;

    this.sun.setPosition(sunX, sunY);
    this.moon.setPosition(moonX, moonY);

    // Update mountain colors (same as before)
    const mountainDarkness = 0.5 + skyBlend * 0.5;
    this.mountainsBack.setTint(
      Phaser.Display.Color.GetColor(
        255 * (1 - mountainDarkness),
        255 * (1 - mountainDarkness),
        255 * (1 - mountainDarkness)
      )
    );
    this.mountainsMid1.setTint(
      Phaser.Display.Color.GetColor(
        255 * (1 - mountainDarkness * 0.8),
        255 * (1 - mountainDarkness * 0.8),
        255 * (1 - mountainDarkness * 0.8)
      )
    );
    this.mountainsMid2.setTint(
      Phaser.Display.Color.GetColor(
        255 * (1 - mountainDarkness * 0.6),
        255 * (1 - mountainDarkness * 0.6),
        255 * (1 - mountainDarkness * 0.6)
      )
    );

    // Update debug text
    this.debugText.setText(
      `Time: ${now.toLocaleTimeString()}, Sky Blend: ${skyBlend.toFixed(
        2
      )}, Mountain Darkness: ${mountainDarkness.toFixed(2)}`
    );
  }

  toggleRain() {
    this.isRaining = !this.isRaining;
    if (this.isRaining) {
      this.rainEmitter.start();
    } else {
      this.rainEmitter.stop();
    }
    console.log(`Rain toggled: ${this.isRaining ? "On" : "Off"}`);
  }
}
