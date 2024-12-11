import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
const Stack = createNativeStackNavigator();
import TheSplashScreen from './Components/TheSplashScreen';
import NameScreen from './Register/NameScreen';
import AgeScreen from './Register/AgeScreen';
import Pfp from './Register/Pfp';
import FirstLogin from './Screens/FirstLogin';
import SignUp from './Screens/SignUp';
import Login from './Screens/Login';
import AppleDemo from './Screens/AppleDemo';
import ForgotPassword from './Screens/ForgotPassword';
import TandC from './Screens/TandC';
import PrivacyPolicy from './Screens/PrivacyPolicy';
import DataPolicy from './Screens/DataPolicy';
import DataRetentionPolicy from './Screens/DataRetentionPolicy';
import BioScreen from './Register/BioScreen';
import Referral from './Register/Referral';
const FirstNameStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Group>
        <Stack.Screen name='SplashScreen' component={TheSplashScreen} />
        <Stack.Screen name="Name" component={NameScreen}/>
        <Stack.Screen name='Age' component={AgeScreen}/>
        <Stack.Screen name="Pfp" component={Pfp} options={{ unmountOnBlur: true }}/>
        <Stack.Screen name='Referral' component={Referral} />
        <Stack.Screen name="Bio" component={BioScreen} options={{ unmountOnBlur: true }}/>
      
        <Stack.Screen name='FirstLogin' component={FirstLogin}/>
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='SignUp' component={SignUp} />
        <Stack.Screen name='AppleDemo' component={AppleDemo} />
        <Stack.Screen name='ForgotPassword' component={ForgotPassword}/>
        </Stack.Group>
        <Stack.Group screenOptions={{presentation: 'fullScreenModal' }}>
        <Stack.Screen name="TandC" component={TandC}/>
        <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicy}/>
        <Stack.Screen name='DataPolicy' component={DataPolicy} />
        <Stack.Screen name='DataRetentionPolicy' component={DataRetentionPolicy} />
        
      </Stack.Group>
      </Stack.Navigator>
  )
}

export default FirstNameStack