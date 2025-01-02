import { StyleSheet, ActivityIndicator, View } from 'react-native'
import React from 'react'

const FooterComponent = ({loading}) => {
  if (loading) {
    return (
        <View style={styles.loading}> 
            <ActivityIndicator color={"#9edaff"} />
        </View> 
    )
  }
  else {
    return (
        <View style={{paddingBottom: 140}}/>
    )
  }
}

export default FooterComponent

const styles = StyleSheet.create({
    loading: {
        alignItems: 'center', 
        paddingBottom: 140
    }
})