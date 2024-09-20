import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });

    this.isRaining = false;

    this.clockRadius = 70; // Size of the clock
    this.gradientWidth = 600; // Width of the gradient (adjust as needed)
    this.isPanelOpen = false; // to track panel state
  }

  preload() {
    this.load.image("background", "/images/cartoon-room.png");
    this.load.image("mountains-back", "/images/mountains-back.png");
    this.load.image("mountains-mid1", "/images/mountains-mid1.png");
    this.load.image("mountains-mid2", "/images/mountains-mid2.png");
    this.load.image("sun", "/images/sun.png");
    this.load.image("moon", "/images/moon.png");
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

    // Add sky
    this.daySky = this.add.image(0, 0, "sky-day").setOrigin(0, 0);
    this.nightSky = this.add
      .image(0, 0, "sky-night")
      .setOrigin(0, 0)

      .setAlpha(0);

    // Add sun and moon
    this.sun = this.add.image(
      this.game.scale.width / 2,
      this.game.scale.height,
      "sun"
    );

    this.moon = this.add.image(
      this.game.scale.width / 2,
      this.game.scale.height,
      "moon"
    );

    // Day/Night Overlay
    this.dayNightOverlay = this.add
      .rectangle(
        0,
        0,
        this.game.scale.width,
        this.game.scale.height,
        0x000000,
        0
      )
      .setOrigin(0, 0);

    this.light = this.add.pointlight(1007, 400, 0xfaf9f3, 350, 0.8, 0.03);

    // Debug text
    this.debugText = this.add.text(710, 400, "", {
      fontSize: "16px",
      fill: "#fff",

      wordWrap: { width: 200 },
    });

    // Create clock
    this.createClock();

    // Update time every second
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTime,
      callbackScope: this,
      loop: true,
    });

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

  updateTimeAndSky() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Update clock hands
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

    // Update day/night cycle based on current time
    const totalMinutes = hours * 60 + minutes;
    const timeOfDay = totalMinutes / 1440; // 1440 minutes in a day

    // Calculate darkness
    let darkness;
    if (hours >= 22 || hours < 4) {
      // Night (10 PM to 4 AM)
      darkness = 0.7;
    } else if (hours >= 4 && hours < 7) {
      // Dawn (4 AM to 7 AM)
      darkness = 0.7 - 0.7 * ((totalMinutes - 240) / 180);
    } else if (hours >= 7 && hours < 19) {
      // Day (7 AM to 7 PM)
      darkness = 0;
    } else if (hours >= 19 && hours < 22) {
      // Dusk (7 PM to 10 PM)
      darkness = 0.7 * ((totalMinutes - 1140) / 180);
    }

    this.dayNightOverlay.setFillStyle(0x000000, darkness);

    // Calculate sun and moon positions
    const angle = timeOfDay * Math.PI * 2 - Math.PI / 2;
    const radius = this.game.scale.height * 0.8;
    const sunX = this.game.scale.width / 2 + Math.cos(angle) * radius;
    const sunY = this.game.scale.height + Math.sin(angle) * radius;
    const moonX =
      this.game.scale.width / 2 + Math.cos(angle + Math.PI) * radius;
    const moonY = this.game.scale.height + Math.sin(angle + Math.PI) * radius;

    this.sun.setPosition(sunX, sunY);
    this.moon.setPosition(moonX, moonY);

    // Calculate sky blend with smoother transitions
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
    } else if (hours >= 18 && hours < 22) {
      // Sunset (6 PM to 10 PM)
      skyBlend = Math.min(1, (totalMinutes - 1080) / 240);
    }

    this.nightSky.setAlpha(skyBlend);
    this.daySky.setAlpha(1 - skyBlend);

    // Update mountain colors
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
