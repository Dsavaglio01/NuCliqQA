import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface } from 'gl-react-expo';
import { Shaders, Node, GLSL } from 'gl-react';

const shaders = Shaders.create({
  simpleColor: {
    frag: GLSL`
      precision highp float;
      varying vec2 uv;
      void main() {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Simple green color
      }
    `,
  },
});

const EditImage = () => {
  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Node shader={shaders.simpleColor} />
      </Surface>
    </View>
  );
};

export default EditImage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    width: 300,
    height: 300,
  },
});
