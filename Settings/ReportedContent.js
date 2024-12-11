import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, FlatList, } from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import { Divider, Menu, Provider } from 'react-native-paper'
import {MaterialCommunityIcons, Entypo} from '@expo/vector-icons';
import RegisterHeader from '../Components/RegisterHeader';
import ThemeHeader from '../Components/ThemeHeader';
import { useNavigation } from '@react-navigation/native';
import { getDoc, doc, onSnapshot, query, collection, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import FastImage from 'react-native-fast-image';
import useAuth from '../Hooks/useAuth';
import { useFonts, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
const ReportedContent = ({route}) => {
    const {reported, groupId} = route.params;
    const navigation = useNavigation();
    const [data, setData] = useState([]);
    const [sortVisible, setSortVisible] = useState(false)
    const [loading, setLoading] = useState(true);
    const [discrimination, setDiscrimination] = useState(false);
    const [discriminationData, setDiscriminationData] = useState([]);
    const [offensive, setOffensive] = useState(false);
    const [offensiveData, setOffensiveData] = useState([]);
    const [gore, setGore] = useState(false);
    const [goreData, setGoreData] = useState([]);
    const [nudity, setNudity] = useState(false);
    const [nudityData, setNudityData] = useState([]);
    const [scam, setScam] = useState(false);
    const theme = useContext(themeContext)
    const [scamData, setScamData] = useState([]);
    const [spam, setSpam] = useState(false);
    const [spamData, setSpamData] = useState([]);
    const [toxic, setToxic] = useState(false);
    const [toxicData, setToxicData] = useState([]);
    const [violent, setViolent] = useState(false);
    const [violentData, setViolentData] = useState([]);
    const [other, setOther] = useState(false)
    const [otherData, setOtherData] = useState([]);
    const [requests, setRequests] = useState([]);
    const [menuVisible, setMenuVisible] = useState([]);
    const openSortMenu = () => setSortVisible(true);
    const closeSortMenu = () => setSortVisible(false)
    const {user} = useAuth();
    function closeMenu(item) {
    const updatedThemes = [...data];
    const objectIndex = data.findIndex(obj => obj.id === item.item.id)
    updatedThemes[objectIndex].open = false
    setData(updatedThemes)
  }
  function openMenu(item) {
    const updatedThemes = [...data];
    const objectIndex = updatedThemes.findIndex(obj => obj.id === item.item.id)
    updatedThemes[objectIndex].open = true
    setData(updatedThemes)
  }
    useEffect(() => {
      reported.map(async(item) => {
        //console.log(item)
        const docSnap = await getDoc(doc(db, 'groups', groupId, 'posts', item.content))
        if (docSnap.exists()) {
          setData(prevState => [...prevState, {id: item.id, open: false, ...item, postInfo: {id: docSnap.id, ...docSnap.data()}}])
        }
        
      })
    }, [route.params?.reported])
    useEffect(()=> {
      let unsub;
      const fetchCards = () => {
        //const passes = await getDocs(collection(db, 'users', user.uid, 'passes')).then((snapshot) => snapshot.docs.map((doc) => doc.id));
        unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'requests'), where('actualRequest', '==', true)), (snapshot) => {
          setRequests(snapshot.docs.map((doc)=> ( {
            id: doc.id,
            ...doc.data()
            //info: doc.data().info
          })))
        })
      } 
      fetchCards();
      return unsub;
    }, []);
    useEffect(() => {
      //console.log(data)
        //setData(reported)
        reported.map((item) => {
          if (item.reason == 'Discrimination') {
            setDiscriminationData(prevState => [...prevState, item])
          }
          if (item.reason == 'General Offensiveness') {
            setOffensiveData(prevState => [...prevState, item])
          }
          if (item.reason == 'Gore/Excessive Blood') {
            setGoreData(prevState => [...prevState, item])
          }
          if (item.reason == 'Nudity/NSFW Sexual Content') {
            setNudityData(prevState => [...prevState, item])
          }
          if (item.reason == 'Scammer/Fraudulent User') {
            setScamData(prevState => [...prevState, item])
          }
          if (item.reason == 'Spam') {
            setSpamData(prevState => [...prevState, item])
          }
          if (item.reason == 'Toxic/Harassment') {
            setToxicData(prevState => [...prevState, item])
          }
          if (item.reason == 'Violent Behavior') {
            setViolentData(prevState => [...prevState, item])
          }
          if (item.reason == 'Other') {
            setOtherData(prevState => [...prevState, item])
          }
          //console.log(item)
        })
        setTimeout(() => {
            setLoading(false)
        }, 1000);
    }, [data])
    async function deleteItem(item) {
      //console.log(item)
      setData(data.filter(e => e.id !== item.id))
      await deleteDoc(doc(db, 'groups', groupId, 'reportedContent', item.id))
      
    }
    const renderContent = (item) => {
      //console.log(item)
      return (
        <View style={[styles.postContainer, {borderColor: theme.color}]}>
          {!item.item.postInfo.repost && item.item.postInfo.post[0].image ? <TouchableOpacity style={{borderRadius: 10, margin: '2.5%'}} onPress={!item.item.postInfo.repost ? () => navigation.navigate('Post', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId, video: false})
          : () => navigation.navigate('Repost', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId})}>
        <FastImage source={{uri: item.item.postInfo.post[0].post}} style={styles.image}/>
      </TouchableOpacity> : item.item.postInfo.repost && item.item.post.postInfo.post[0].image ? <TouchableOpacity style={{borderRadius: 10, margin: '2.5%'}} onPress={!item.item.postInfo.repost ? () => navigation.navigate('Post', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId, video: false})
          : () => navigation.navigate('Repost', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId})}>
        <FastImage source={{uri: item.item.postInfo.post.post[0].post}} style={styles.image}/>
      </TouchableOpacity>
      : !item.item.postInfo.repost && item.item.postInfo.post[0].video ? <TouchableOpacity style={{borderRadius: 10, margin: '2.5%'}} onPress={!item.item.postInfo.repost ? () => navigation.navigate('Post', {post: item.item.postInfo.id, requests: requests, video: true, name: item.item.postInfo.userId, groupId: groupId})
          : () => navigation.navigate('Repost', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId})}>
        <FastImage source={{uri: item.item.postInfo.post[0].thumbnail}} style={styles.image}/>
      </TouchableOpacity> : item.item.postInfo.repost && item.item.post.postInfo.post[0].video ?
      <TouchableOpacity style={{borderRadius: 10, margin: '2.5%'}} onPress={!item.item.postInfo.repost ? () => navigation.navigate('Post', {post: item.item.postInfo.id, requests: requests, video: true, name: item.item.postInfo.userId, groupId: groupId})
          : () => navigation.navigate('Repost', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId})}>
        <FastImage source={{uri: item.item.postInfo.post.post[0].thumbnail}} style={styles.image}/>
      </TouchableOpacity> : !item.item.postInfo.repost ?
      <TouchableOpacity style={{borderRadius: 10, margin: '2.5%'}} onPress={!item.item.postInfo.repost ? () => navigation.navigate('Post', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId, video: false})
          : () => navigation.navigate('Repost', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId})}>
        <Text style={[styles.image, {fontSize: item.item.post[0].textSize, color: theme.color,}]}>{item.item.post[0].value}</Text>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, margin: '2.5%'}} onPress={!item.item.postInfo.repost ? () => navigation.navigate('Post', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId, video: false})
          : () => navigation.navigate('Repost', {post: item.item.postInfo.id, requests: requests, name: item.item.postInfo.userId, groupId: groupId})}>
        <Text style={[styles.image, {fontSize: item.item.post.post[0].textSize, color: theme.color,}]}>{item.item.post.post[0].value}</Text>
      </TouchableOpacity>
      }
      
       <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{width: '90%'}}>
          <Text style={[styles.nameText, {color: theme.color}]} numberOfLines={1}>@{item.item.postInfo.username}</Text>
          <Text style={[styles.nameText, {fontSize: 12.29, fontFamily: 'Montserrat_500Medium', color: theme.color}]} numberOfLines={1}>Reason: {item.item.reason}</Text>
        </View>
        <Menu 
              visible={item.item.open}
              onDismiss={() => closeMenu(item)}
              contentStyle={{backgroundColor: theme.backgroundColor, borderWidth: 1, borderColor: "#71797E"}}
              anchor={<Entypo name='dots-three-vertical' size={20} style={{alignSelf: 'center', marginTop: 10}} color={theme.color} onPress={() => openMenu(item)}/>}>
             <Menu.Item onPress={() => deleteItem(item.item)} title="Delete" />
          </Menu>
          {/* <TouchableOpacity onPress={() => openMenu(item.item.data.content)} style={{alignSelf: 'center'}}>
            <Entypo name="dots-three-vertical"  size={17.5}/>
          </TouchableOpacity> */}
        </View>
        </View>
    )
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <Provider>
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
        <ThemeHeader text={"Reported Content"} video={false} backButton={true}/>
        <Divider borderBottomWidth={0.4}/>
        {loading ? <View style={styles.noContentContainer}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View>
        : data.length > 0 ? 
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: '2.5%'}}>
            <Text style={[styles.totalText, {color: theme.color}]}>Total reported content: {data.length}</Text>
            
          </View>
            
            <FlatList data={data}
            renderItem={renderContent}
            numColumns={2}
            keyExtractor={(item) => item.id}
            style={{marginTop: '2.5%'}}
            ListFooterComponent={<View style={{paddingBottom: 200}}/>}
            />
            {/*  */}
        </View> : data.length == 0 ? <View style={styles.noContentContainer}>
                <Text style={[styles.noContentText, {color: theme.color}]}>No Reported Content! Yay!</Text>
                <MaterialCommunityIcons name='emoticon-happy-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
            </View>: <View style={{flex: 1, alignItems: 'center', justifyContent:'center'}}>
        <ActivityIndicator size={'large'} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View>}
            
    </View>
    </Provider>
  )
}

export default ReportedContent

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContainer: {
        marginTop: '5%',
        marginLeft: '5%', 
        marginRight: '5%'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    noContentText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium'
        //textAlign: 'center',
    },
    noContentContainer: {
        zIndex: 3,
        alignItems: 'center',
        marginTop: '60%'
        //marginTop: '-5%'
    },
    totalText: {
         fontSize: 19.20,
         fontFamily: 'Montserrat_500Medium',
      color: "#090909",
      padding: 5,
      textAlign: 'center',
      marginTop: '2.5%'
    },
    nameText: {
      fontSize: 15.36,
      fontFamily: 'Montserrat_500Medium',
      textAlign: 'left',
      paddingBottom: 5
    },
    image: {
        height: 152.615384615, width: 155, marginBottom: 7.5
    },
    postContainer: {
      borderWidth: 1,
      marginHorizontal: 10,
      padding: 5,
      marginBottom: 20,
      width: '44.6%', 
    }
})