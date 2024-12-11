import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Video } from 'expo-av'
const PostVideo = ({videoRef, source, shouldPlay, onPlaybackStatusUpdate, style}) => {
    
  return (
    <Video 
                      ref={videoRef}
                      style={style}
                      source={{uri: source}}
                      useNativeControls
                      volume={1.0}
                      shouldPlay={shouldPlay}
                      isLooping
                      
                      onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    />
  )
}

export default PostVideo

const styles = StyleSheet.create({})