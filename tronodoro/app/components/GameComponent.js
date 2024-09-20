import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import MainScene from "./MainScene";
import { config } from "./config";
import YouTubePlayer from "./YouTubePlayer";

const GameComponent = () => {
  const gameRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const game = new Phaser.Game({
      ...config,
      parent: gameRef.current,
    });

    game.events.on("toggleMusic", handlePlayPause);

    return () => {
      game.destroy(true);
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        ref={gameRef}
        style={{ width: "100%", height: "calc(100% - 60px)" }}
      />
      <YouTubePlayer isPlaying={isPlaying} volume={volume} />
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
