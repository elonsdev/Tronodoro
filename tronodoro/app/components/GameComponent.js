import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });

    this.isRaining = false;
    this.clockCenter = { x: 583, y: 160 }; // Position of the clock on the wall
    this.clockRadius = 70; // Size of the clock
    this.gradientWidth = 600; // Width of the gradient (adjust as needed)
  }

  preload() {
    this.load.image("background", "/images/cartoon-room.png");
    this.load.image("task-icon", "/images/task-icon.png");
    this.load.image("pomodoro-icon", "/images/pomodoro-icon.png");
    this.load.image("music-icon", "/images/music-icon.png");
    this.load.image("raindrop", "/images/raindrop.png");
    this.load.gradientTexture;
  }

  create() {
    this.lights.enable;

    this.gradientTexture = this.createGradientTexture();
    this.gradientSprite = this.add
      .image(0, 0, this.gradientTexture)
      .setOrigin(0, 0);

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
        0
      )
      .setOrigin(0, 0);

    this.light = this.add.pointlight(1007, 400, 0xfaf9f3, 350, 0.8, 0.03);

    // UI Icons
    const taskIcon = this.add.image(50, 50, "task-icon").setInteractive();
    const pomodoroIcon = this.add
      .image(50, 120, "pomodoro-icon")
      .setInteractive();
    const musicIcon = this.add.image(50, 190, "music-icon").setInteractive();

    [taskIcon, pomodoroIcon, musicIcon].forEach((icon) => {
      icon.setScale(0.5);
      this.tweens.add({
        targets: icon,
        scale: 0.55,
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });
    });

    // Interactivity
    taskIcon.on("pointerdown", () => this.showTaskMenu());
    pomodoroIcon.on("pointerdown", () => this.startPomodoro());
    musicIcon.on("pointerdown", () => this.events.emit("toggleMusic"));

    // Debug text
    this.debugText = this.add.text(10, this.game.scale.height - 30, "", {
      fontSize: "16px",
      fill: "#fff",
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

    // Initial time update
    this.updateTime();
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

  createGradientTexture() {
    const texture = this.textures.createCanvas(
      "gradient",
      this.gradientWidth,
      this.game.scale.height
    );
    const context = texture.getContext();
    const grd = context.createLinearGradient(0, 0, this.gradientWidth, 0);

    grd.addColorStop(0, "rgba(255, 255, 255, 1)");
    grd.addColorStop(1, "rgba(255, 255, 255, 0)");

    context.fillStyle = grd;
    context.fillRect(0, 0, this.gradientWidth, this.game.scale.height);

    texture.refresh();

    return texture;
  }

  updateTime() {
    const now = new Date();
    const hours = now.getHours() - 12;
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

    // Calculate colors for the gradient
    let skyColor;
    if (hours >= 22 || hours < 4) {
      // Night (10 PM to 4 AM)
      skyColor = Phaser.Display.Color.ValueToColor("#001a33");
    } else if (hours >= 4 && hours < 6) {
      // Dawn (4 AM to 6 AM)
      skyColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor("#001a33"),
        Phaser.Display.Color.ValueToColor("#87ceeb"),
        120,
        Math.min(((totalMinutes - 240) / 120) * 100, 100)
      );
    } else if (hours >= 6 && hours < 18) {
      // Day (6 AM to 6 PM)
      skyColor = Phaser.Display.Color.ValueToColor("#87ceeb");
    } else if (hours >= 18 && hours < 22) {
      // Dusk (6 PM to 10 PM)
      skyColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor("#87ceeb"),
        Phaser.Display.Color.ValueToColor("#001a33"),
        240,
        Math.min(((totalMinutes - 1080) / 240) * 100, 100)
      );
    }

    // Update the gradient texture
    const texture = this.textures.get("gradient");
    const context = texture.getContext();
    const grd = context.createLinearGradient(0, 0, this.gradientWidth, 0);

    grd.addColorStop(0, skyColor.rgba);
    grd.addColorStop(1, "rgba(255, 255, 255, 0)");

    context.fillStyle = grd;
    context.fillRect(0, 0, this.gradientWidth, this.game.scale.height);

    texture.refresh();

    // Calculate darkness
    let darkness;
    if (hours >= 22 || hours < 4) {
      // Night (10 PM to 4 AM)
      darkness = 0.7;
    } else if (hours >= 4 && hours < 6) {
      // Dawn (4 AM to 6 AM)
      darkness = 0.7 - 0.7 * ((totalMinutes - 240) / 120);
    } else if (hours >= 6 && hours < 18) {
      // Day (6 AM to 6 PM)
      darkness = 0;
    } else if (hours >= 18 && hours < 22) {
      // Dusk (6 PM to 10 PM)
      darkness = 0.7 * ((totalMinutes - 1080) / 240);
    }

    this.dayNightOverlay.setFillStyle(0x000000, darkness);

    this.debugText.setText(
      `Time: ${now.toLocaleTimeString()}, Darkness: ${darkness.toFixed(
        2
      )}, Rain: ${this.isRaining ? "On" : "Off"}`
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

  showTaskMenu() {
    console.log("Task icon clicked");
    // Implement task menu logic
  }

  startPomodoro() {
    console.log("Pomodoro icon clicked");
    // Implement pomodoro timer logic
  }
}

const GameComponent = () => {
  const gameRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      dom: {
        createContainer: true,
      },
    };

    const game = new Phaser.Game(config);

    // Load YouTube IFrame Player API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: "jfKfPfyJRdk", // Lofi Girl radio
        playerVars: {
          autoplay: 0,
          controls: 0,
        },
        events: {
          onReady: (event) => {
            console.log("YouTube player is ready");
          },
        },
      });
    };

    game.events.on("toggleMusic", handlePlayPause);

    return () => {
      game.destroy(true);
    };
  }, []); // Empty dependency array to ensure this effect runs only once

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        ref={gameRef}
        style={{ width: "100%", height: "calc(100% - 60px)" }}
      />
      <div id='youtube-player' style={{ display: "none" }}></div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "60px",
          backgroundColor: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 20px",
        }}
      >
        <button
          onClick={handlePlayPause}
          style={{
            padding: "10px 20px",
            marginRight: "20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <input
          type='range'
          min='0'
          max='100'
          value={volume}
          onChange={handleVolumeChange}
          style={{ width: "200px" }}
        />
        <span style={{ marginLeft: "10px" }}>{volume}%</span>
      </div>
    </div>
  );
};

export default GameComponent;
