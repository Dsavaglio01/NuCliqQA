import { Share } from 'react-native'
import React from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {APPLE_URL} from '@env';
const ShareApp = ({profile}) => {
    const shareApp = async() => {
        try {
        const result = await Share.share({
            message: (`Join me on NuCliq! Use my referral code when you sign up:\n${profile.referralCode}\n${APPLE_URL}`)
        });
        if (result.action === Share.sharedAction) {
            if (result.activityType) {
            console.log('shared with activity type of: ', result.activityType)
            }
            else {
            console.log('shared')
            }
        } else if (result.action === Share.dismissedAction) {
            console.log('dismissed')
        }
        }
        catch (error) {
        console.log(error)
        }
    }
  return (
    <MaterialCommunityIcons name='share-variant-outline' size={27.5} color={"#fafafa"} onPress={shareApp}/>
  )
}

export default ShareApp