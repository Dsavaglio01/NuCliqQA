import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import FirstLogin from './Screens/FirstLogin';
import Login from './Screens/Login';
import SignUp from './Screens/SignUp';
import AppleDemo from './Screens/AppleDemo';
import ForgotPassword from './Screens/ForgotPassword';
import NameScreen from './Register/NameScreen';
import AgeScreen from './Register/AgeScreen';
import Pfp from './Register/Pfp';
import TandC from './Screens/TandC';
import PrivacyPolicy from './Screens/PrivacyPolicy';
import DataPolicy from './Screens/DataPolicy';
import DataRetentionPolicy from './Screens/DataRetentionPolicy';
import BioScreen from './Register/BioScreen';
import Referral from './Register/Referral';
const Stack = createNativeStackNavigator();
const FirstLoginStack = () => {
  return (
   <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Group>
        <Stack.Screen name='FirstLogin' component={FirstLogin}/>
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='SignUp' component={SignUp} />
        <Stack.Screen name='AppleDemo' component={AppleDemo} />
        <Stack.Screen name='ForgotPassword' component={ForgotPassword}/>
        <Stack.Screen name="Name" component={NameScreen}/>
        <Stack.Screen name='Age' component={AgeScreen}/>
        <Stack.Screen name="Pfp" component={Pfp} />
        <Stack.Screen name='Referral' component={Referral} />
        <Stack.Screen name="Bio" component={BioScreen} />
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

export default FirstLoginStack