import React, {useState, useEffect} from 'react'
import useAuth from '../Hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import ProfileComponent from '../Components/ProfileComponent';
import FirstTimeModal from '../Components/FirstTimeModal';
WebBrowser.maybeCompleteAuthSession();
const ProfileScreen = ({route}) => {
  const {preview, previewImage, previewMade}= route.params;
  const [isFirstTime, setIsFirstTime] = useState(false);
  const {user} = useAuth()
  useEffect(() => {
    const getData = async() => {
      const isFirstTimeValue = await AsyncStorage.getItem('isFirstTime');
      if (isFirstTimeValue === null) {
        setIsFirstTime(true)
      }
      else {
        setIsFirstTime(false)
      }
    }
    getData();
    
  }, [])
  return (
    <>
      <FirstTimeModal isFirstTime={isFirstTime} closeFirstTimeModal={() => setIsFirstTime(false)}/>
      <ProfileComponent preview={preview} previewMade={previewMade} previewImage={previewImage} name={user.uid} person={null} 
        ableToMessage={[]} friendId={null} viewing={false}/>
    </>
  )
      
}

export default ProfileScreen