import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const GuidelineProgression = ({colorOne, colorTwo, colorThree, text}) => {
  return (
    <View>
      <View style={styles.mainHeader}>
        <Text style={{fontSize: 46.88, color: "#fff", fontWeight: '300', paddingTop: '7.5%', paddingRight: '10%',}}>Guidelines</Text>
        <Text style={styles.paragraph}>{text}</Text>
      </View>
      <View style={styles.container}>
          <View style={[styles.bar, colorOne]}/>
          <View style={[styles.bar, colorTwo]}/>
          <View style={[styles.bar, colorThree]}/>
      </View>
    </View>
  )
}

export default GuidelineProgression

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: '5%'
    },
    bar: {
        borderWidth: 3,
        width: '27.5%',
        borderColor: '#c3c3c3'
    },
    mainHeader: {
        backgroundColor: "#27293d",
        borderRadius: 8,
        width: '75%',
        marginTop: '7.5%',
        marginLeft: '1.5%',
        justifyContent: 'center',
        alignItems: 'center'
    },
     paragraph: {
        fontSize: 15.36,
        paddingBottom: '5%',
        paddingRight: '12.5%',
        //paddingLeft: 0,
        //paddingTop: 15,
        color: "#fff",
        fontWeight: '300'
    },

})