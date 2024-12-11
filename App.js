import 'expo-dev-client';
import 'react-native-url-polyfill/auto';
import React, {useRef, useState,  useEffect, useContext,} from "react";
import { StyleSheet, AppState, DeviceEventEmitter, Alert} from "react-native";
import { NavigationContainer, DarkTheme, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import {LogBox} from 'react-native';
import * as Notifications from 'expo-notifications'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-native-paper';
import { updateDoc, doc, onSnapshot, getDocs, collection,} from 'firebase/firestore';
import useAuth, { AuthProvider } from './Hooks/useAuth';
import * as Linking from 'expo-linking';
import ReportScreen from './Screens/ReportScreen';
import * as TrackingTransparency from 'expo-tracking-transparency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from './lib/theme';
import themeContext from './lib/themeContext';
import { db } from './firebase';
import Purchases from 'react-native-purchases';
import FirstLoginStack from './FirstLoginStack';
import FirstNameStack from './FirstNameStack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RootNavigator from './TabNavigator';
import {PURCHASE_URL} from "@env";
import { Montserrat_600SemiBold, Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold, useFonts } from '@expo-google-fonts/montserrat';

    
LogBox.ignoreAllLogs()


Purchases.configure({ apiKey: PURCHASE_URL });
export default function App() {
    const [darkmode, setDarkmode] = useState(true);
    const [navigationReady, setNavigationReady] = useState(false);
    const [initialLink, setInitialLink] = useState(null);
    Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge:  true,
    }),
  });



    const [initialState, setInitialState] = useState();
    const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';
    
    useEffect(() => {
      const loadDarkmode = async () => {
    try {
      const storedDarkmode = await AsyncStorage.getItem('darkmode');
      if (storedDarkmode !== null) {
        setDarkmode(JSON.parse(storedDarkmode));
      }
    } catch (error) {
      console.error('Error loading darkmode:', error);
    }
  };

  loadDarkmode();
      const listener = DeviceEventEmitter.addListener('ChangeTheme', (data) => {
        console.log(data)
        setDarkmode(data)
      })
      return () => { 
        listener.remove()
      }
    }, [darkmode])
    const requestTrackingPermission = async () => {
  console.log('Requesting tracking permission');
  const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
  if (status === 'granted') {
    console.log('Yay! User granted tracking permission');
  } else {
    console.log('User denied tracking permission or other status');
    // Handle permission denial (optional)
  }
};
   useEffect(() => {
    requestTrackingPermission()
  }, []);
  
  //console.log(user)
  
  useEffect(() => {
    const getInitialLink = async () => {
      const link = await Linking.getInitialURL();
      if (link) {
        Alert.alert(link)
        setInitialLink(link);
      }
    };
    getInitialLink();
  }, []);
  //console.log(initialLink)
 const AppContent = () => {
  
  const { user,} = useAuth();
  const [isReady, setIsReady] = useState(false);
  //const [initialLink, setInitialLink] = useState(null);
 
  //const navigationRef = useNavigationContainerRef()
  const [reportedContent, setReportedContent] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [suspended, setSuspended] = useState(false);
  const navigationRef = useNavigationContainerRef();
  //console.log(navigationRef.isReady())
  const Stack = createNativeStackNavigator();
  const notificationListener = useRef(null);
  //console.log(isReady, initialLink, navigationReady, user, reportedContent.length, firstName.length)
  useEffect(() => {
if (isReady && navigationReady && user && reportedContent.length < 10 && firstName.length > 0) {
    notificationListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const route = response.notification.request.content.data.routeName;
      if (route == 'PersonalChat') {
        console.log('bruhh')
      navigationRef.current?.navigate(route, {person: response.notification.request.content.data.person, friendId: response.notification.request.content.data.friendId})
    }
    else if (route == 'NotificationScreen') {
      //Alert.alert('BRUH')
      navigationRef.current?.navigate(route)
    }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
    };
  }
  }, [isReady, navigationReady, user, firstName, reportedContent]);
  const navigateToScreen = (url) => {
    console.log(url)
  try {
    const route = url.split('://')[1];
  const params = new URLSearchParams(url.split('?')[1])
  //handleNotificationResponse
  if (route == 'Chat') {
      navigationRef.current?.navigate('Chat', {sending: false, notification: true, message: false})
  }
  else if (route == 'NotificationScreen') {
    console.log(navigationRef.current?.getState())
    navigationRef.current?.navigate('NotificationScreen')
  }
  else if (route == 'PersonalChat') {
    //console.log(params)
    const person = params.get('person')
    const friendId = params.get('friendId')
    navigationRef.current?.navigate(route, {person: person, friendId: friendId})
  }
  else if (route == 'GroupChat') {
    const id = params.get('id')
    const pfp = params.get('pfp')
    const group = params.get('group')
    const groupName = params.get('groupName')
      navigationRef.current?.navigate('Cliqs', {screen: route, params: {id: id, pfp: pfp, group: group, groupName: groupName}})
    }
    else if (route == 'GroupChannels') {
      const id = params.get('id')
      const pfp = params.get('pfp')
      const group = params.get('group')
      const groupName = params.get('groupName')
      const person = params.get('person')
      navigationRef.current?.navigate('Cliqs', {screen: route, params: {id: id, pfp: pfp, sending: false, notifications: true, group: group, groupName: groupName, person: person}})
    }
  } catch (error) {
      console.error('Error handling deep link:', error);
      // Handle potential errors during navigation or parameter parsing
    }
  }
  
  useEffect(() => {
    const handleLink = (event) => {
      //console.log(event)
      if (isReady) {
        handleDeepLink(event);
      } else {
        setInitialLink(event);
      }
    };

    const subscription = Linking.addEventListener('url', handleLink);

    return () => {
      subscription.remove();
    };
  }, [isReady]);
  useEffect(() => {
    if (user) {
    const subscription = AppState.addEventListener('change', async(nextAppState) => {
      if (
        nextAppState === 'active'
      ) {
        await updateDoc(doc(db, 'profiles', user.uid), {
          active: true
        })
      }
      else {
        //console.log('first')
        await updateDoc(doc(db, 'profiles', user.uid), {
          active: false,
          fetchMore: false,
          activeOnMessage: false,
          messageTyping: '',
          messageActive: false,
          cliqChatActive: null,
          lastDocument: null
        })
      }
    });

    return () => {
      subscription.remove();
    };
  }
  }, [user]);
  useEffect(() => {
  //console.log(db)
  if (user != null && user != undefined) {
    let unsub;
    unsub = onSnapshot(doc(db, "profiles", user.uid), async(document) => { 
      if (document.data() != undefined) {
        if (document.data().firstName != undefined) {
          setFirstName(document.data().firstName)
          setSuspended(document.data().suspended)
        }
        
      }
  });
  return unsub;
  }
  else {
    setFirstName('')
  }
}, [user])

