import { ActivityIndicator, FlatList, StyleSheet, Text, Keyboard, View, TouchableWithoutFeedback, Dimensions, } from 'react-native'
import React, { useContext, useEffect, useState, useMemo } from 'react'
import { collection, getDoc, onSnapshot, getDocs, query, where, doc, limit, startAfter, orderBy } from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import NextButton from '../Components/NextButton';
import ThemeHeader from '../Components/ThemeHeader';
import { Divider, Provider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { db } from '../firebase';
import _ from 'lodash'
import { useFonts, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import themeContext from '../lib/themeContext';
import MiniPost from '../Components/MiniPost';
const LikedPosts = () => {
    const {user} = useAuth()
    const [posts, setPosts] = useState([]);
    const theme = useContext(themeContext)
    const [completePosts, setCompletePosts] = useState([]);

    const [requests, setRequests] = useState([]);
    const [lastVisible, setLastVisible] = useState();
    
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    useEffect(()=> {
      let unsub;
      const fetchCards = async () => {
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
      setPosts([]);
      const getLikes = async() => {
        const first = query(collection(db, "profiles", user.uid, 'likes'), orderBy('timestamp', 'desc'), limit(10));
        const querySnapshot = await getDocs(first);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
        console.log(querySnapshot.docs.length)
        querySnapshot.forEach(async(document) => {
          //console.log(doc.id)
          if (document.data().video) {
            const secondSnap = await getDoc(doc(db, 'videos', document.id));
                  if (secondSnap.exists()) {
                    setPosts(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
                    // Render the new post here using the data from secondSnap
                  }
          }
          else {
            const secondSnap = await getDoc(doc(db, 'posts', document.id));
                  if (secondSnap.exists()) {
                    setPosts(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
                    // Render the new post here using the data from secondSnap
                  }
          }
          
        });
      }
      getLikes()
      setTimeout(() => {
            setLoading(false)
          }, 1000);
          
        
    }, [])
    //console.log(posts.length)
    /* useEffect(() => {
      if (done) {
        setPosts([...posts, ...tempPosts])
      }
    }, [done]) */
    //console.log(posts.length)
    
    function fetchMoreData() {
      //console.log('b')
      if (lastVisible != undefined) {
          setLoading(true)
           const getLikes = async() => {
            const first = query(collection(db, "profiles", user.uid, 'likes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10))
        const querySnapshot = await getDocs(first);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
        querySnapshot.forEach(async(document) => {
          //console.log(doc.id)
          const secondSnap = await getDoc(doc(db, 'posts', document.id));
                  if (secondSnap.exists()) {
                    setPosts(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
                    // Render the new post here using the data from secondSnap
                  }
        });
      }
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);
                }
    }
    const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_500Medium,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }


    const renderPosts = ({item, index}) => {
      //console.log(item)
      return (
      !item.repost && item.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.id, requests: requests, name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post[0].post, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : item.repost && item.post.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.id, requests: requests, name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post.post[0].post, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : !item.repost && item.post[0].video ? <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.id, requests: requests, name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post[0].thumbnail, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : item.repost && item.post.post[0].video ? <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.id, requests: requests, name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post.post[0].thumbnail, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : !item.repost ?
      <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625, backgroundColor: "#262626"}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: null, video: false}) : () =>  navigation.navigate('Repost', {post: item.id, requests: requests, name: item.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.post[0].textSize, color: theme.color}]}>{item.post[0].value}</Text>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625, backgroundColor: "#262626"}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.id, requests: requests, name: item.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.post.post[0].textSize, color: theme.color}]}>{item.post.post[0].value}</Text>
      </TouchableOpacity>
      )
    }


  const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    fetchMoreData()
  }, 500);
  return (
    <Provider>
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      
        <View>
 <>
      <ThemeHeader backButton={true} video={false} text={"Liked Posts"}/>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      </>
      {<>
       {!loading && posts.length == 0 ? 
      <View style={{alignItems: 'center', justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Liked Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
      </View> : null}
      {posts.length > 0 ? <>
      <FlatList 
      data={posts}
      renderItem={(item, index) => <MiniPost item={item.item} index={index} repost={false} name={user.uid}/>}
      keyExtractor={(item) =>item.id.toString()}
      numColumns={3}
      scrollEnabled
      style={{margin: '5%', marginTop: '2.5%', marginLeft: '7.5%', height: '100%'}}
      ListFooterComponent={loading ? (
              <View style={{ alignItems: 'center', paddingBottom: 140}}> 
                <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} />
              </View>
            ) : (
              <View style={{ paddingBottom: 140 }} /> 
            )}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      />
      </>: null}
      {loading ? <View style={{flex: 1, alignItems: 'center', justifyContent:'center', marginTop: '5%'}}>
        <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : null}
       </>
      }
      </View>
      
      
    </View>
    </Provider>
  )
}

export default LikedPosts

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
    padding: 10,
    margin: '2.5%',
    //marginTop: '8%',
    fontWeight: '700'
  },
  image: {
     width: Dimensions.get('screen').height / 5.45,
    height: (Dimensions.get('screen').height / 5.45) / 1.015625,
    borderRadius: 8
  },

  

})