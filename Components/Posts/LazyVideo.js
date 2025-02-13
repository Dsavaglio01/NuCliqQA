import React from "react";
import { Video } from "expo-av";
export const LazyVideo = React.memo(
  ({ source, style, videoRef, shouldPlay, onPlaybackStatusUpdate }) => (
      <Video
        ref={videoRef}
        style={style}
        source={{ uri: source }}
        volume={1.0}
        shouldPlay={shouldPlay}
        isLooping
        useNativeControls
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />
    )
);
