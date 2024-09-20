import React, { useEffect, useRef } from "react";

const YouTubePlayer = ({ isPlaying, volume }) => {
  const playerRef = useRef(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  return <div id='youtube-player' style={{ display: "none" }}></div>;
};

export default YouTubePlayer;
