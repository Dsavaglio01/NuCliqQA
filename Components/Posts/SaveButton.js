import React, {useCallback} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { Dimensions, TouchableOpacity, StyleSheet} from 'react-native';
function SaveButton({item, user, updateTempPostsAddSave, home, clique, updateTempPostsRemoveSave, updateTempPostsCliqueAddSave,
    updateTempPostsCliqueRemoveSave, videoStyling}) {
    const addHomeSave = useCallback(async() => {
        await updateTempPostsAddSave(item.item, item.item.savedBy)
        },
        [item, updateTempPostsAddSave]);
    const removeHomeSave = useCallback(async() => {
        await updateTempPostsRemoveSave(item.item, item.item.savedBy)
        },
        [item, updateTempPostsRemoveSave]);
    const addCliqueSave = useCallback(async() => {
        await updateTempPostsCliqueAddSave(item.item, item.item.savedBy)
    },
    [item, updateTempPostsCliqueAddSave]);
    const removeCliqueSave = useCallback(async() => {
        await updateTempPostsCliqueRemoveSave(item.item, item.item.savedBy)
    },
    [item, updateTempPostsCliqueRemoveSave]);
  return (
        <TouchableOpacity style={videoStyling ? styles.videoButton : null} onPress={item.item.savedBy.includes(user.uid) == false ? home ? 
        () => {addHomeSave(item.item)} : clique ? () => addCliqueSave(item.item) : null : home ? 
        () => {removeHomeSave(item.item)} : clique ? () => removeCliqueSave(item.item) : null}>
            {item.item.savedBy.includes(user.uid) ? <MaterialCommunityIcons name='bookmark' color={"#9EDAFF"} size={30} 
            style={{alignSelf: 'center'}}/> : <MaterialCommunityIcons name='bookmark-plus-outline' color={"#fafafa"} size={30} 
            style={{alignSelf: 'center'}}/>}
        </TouchableOpacity>
  )
}

export default SaveButton
const styles = StyleSheet.create({
    videoButton: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: .5,
      shadowRadius: 3.84,
      elevation: 5,
    },
})