import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {MaterialCommunityIcons} from '@expo/vector-icons'
import NotificationScreen from './Screens/NotificationScreen';
import NameScreen from './Register/NameScreen';
import AgeScreen from './Register/AgeScreen'
import BioScreen from './Register/BioScreen';
import Referral from './Register/Referral';
import Pfp from './Register/Pfp';
import Caption from './Screens/Caption';
import ChatScreen from './Screens/ChatScreen';
import Friends from './Screens/Friends';
import GroupList from './Screens/GroupList';
import GroupScreen from './Screens/GroupScreen';
import HomeScreen from './Screens/HomeScreen';
import PersonalChatScreen from './Screens/PersonalChatScreen';
import Post from './Screens/Post';
import ProfileScreen from './Screens/ProfileScreen';
import RecentSearchesScreen from './Screens/RecentSearchesScreen';
import Repost from './Screens/Repost';
import Settings from './Screens/Settings';
import Theme from './Theme/Theme';
import CreateTheme from './Theme/CreateTheme';
import BackgroundGuidelines from './Design/BackgroundGuidelines';
import DesignTheme from './Design/DesignTheme';
import SpecificTheme from './Theme/SpecificTheme';
import SuccessTheme from './Theme/SuccessTheme';
import PurchaseTheme from './Theme/PurchaseTheme';
import GroupHome from './Group/GroupHome';
import ChannelsName from './Channels/ChannelsName';
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
import ReportedContent from './Settings/ReportedContent';
import AdminRequests from './Settings/AdminRequests';
import All from './Theme/All';
import HomeScreenPreview from './Screens/HomeScreenPreview';
import FriendRequests from './Screens/FriendRequests';
import TransactionSummary from './Sell/TransactionSummary';
import NewPost from './Screens/NewPost';
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
import ViewingProfile from './Screens/ViewingProfile';
import TandC from './Screens/TandC';
import CliqueBans from './Group/CliqueBans';
import ReportPage from './Screens/ReportPage';
import PrivacyPolicy from './Screens/PrivacyPolicy';
import AccountInfo from './Screens/AccountInfo';
import DataPolicy from './Screens/DataPolicy';
import CliqueContentList from './Group/CliqueContentList';
import AccountInfoTemp from './Screens/AccountInfoTemp';
import GroupPosts from './Group/GroupPosts';
import { CommonActions } from '@react-navigation/native';
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
import AppleDemo from './Screens/AppleDemo';
import DataRetentionPolicy from './Screens/DataRetentionPolicy';
import PeopleList from './Screens/PeopleList';
import ViewingFollowers from './Screens/ViewingFollowers';
import { useContext } from 'react';
import useAuth from './Hooks/useAuth';
import ChannelSecurity from './Channels/ChannelSecurity';
import ChannelPfp from './Channels/ChannelPfp';
import ChannelInvite from './Channels/ChannelInvite';
import MyGroups from './Group/MyGroups';
import FilterPost from './Screens/FilterPost';
import SendingModal from './Components/SendingModal';
import EditImage from './Screens/EditImage';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const TabNavigator = () => {
    const theme = useContext(themeContext)
    const {user} = useAuth();
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
      <Stack.Group screenOptions={{presentation: 'modal'}}>
        <Stack.Screen name='SendingModal' component={SendingModal} />

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
        <Stack.Screen name='Referral' component={Referral} />
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
        <Stack.Screen name='EditImage' component={EditImage} />
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
        <Stack.Screen name='ReportPage' component={ReportPage} />
        <Stack.Screen name='SendingModal' component={SendingModal} />
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
        <Stack.Screen name='EditImage' component={EditImage} />
        <Stack.Screen name='MultiPost' component={MultiPost} />
        <Stack.Screen name='MentionPreview' component={MentionPreview} />
        <Stack.Screen name='FilterPost' component={FilterPost}/>
      </Stack.Group>
    </Stack.Navigator>
  )
}

const GroupStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Group>
        <Stack.Screen name="Group" component={GroupScreen} initialParams={{post: null}} />
        <Stack.Screen name='MyGroups' component={MyGroups} />

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
        <Stack.Screen name='ChannelsName' component={ChannelsName} />
        <Stack.Screen name='ChannelSecurity' component={ChannelSecurity} />
        <Stack.Screen name='ChannelPfp' component={ChannelPfp} />
        <Stack.Screen name='ChannelInvite' component={ChannelInvite} />
      </Stack.Group>
      
      
      <Stack.Group screenOptions={{presentation: 'modal' }}>
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
        <Stack.Screen name='Repost' component={Repost} />
        <Stack.Screen name='ViewingProfile' component={ViewingProfile} />
        <Stack.Screen name='ViewingFriends' component={ViewingFriends} />
         <Stack.Screen name='ViewingFollowers' component={ViewingFollowers} />
        <Stack.Screen name='ViewingCliqs' component={ViewingCliqs} />
        <Stack.Screen name='SpecificTheme' component={SpecificTheme} />
        <Stack.Screen name='GroupList' component={GroupList} />
        <Stack.Screen name='Mention' component={Mention} />
        
      </Stack.Group>
      <Stack.Group screenOptions={{presentation: 'modal' }}>
        <Stack.Screen name='ReportPage' component={ReportPage} />
        <Stack.Screen name='SendingModal' component={SendingModal} />
        
        
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
        <Stack.Screen name='Repost' component={Repost} />
      <Stack.Screen name='SpecificTheme' component={SpecificTheme} />
      <Stack.Screen name='Likes' component={Likes}/>
      <Stack.Screen name='Mention' component={Mention} />
      <Stack.Screen name='Chat' component={ChatScreen} />
      <Stack.Screen name='NotificationScreen' component={NotificationScreen} />
      <Stack.Screen name="PersonalChat" component={PersonalChatScreen}/>
      <Stack.Screen name='HomeScreenPreview' component={HomeScreenPreview}/>
    </Stack.Group>
    <Stack.Group screenOptions={{presentation: 'modal' }}>
        <Stack.Screen name='ReportPage' component={ReportPage} />
        
        
        
      </Stack.Group>
  </Stack.Navigator>
  )
}
const MessageStack = () => {
  return (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Group>
      <Stack.Screen name="Chat" component={ChatScreen} initialParams={{sending: false, message: true}}/>
      <Stack.Screen name="PersonalChat" component={PersonalChatScreen}/>
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
        <Stack.Screen name='Repost' component={Repost} />
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
        <Stack.Screen name='ReportPage' component={ReportPage} />
        <Stack.Screen name='SendingModal' component={SendingModal} />
      </Stack.Group>
      </Stack.Navigator>
  )
}
    return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? 'home'
                : 'home-outline';
            } else if (route.name === 'Users') {
              iconName = 'face-man-outline'
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
    
    <Tab.Screen name='Cliqs' component={GroupStack}/>
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
    <Tab.Screen name='New Post' component={PostStack} options={{unmountOnBlur: true}}  />
           
          {/* <Tab.Screen name='Users' component={PeopleStack} /> */}
        
        <Tab.Screen name='Themes' component={ThemeStack} />
        <Tab.Screen name='Profile' component={ProfileStack} />
          
          </Tab.Navigator>
    )
}
export default TabNavigator