//console.log(user)
  //console.log(user.uid)
  useEffect(() => {
    if (user != undefined && user != null) {
      const getData = async() => {
        setReportedContent([]);
        const querySnapshot = await getDocs(collection(db, 'profiles', user.uid, 'reportedContent'))
        querySnapshot.forEach((doc) => {
          
          setReportedContent(prevState => [...prevState, doc.id])
        })

      }
      getData();
    }
  }, [user])
  const handleDeepLink = (url) => {
    //Alert.alert(url)
    //console.log(url)
      if (url && isReady && navigationRef.current) {


        navigateToScreen(url)
      }
    };
  
    //console.log(reportedContent.length, firstName.length)
  useEffect(() => {
  
  if (isReady && initialLink && navigationReady && user && reportedContent.length < 10 && firstName.length > 0) {
    //Alert.alert(initialLink)
    handleDeepLink(initialLink);
    //setInitialLink(null);
  }
}, [isReady, initialLink, navigationReady, user, firstName, reportedContent]); // Ensure this dependency array is correct
//console.log(navigationRef.isReady())
  useEffect(() => {
    const checkReady = () => {
      if (navigationRef.isReady()) {
        setNavigationReady(true);
      }
    };

    const interval = setInterval(checkReady, 100);

    return () => clearInterval(interval);
  }, []);
  const onReady = () => {
    setIsReady(true);
  };
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  //console.log(isReady)
  //console.log(user)
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onReady} theme={darkmode ? DarkTheme : DefaultTheme} initialState={initialState} onStateChange={(state) => AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))}
    >
      {!user && !suspended ? <FirstLoginStack /> : (firstName.length == 0 || firstName == null) && !suspended? <FirstNameStack /> : !suspended ? 

     <RootNavigator />
      :
      suspended ? 
      <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name='ReportScreen' component={ReportScreen} initialParams={{suspended: true, banned: false}} />
        </Stack.Navigator> : <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name='ReportScreen' component={ReportScreen} initialParams={{suspended: false, banned: true}} />
        </Stack.Navigator>}
    </NavigationContainer>
  );
};
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <themeContext.Provider value={darkmode === true ? theme.dark : theme.light}>
      <Provider>
        <AuthProvider>
          <AppContent />
          </AuthProvider>
    </Provider>
    </themeContext.Provider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inner: {
    width: 240,
  },
  error: {
    marginBottom: 20,
    color: 'red'
  },
  link: {
    color: 'blue',
    marginBottom: 20
  },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
        flex: 1,
    width: '95%',
    marginLeft: '2.5%'
    },
});