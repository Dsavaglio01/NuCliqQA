import { StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Provider, Menu, Divider} from 'react-native-paper'
import {MaterialCommunityIcons} from '@expo/vector-icons';
const MoodComponent = ({meet, following, mood, sendMeetDataBack, sendFollowingDataBack, sendMoodDataBack}) => {
  const [visible, setVisible] = useState(false);
  const openHeaderMenu = () => setVisible(true)
  const closeHeaderMenu = () => setVisible(false)
  const handleOpen = () => {
    sendMeetDataBack()
  }
  const handleFollowing = () => {
    sendFollowingDataBack()
  }
  const handleMood = (mood) => {
    sendMoodDataBack(mood)
  }
  return (
    <Provider>
        <Menu 
            visible={visible}
            onDismiss={closeHeaderMenu}
            contentStyle={styles.contentStyle}
            anchor={<MaterialCommunityIcons name='chevron-down-circle-outline' size={28} color={"#fafafa"} style={styles.arrow} onPress={openHeaderMenu}/>}>
            <Menu.Item onPress={meet ? null : () => handleOpen()} title="For You" titleStyle={meet ? {color: "#9EDAFF"} : {color: "#fafafa"}}/>
            <Divider />
            <Menu.Item onPress={following ? null : () => handleFollowing()} title="Following" titleStyle={!meet ? {color: "#9EDAFF"} : {color: "#fafafa"}}/>
            <Divider />
            <Menu.Item onPress={mood == 'Excited' ? null : () => handleMood('Excited')} title="Excited" titleStyle={!meet ? {color: "#9edaff"} : {color: "#fafafa"}}/>
            <Divider />
            <Menu.Item onPress={mood == 'Funny' ? null : () => handleMood('Funny')} title="Funny" titleStyle={!meet ? {color: "#9edaff"} : {color: "#fafafa"}}/>
            <Divider />
            <Menu.Item onPress={mood == 'Grateful' ? null : () => handleMood('Grateful')} title="Grateful" titleStyle={!meet ? {color: "#9edaff"} : {color: "#fafafa"}}/>
            <Divider />
            <Menu.Item onPress={mood == 'Happy' ? null : () => handleMood('Happy')} title="Happy" titleStyle={!meet ? {color: "#9edaff"} : {color: "#fafafa"}}/>
            <Divider />
            <Menu.Item onPress={mood == 'Mad' ? null : () => handleMood('Mad')} title="Mad" titleStyle={!meet ? {color: "#9edaff"} : {color: "#fafafa"}}/>
            <Divider />
            <Menu.Item onPress={mood == 'Sad' ? null : () => handleMood('Sad')} title="Sad" titleStyle={!meet ? {color: "#9edaff"} : {color: "#fafafa"}}/>
            <Divider />
            <Menu.Item onPress={mood == 'Scared' ? null : () => handleMood('Scared')} title="Scared" titleStyle={!meet ? {color: "#9edaff"} : {color: "#fafafa"}}/>
        </Menu>
    </Provider>
  )
}

export default MoodComponent

const styles = StyleSheet.create({
    contentStyle: {
        borderWidth: 1, 
        backgroundColor: "#121212",
        borderColor: "#71797E",
    },
    arrow: {
        alignSelf: 'center', 
        marginTop: 1,
        paddingVertical: 5,
        paddingRight: 0,
        paddingLeft: -5,
        marginLeft: -12.5
    }
})