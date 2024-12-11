import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, {useState, useEffect, useCallback, useRef, useMemo, useContext} from 'react'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import { AppState, TouchableOpacity } from 'react-native'
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import NotificationScreen from './Screens/NotificationScreen';
import NameScreen from './Register/NameScreen';
import AgeScreen from './Register/AgeScreen'
import BioScreen from './Register/BioScreen';
import Pfp from './Register/Pfp';
import Caption from './Screens/Caption';
import ChatScreen from './Screens/ChatScreen';
import Comments from './Screens/Comments';
import Friends from './Screens/Friends';
import GroupList from './Screens/GroupList';
import GroupScreen from './Screens/GroupScreen';
import HomeScreen from './Screens/HomeScreen';
import PersonalChatScreen from './Screens/PersonalChatScreen';
import Post from './Screens/Post';
import ProfileScreen from './Screens/ProfileScreen';
import RecentSearchesScreen from './Screens/RecentSearchesScreen';
import Saved from './Screens/Saved';
import Settings from './Screens/Settings';
import Theme from './Theme/Theme';
import CreateTheme from './Theme/CreateTheme';
import BackgroundGuidelines from './Design/BackgroundGuidelines';
import DesignTheme from './Design/DesignTheme';
import SpecificTheme from './Theme/SpecificTheme';
import SuccessTheme from './Theme/SuccessTheme';
import PurchaseTheme from './Theme/PurchaseTheme';
import GroupHome from './Group/GroupHome';
import GroupAbout from './Group/GroupAbout';
import GroupAccountSettings from './Group/GroupAccountSettings';
import GroupCategory from './Group/GroupCategory';
import GroupChannels from './Group/GroupChannels';
import GroupMembers from './Group/GroupMembers';
import GroupName from './Group/GroupName';
import GroupPic from './Group/GroupPic';
import GroupSecurity from './Group/GroupSecurity';
import GroupSettings from './Group/GroupSettings';
import Vidz from './Screens/Vidz';
import ContentList from './Screens/ContentList';
import EditScreen from './Screens/EditScreen';
import FinalizeTheme from './Theme/FinalizeTheme';
import { auth } from './firebase';
import { doc, getDoc, getFirestore, onSnapshot, query, updateDoc, collection, getCountFromServer, getDocs} from 'firebase/firestore';
import ReportedContent from './Settings/ReportedContent';
import AdminRequests from './Settings/AdminRequests';
import All from './Theme/All';
import HomeScreenPreview from './Screens/HomeScreenPreview';
import FriendRequests from './Screens/FriendRequests';
import TransactionSummary from './Sell/TransactionSummary';
import NewPost from './Screens/NewPost';
import useAuth from './Hooks/useAuth';
import FirstLogin from './Screens/FirstLogin';
import Login from './Screens/Login';
import SignUp from './Screens/SignUp';
import UploadGuidelines from './Design/UploadGuidelines';
import Choose from './Design/Choose';
import ForgotPassword from './Screens/ForgotPassword';
import GroupSettingsSettings from './Group/GroupSettingsSettings';
import EditClique from './Group/EditClique';
import GroupPfp from './Group/GroupPfp';
import Likes from './Screens/Likes';
import AdminContacts from './Group/AdminContacts';
import MemberRequests from './Group/MemberRequests';
import ReportProblem from './Screens/ReportProblem';
import TheSplashScreen from './Components/TheSplashScreen';
import ReportScreen from './Screens/ReportScreen';
import ViewingProfile from './Screens/ViewingProfile';
import TandC from './Screens/TandC';
import CliqueBans from './Group/CliqueBans';
import ReportPage from './Screens/ReportPage';
import PrivacyPolicy from './Screens/PrivacyPolicy';
import AccountInfo from './Screens/AccountInfo';
import DataPolicy from './Screens/DataPolicy';
import CliqueContentList from './Group/CliqueContentList';
import AccountInfoTemp from './Screens/AccountInfoTemp';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import GroupPosts from './Group/GroupPosts';
import { useNavigation, useNavigationState, useRoute, CommonActions } from '@react-navigation/native';
import GroupChat from './Group/GroupChat';
import PurchaseCredits from './Design/PurchaseCredits';
import AddCard from './Sell/AddCard';
import MentionPreview from './Screens/MentionPreview';
import Mention from './Screens/Mention';
import MultiPost from './Screens/MultiPost';
import Licensing from './Settings/Licensing';
import PriceSummary from './Theme/PriceSummary';
import TransactionHistory from './Screens/TransactionHistory';
import BeforePurchaseSummary from './Theme/BeforePurchaseSummary';
import LikedPosts from './Screens/LikedPosts';
import CommentedPosts from './Screens/CommentedPosts';
import SavedPosts from './Screens/SavedPosts';
import themeContext from './lib/themeContext';
import ViewingFriends from './Screens/ViewingFriends';
import ViewingCliqs from './Screens/ViewingCliqs';
import { useFocusEffect } from '@react-navigation/native';
import AppleDemo from './Screens/AppleDemo';
import DataRetentionPolicy from './Screens/DataRetentionPolicy';
import PeopleList from './Screens/PeopleList';
import ViewingFollowers from './Screens/ViewingFollowers';
import Repost from './Screens/Repost';
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
  console.log('Received a notification in the background!');
  // Do something with the notification data
});
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StackNavigator = () => {
const [notification, setNotification] = useState(false);
const navigation = useNavigation();
const [currentRoute, setCurrentRoute] = useState(null);
const {user} = useAuth();
const [refreshHome, setRefreshHome] = useState(false);
const [firstName, setFirstName] = useState('')
const theme = useContext(themeContext)
const [reportedContent, setReportedContent] = useState([]);
const appState = useRef(AppState.currentState);
//const [appState, setAppState] = useState(AppState.currentState);

  /* useEffect(() => {
    const handleAppStateChange = async(nextAppState) => {
      if (
        (appState.match(/inactive|background/) &&
        nextAppState === 'active')
      ) {
        
      } else if (
        appState === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        
      }
      setAppState(nextAppState);
    };

    AppState.addEventListener('change', handleAppStateChange);
    return;
  }, [appState]); */
/* useFocusEffect(
      useCallback(async() => {
        
      // This block of code will run when the screen is focused
      

      // Clean-up function when the component unmounts or the screen loses focus
      return async() => {
        
      };
    }, [])
  ) */
  

  
//const navigationRef = useRef(null)
//const currentRoute = navigation.getState().routes[navigation.getState().index].name;
//const currentRoute = navigation.getState().routes[navigation.getState().index].name
//console.log(currentRoute)

  /* useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      // Get the current route name here
      if (navigation.getState() != undefined){
      const currentRouteName = navigation.getState().routes[
        navigation.getState().index
      ].name;
      setCurrentRoute(currentRouteName)
    }
    });

    return unsubscribe;
  }, [navigation]); */
  /* useEffect(() => {
        console.log(currentRoute)
    // Fetch data or perform actions when refreshHome or refreshProfile changes
    if (refreshHome) {
      
      // Example: Fetch data for Home screen
      // fetchDataForHome();
      setRefreshHome(false); // Reset refresh state
    }

    else if (currentRoute == 'Home') {
      navigation.navigate('Home', {screen: 'HomeScreen'});
    }
  }, [refreshHome, currentRoute]); */
  //console.log(completeUser)
  
//console.log(specificData

const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
const ThemeStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Group>
        <Stack.Screen name='All' component={All} initialParams={{name: null, groupId: null, goToMy: false, groupTheme: null, group: null, registers: false}}/>
        <Stack.Screen name='UploadGuidelines' component={UploadGuidelines} />
        
        <Stack.Screen name='TransactionSummary' component={TransactionSummary}/>
        <Stack.Screen name='HomeScreenPreview' component={HomeScreenPreview}/>
        <Stack.Screen name='Theme' component={Theme} />
        <Stack.Screen name='PurchaseTheme' component={PurchaseTheme} />
         <Stack.Screen name='FinalizeTheme' component={FinalizeTheme} />
         <Stack.Screen name='CreateTheme' component={CreateTheme} /> 
        <Stack.Screen name='BackgroundGuidelines' component={BackgroundGuidelines} />
        <Stack.Screen name='DesignTheme' component={DesignTheme} />
        <Stack.Screen name='PurchaseCredits' component={PurchaseCredits} />
        <Stack.Screen name='SpecificTheme' component={SpecificTheme} />
        <Stack.Screen name="RecentSearches" component={RecentSearchesScreen}/>
        <Stack.Screen name='SuccessTheme' component={SuccessTheme} />
        <Stack.Screen name='Choose' component={Choose} />
        <Stack.Screen name='ViewingProfile' component={ViewingProfile} />
        <Stack.Screen name='ViewingFriends' component={ViewingFriends} />
        <Stack.Screen name='ViewingFollowers' component={ViewingFollowers} />
        <Stack.Screen name='ViewingCliqs' component={ViewingCliqs} />
        <Stack.Screen name='AddCard' component={AddCard} />
        <Stack.Screen name='PriceSummary' component={PriceSummary} />
        <Stack.Screen name='BeforePurchaseSummary' component={BeforePurchaseSummary} />
      </Stack.Group>
      <Stack.Group screenOptions={{presentation: 'modal' }}>
        <Stack.Screen name='ReportPage' component={ReportPage} />
      
      </Stack.Group>
      <Stack.Group screenOptions={{presentation: 'fullScreenModal' }}>
        <Stack.Screen name="TandC" component={TandC}/>
        <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicy}/>
        <Stack.Screen name='DataPolicy' component={DataPolicy} />
        <Stack.Screen name='DataRetentionPolicy' component={DataRetentionPolicy} />
        <Stack.Screen name='Licensing' component={Licensing}/>
      </Stack.Group>
    </Stack.Navigator>
  )
}
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Group>
        <Stack.Screen name="Profile" component={ProfileScreen} initialParams={{name: user.uid, preview: false, viewing: false, previewImage: null, previewMade: false, applying: false}}/>
        <Stack.Screen name='Edit' component={EditScreen} />
         <Stack.Screen name='Chat' component={ChatScreen} />
         <Stack.Screen name="PersonalChat" component={PersonalChatScreen}/>
         <Stack.Screen name='ContentList' component={ContentList} />
         <Stack.Screen name='LikedPosts' component={LikedPosts} />
         <Stack.Screen name='CommentedPosts' component={CommentedPosts} />
         <Stack.Screen name='SavedPosts' component={SavedPosts} />
        <Stack.Screen name='FriendRequests' component={FriendRequests} />
        <Stack.Screen name="Friends" component={Friends}/>
        <Stack.Screen name="Settings" component={Settings}/>
        <Stack.Screen name='Likes' component={Likes}/>
        <Stack.Screen name='Post' component={Post} />
        <Stack.Screen name='Repost' component={Repost} />
        <Stack.Screen name="Caption" component={Caption}/>
        <Stack.Screen name='MultiPost' component={MultiPost} />
        <Stack.Screen name="GroupList" component={GroupList}/>
        <Stack.Screen name='AccountInfo' component={AccountInfo} />
        <Stack.Screen name='AccountInfoTemp' component={AccountInfoTemp} />
        <Stack.Screen name='ForgotPassword' component={ForgotPassword}/>
        <Stack.Screen name='Mention' component={Mention} />
        <Stack.Screen name='TransactionHistory' component={TransactionHistory} />
        <Stack.Screen name='FirstLogin' component={FirstLogin}/>
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='SignUp' component={SignUp} />
        <Stack.Screen name='AppleDemo' component={AppleDemo} />
        <Stack.Screen name="Name" component={NameScreen}/>
        <Stack.Screen name='Age' component={AgeScreen}/>
        <Stack.Screen name="Pfp" component={Pfp} />
        <Stack.Screen name="Bio" component={BioScreen} />
        <Stack.Screen name='GroupHome' component={GroupHome} />
        <Stack.Screen name='GroupPosts' component={GroupPosts} />
        <Stack.Screen name='GroupChannels' component={GroupChannels} />
        <Stack.Screen name='GroupChat' component={GroupChat} />
        <Stack.Screen name='GroupSettings' component={GroupSettings} />
        <Stack.Screen name='GroupMembers' component={GroupMembers} />
        <Stack.Screen name='EditClique' component={EditClique} />
        <Stack.Screen name='GroupAccountSettings' component={GroupAccountSettings} />
        <Stack.Screen name='AdminRequests' component={AdminRequests} />
        <Stack.Screen name='GroupSettingsSettings' component={GroupSettingsSettings} />
        <Stack.Screen name='AdminContacts' component={AdminContacts} />
        <Stack.Screen name='MemberRequests' component={MemberRequests} />
        <Stack.Screen name="ReportProblem" component={ReportProblem} />
        <Stack.Screen name='NewPost' component={NewPost} />
        <Stack.Screen name='ViewingProfile' component={ViewingProfile} />
        <Stack.Screen name='ViewingFriends' component={ViewingFriends} />
         <Stack.Screen name='ViewingFollowers' component={ViewingFollowers} />
        <Stack.Screen name='ViewingCliqs' component={ViewingCliqs} />
        <Stack.Screen name='CliqueBans' component={CliqueBans} />
        <Stack.Screen name='CliqueContentList' component={CliqueContentList} />
        <Stack.Screen name='MentionPreview' component={MentionPreview} />
        <Stack.Screen name='SpecificTheme' component={SpecificTheme} />

      </Stack.Group>
      <Stack.Group screenOptions={{presentation: 'modal' }}>
        <Stack.Screen name="Comments" component={Comments}/>
        <Stack.Screen name='ReportPage' component={ReportPage} />
        
      </Stack.Group>
      <Stack.Group screenOptions={{presentation: 'fullScreenModal' }}>
        <Stack.Screen name="TandC" component={TandC}/>
        <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicy}/>
        <Stack.Screen name='DataPolicy' component={DataPolicy} />
        <Stack.Screen name='DataRetentionPolicy' component={DataRetentionPolicy} />
        <Stack.Screen name='Licensing' component={Licensing}/>
      </Stack.Group>
    </Stack.Navigator>
  )
}
const PostStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Group>
        <Stack.Screen name='NewPost' component={NewPost} initialParams={{group: null, groupId: null, postArray: []}} />
        <Stack.Screen name="Caption" component={Caption}/>
        <Stack.Screen name='MultiPost' component={MultiPost} />
        <Stack.Screen name='MentionPreview' component={MentionPreview} />
      </Stack.Group>
    </Stack.Navigator>
  )
}

const GroupStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Group>
        <Stack.Screen name="Group" component={GroupScreen} initialParams={{post: null}} />
        

        <Stack.Screen name='GroupPfp' component={GroupPfp} />
       <Stack.Screen name='EditClique' component={EditClique} />
        <Stack.Screen name='GroupCategory' component={GroupCategory} />
        <Stack.Screen name='GroupChannels' component={GroupChannels} />
        <Stack.Screen name='GroupChat' component={GroupChat} />
        <Stack.Screen name='GroupSettings' component={GroupSettings} />
        <Stack.Screen name='GroupMembers' component={GroupMembers} />
        <Stack.Screen name='GroupName' component={GroupName} />
        <Stack.Screen name='GroupPic' component={GroupPic} />
        <Stack.Screen name='GroupSecurity' component={GroupSecurity} />
        <Stack.Screen name='GroupHome' component={GroupHome} />
        <Stack.Screen name='GroupPosts' component={GroupPosts} />
        <Stack.Screen name='FriendRequests' component={FriendRequests} />
        <Stack.Screen name="Friends" component={Friends}/>
        <Stack.Screen name="RecentSearches" component={RecentSearchesScreen}/>
        <Stack.Screen name='ReportedContent' component={ReportedContent} />
        <Stack.Screen name='GroupAbout' component={GroupAbout} />
        <Stack.Screen name='GroupAccountSettings' component={GroupAccountSettings} />
        <Stack.Screen name='AdminRequests' component={AdminRequests} />
        <Stack.Screen name='GroupSettingsSettings' component={GroupSettingsSettings} />
        <Stack.Screen name='Likes' component={Likes}/>
        <Stack.Screen name='AdminContacts' component={AdminContacts} />
        <Stack.Screen name='MemberRequests' component={MemberRequests} />
        <Stack.Screen name="ReportProblem" component={ReportProblem} />
        <Stack.Screen name='NewPost' component={NewPost} />
        <Stack.Screen name="Caption" component={Caption}/>
        <Stack.Screen name='MultiPost' component={MultiPost} />
        <Stack.Screen name='ViewingProfile' component={ViewingProfile} />
        <Stack.Screen name='ViewingFriends' component={ViewingFriends} />
         <Stack.Screen name='ViewingFollowers' component={ViewingFollowers} />
        <Stack.Screen name='ViewingCliqs' component={ViewingCliqs} />
        <Stack.Screen name='GroupList' component={GroupList} />
        <Stack.Screen name='CliqueBans' component={CliqueBans} />
        <Stack.Screen name='CliqueContentList' component={CliqueContentList} />
        <Stack.Screen name='Post' component={Post} />
        <Stack.Screen name='Repost' component={Repost} />
        <Stack.Screen name='MentionPreview' component={MentionPreview} />
        <Stack.Screen name='Mention' component={Mention} />
        
      </Stack.Group>
      
      
      <Stack.Group screenOptions={{presentation: 'modal' }}>
        <Stack.Screen name="Comments" component={Comments}/>
        <Stack.Screen name='ReportPage' component={ReportPage} />
        
        
        
      </Stack.Group>
    </Stack.Navigator>
  )
}
const VideoStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Group>
        <Stack.Screen name='Vidz' component={Vidz}/>
        <Stack.Screen name="Friends" component={Friends}/>
        <Stack.Screen name="PersonalChat" component={PersonalChatScreen}/>
        <Stack.Screen name='Likes' component={Likes}/>
        <Stack.Screen name='Post' component={Post} />
        <Stack.Screen name='ViewingProfile' component={ViewingProfile} />
        <Stack.Screen name='ViewingFriends' component={ViewingFriends} />
         <Stack.Screen name='ViewingFollowers' component={ViewingFollowers} />
        <Stack.Screen name='ViewingCliqs' component={ViewingCliqs} />
        <Stack.Screen name='SpecificTheme' component={SpecificTheme} />
        <Stack.Screen name='GroupList' component={GroupList} />
        <Stack.Screen name='Mention' component={Mention} />
      </Stack.Group>
    </Stack.Navigator>
  )
}
const PeopleStack = () => {
  return (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Group>
      <Stack.Screen name='People' component={PeopleList}/>
      <Stack.Screen name='ViewingProfile' component={ViewingProfile} />
      <Stack.Screen name='ViewingFriends' component={ViewingFriends} />
       <Stack.Screen name='ViewingFollowers' component={ViewingFollowers} />
      <Stack.Screen name='ViewingCliqs' component={ViewingCliqs} />
      <Stack.Screen name='Post' component={Post} />
      <Stack.Screen name='SpecificTheme' component={SpecificTheme} />
      <Stack.Screen name='Likes' component={Likes}/>
      <Stack.Screen name='Mention' component={Mention} />
      <Stack.Screen name='Chat' component={ChatScreen} />
      <Stack.Screen name='NotificationScreen' component={NotificationScreen} />
      <Stack.Screen name="PersonalChat" component={PersonalChatScreen}/>
      <Stack.Screen name='HomeScreenPreview' component={HomeScreenPreview}/>
    </Stack.Group>
    <Stack.Group screenOptions={{presentation: 'modal' }}>
        <Stack.Screen name="Comments" component={Comments}/>
        <Stack.Screen name='ReportPage' component={ReportPage} />
        
        
        
      </Stack.Group>
  </Stack.Navigator>
  )
}
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
  <Stack.Group>
        <Stack.Screen name="Home" component={HomeScreen} initialParams={{newPost: false, post: null}}/>
        <Stack.Screen name="Chat" component={ChatScreen}/>
        <Stack.Screen name='NotificationScreen' component={NotificationScreen} />
        <Stack.Screen name='FriendRequests' component={FriendRequests} />
        <Stack.Screen name="Friends" component={Friends}/>
        <Stack.Screen name="PersonalChat" component={PersonalChatScreen}/>
        <Stack.Screen name="RecentSearches" component={RecentSearchesScreen}/>
        <Stack.Screen name='Likes' component={Likes}/>
        <Stack.Screen name='Post' component={Post} />
        <Stack.Screen name="Caption" component={Caption}/>
        <Stack.Screen name='MultiPost' component={MultiPost} />
        <Stack.Screen name='ViewingProfile' component={ViewingProfile} />
        <Stack.Screen name='ViewingFriends' component={ViewingFriends} />
         <Stack.Screen name='ViewingFollowers' component={ViewingFollowers} />
        <Stack.Screen name='ViewingCliqs' component={ViewingCliqs} />
        <Stack.Screen name='SpecificTheme' component={SpecificTheme} />
        <Stack.Screen name='GroupList' component={GroupList} />
        <Stack.Screen name='Mention' component={Mention} />
      </Stack.Group>
      
      
      <Stack.Group screenOptions={{presentation: 'modal' }}>
        <Stack.Screen name="Comments" component={Comments}/>
        <Stack.Screen name='ReportPage' component={ReportPage} />
        
      </Stack.Group>
      </Stack.Navigator>
  )
}
return ( 
  <>
  {!user && reportedContent.length < 10 ? (
    <>
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
        <Stack.Screen name="Bio" component={BioScreen} />
      </Stack.Group>
      <Stack.Group screenOptions={{presentation: 'fullScreenModal' }}>
        <Stack.Screen name="TandC" component={TandC}/>
        <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicy}/>
        <Stack.Screen name='DataPolicy' component={DataPolicy} />
        <Stack.Screen name='DataRetentionPolicy' component={DataRetentionPolicy} />
      </Stack.Group>
  </Stack.Navigator>
  
  </>
    ) : (firstName.length == 0 || firstName == null) && reportedContent.length < 10 ? 
    <>
    <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Group>
        <Stack.Screen name='SplashScreen' component={TheSplashScreen} />
        <Stack.Screen name="Name" component={NameScreen}/>
        <Stack.Screen name='Age' component={AgeScreen}/>
        <Stack.Screen name="Pfp" component={Pfp} options={{ unmountOnBlur: true }}/>
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
      
      </>
  : reportedContent.length < 10 ? 
  
  <Tab.Navigator
      screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? 'home'
                : 'home-outline';
            } else if (route.name === 'Users') {
              iconName = 'face-man-profile'
            } 
            else if (route.name === 'Vidz') {
              iconName = 'video-outline',
              size = 30
            }
            else if (route.name === 'Cliqs') {
              iconName = focused ? 'account-group' : 'account-group-outline';
            }
            else if (route.name === 'New Post') {
              iconName = focused ? 'plus-box-multiple' : 'plus-box-multiple-outline';
            }
            else if (route.name === 'Themes') {
              iconName = focused ? 'widgets' : 'widgets-outline';
            }
            else if (route.name === 'Profile') {
              iconName = focused ? 'account-circle' : 'account-circle-outline';
            }
            

            // You can return any component that you like here!
            
            return (
                <MaterialCommunityIcons name={iconName} size={size} color={color}/>
            
            )
          },
          tabBarActiveTintColor: theme.theme != 'light' ? "#9EDAFF" : "#005278",
          headerShown: false,
          tabBarLabelStyle: {fontSize: 12.29, fontFamily: 'Montserrat_500Medium'},
          tabBarInactiveTintColor: theme.color,
          tabBarActiveBackgroundColor: theme.backgroundColor,
          tabBarInactiveBackgroundColor: theme.backgroundColor,
          tabBarStyle: {height: 80}
          
        })}>
           <Tab.Screen name='Home' component={HomeStack} options={{}} listeners={({ navigation, route }) => ({
      tabPress: (e) => {
        // Get the current state of the navigator
        const state = navigation.getState();
        const currentTab = state.routes[state.index];
       // console.log(currentTab.name)
        // Check if the current tab is 'Home'
        if (currentTab.name === 'Home') {
          //console.log(currentTab)
          // Get the nested state of the HomeStack
            //console.log(navigation.navigate)
          //console.log(currentTab)
            // Check if the active screen is 'HomeScreen'
            if (currentTab.name === 'Home') {
              //console.log('bfj')
              // Prevent the default behavior
              e.preventDefault();
              //console.log('secon')
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Home',
                      params: {
                        screen: 'Home',
                        params: { reloading: true },
                      },
                    },
                  ],
                })
              );
              // Trigger reload or pass parameters to force a re-render
              //console.log('first')
            }
        }
      },
    })}/>
    <Tab.Screen name='Vidz' component={VideoStack} options={{}} listeners={({ navigation, route }) => ({
      tabPress: (e) => {
        // Get the current state of the navigator
        const state = navigation.getState();
        const currentTab = state.routes[state.index];

        // Check if the current tab is 'Home'
        if (currentTab.name === 'Vidz') {
          //console.log(currentTab)
            // Check if the active screen is 'HomeScreen'
            if (currentTab.name === 'Vidz') {
              
              // Prevent the default behavior
              e.preventDefault();
              //console.log('secon')
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Vidz',
                      params: {
                        screen: 'Vidz',
                        params: { reloading: true },
                      },
                    },
                  ],
                })
              );
              // Trigger reload or pass parameters to force a re-render
              //console.log('first')
            }
        }
      },
    })}/>
           <Tab.Screen name='Users' component={PeopleStack} options={{}}/>
          <Tab.Screen name='Cliqs' component={GroupStack}/>
        <Tab.Screen name='New Post' component={PostStack} options={{unmountOnBlur: true}}  />
        <Tab.Screen name='Themes' component={ThemeStack} />
        <Tab.Screen name='Profile' component={ProfileStack} />
          
          </Tab.Navigator>
          
        : reportedContent.length > 10 && reportedContent.length < 20 ? 
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name='ReportScreen' component={ReportScreen} initialParams={{suspended: true, banned: false}} />
        </Stack.Navigator>
        : <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name='ReportScreen' component={ReportScreen} initialParams={{suspended: false, banned: true}} />
        </Stack.Navigator>
        }
  </>
)
}
export default StackNavigator