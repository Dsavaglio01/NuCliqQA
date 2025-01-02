import { StyleSheet, Text, View, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { Provider } from 'react-native-paper';
import { query, onSnapshot, getDocs, collection, where, doc, startAfter, orderBy, limit} from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import { db } from '../firebase';
import {BACKEND_URL} from "@env"
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash'
import themeContext from '../lib/themeContext';
import FirstTimeModal from '../Components/FirstTimeModal';
import VideoPostComponent from '../Components/VideoPostComponent';
import ProfileContext from '../lib/profileContext';
const Vidz = ({route}) => {
  const profile = useContext(ProfileContext)
  const [posts, setPosts] = useState([]);
  const [reloadPage, setReloadPage] = useState(true);
  const [postDone, setPostDone] = useState(false);
  const [tempPosts, setTempPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [lastRecommendedPost, setLastRecommendedPost] = useState(null);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const theme = useContext(themeContext);
  const [lastVisible, setLastVisible] = useState();
  const {user} = useAuth();
useEffect(() => {
  if (route.params?.reloading) {
    setPosts([]);
    setReloadPage(true)
  }
}, [route.params?.reloading])
    
    
    //console.log(firstTime)
    useEffect(() => {
      if (route.params?.firstTime) {
        //console.log('first')
        setIsFirstTime(false)
      }
    }, [route.params?.firstTime])
  useEffect(() => {
    let unsub;
    //const reportedMessages = (await getDoc(doc(db, 'profiles', user.uid))).data().reportedMessages
     unsub = onSnapshot(doc(db, "profiles", user.uid), (doc) => {
          setReportedPosts(doc.data().reportedPosts)
          setReportedComments(doc.data().reportedComments)
    });
    return unsub;
  }, [onSnapshot])
    
    useEffect(() => {
      if (reloadPage && profile.blockedUsers != null) {

        setTempPosts([])
        setPostDone(false)
        let fetchedCount = 0;
        new Promise(resolve => {
          const fetchCards = async () => {
            const q = query(collection(db, 'videos'), where('private', '==', false), orderBy('timestamp', 'desc'), limit(3));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (profile.blockedUsers.includes(doc.data().userId) || doc.data().blockedUsers.includes(user.uid)) {
                  fetchedCount++; // Increment blocked count
                } else {
                  setTempPosts(prevState => [...prevState, { id: doc.id, loading: false, postIndex: 0, ...doc.data() }]);
                }
                
            });
            if (fetchedCount === 3 && tempPosts.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'videos'),
                where('private', '==', false),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(3)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                setTempPosts(prevState => [...prevState, { id: doc.id, loading: false, postIndex: 0, ...doc.data() }]);
              })
            }

            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
          }
          fetchCards();
           resolve(); // Resolve the Promise after setCompleteMessages is done
      }).finally(() => {setLoading(false); setPostDone(true); setReloadPage(false)}); 
          
      }
      
    }, [posts, reloadPage, profile.blockedUsers])
    
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
  function fetchMoreData() {
      if (recommendedPosts.length < 30) {
      if (lastVisible != undefined) {
    setLoading(true)
    let newData = [];
    let fetchedCount = 0;
      const fetchCards = async () => {
        newData = [];
        const q = query(collection(db, 'videos'), where('private', '==', false), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(4));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              if (profile.blockedUsers.includes(doc.data().userId) || doc.data().blockedUsers.includes(user.uid)) {
                fetchedCount++;
              }
              else {
                newData.push({
                    id: doc.id,
                    postIndex: 0,
                    loading: false,
                    ...doc.data()
                  })
              }
                
              
            });
            if (fetchedCount === 4 && newData.length === 0) {
              // All 3 posts were blocked, fetch more
              const nextQuery = query(
                collection(db, 'videos'),
                where('private', '==', false),
                orderBy('timestamp', 'desc'),
                startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]), // Start after last doc
                limit(4)
              );
              const nextSnapshot = await getDocs(nextQuery);
              nextSnapshot.forEach((doc) => {
                newData.push({
                    id: doc.id,
                    postIndex: 0,
                    loading: false,
                    ...doc.data()
                  })
              })
            }
            if (newData.length > 0) {
                setTempPosts([...tempPosts, ...newData])
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1])
              }
      }
      fetchCards();
        setTimeout(() => {
          setLoading(false)
        }, 1000);
    }
    }
    else {
      //console.log('first')
      setLoading(true)
    const getRecommendations = async() => {
      await fetch(`${BACKEND_URL}/api/getMoreRecommendedPosts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId: user.uid, recommId: lastRecommendedPost})
          })
        .then(response => response.json())
        .then(responseData => {
          if (responseData.recomms) {
            //console.log(responseData.recomms)
            responseData.recomms.map((e) => {
              setRecommendedPosts(prevState => [...prevState, e.id])
              setLastRecommendedPost(responseData.recommId)
            })
            //setRecommendedPosts(responseData.recomms)
          }
          //console.log(responseData)
          // Handle the response from the server
          
        })
        .catch(error => {
          // Handle any errors that occur during the request
          console.error(error);
        })
    }
    setTimeout(() => {
      setLoading(false)
    }, 1000);
    getRecommendations()
    }
    
  }
  const handleLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    console.log(height)
  };

  return (
    <Provider>
      <View style={styles.container}>
        <FirstTimeModal isFirstTime={isFirstTime} vidz={true} closeFirstTimeModal={() => setIsFirstTime(false)}/>
        <View style={styles.innerContainer} onLayout={handleLayout}>
          <View style={styles.headerContainer}>
            <View style={{marginTop: '3%'}}>
              <FastImage source={require('../assets/DarkMode5.png')} style={styles.logo}/>
            </View>
            <Text style={{fontSize: 37.5, fontWeight: '200', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", marginLeft: '6%'}}>|</Text>
            <Text numberOfLines={1} style={[styles.header, { fontFamily: 'Montserrat_500Medium', color: theme.theme != 'light' ? "#9EDAFF" : "#005278", backgroundColor: theme.backgroundColor}]}>{"Vidz For You"}</Text>
          </View>
        </View>
        {postDone && user && tempPosts.length > 0 ? <>
        <VideoPostComponent data={tempPosts} home={true} loading={loading} lastVisible={lastVisible} actualClique={null}
        blockedUsers={profile.blockedUsers} openPostMenu={null} clique={false} cliqueId={null} pfp={profile.pfp} ogUsername={profile.username} 
        admin={false} edit={false} caption={null} notificationToken={profile.notificationToken} smallKeywords={profile.smallKeywords} 
        largeKeywords={profile.largeKeywords} reportedPosts={reportedPosts} reportedComments={reportedComments}/>
        </>
        : loading && !lastVisible ? 
        <View style={{alignItems: 'center', flex: 1, backgroundColor: theme.backgroundColor, justifyContent: 'center'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> : null}
      </View>
    </Provider>
  )
}

export default Vidz

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212'
  },
  innerContainer: {
      marginTop: '8%',
      marginBottom: '2.5%',
      marginLeft: '15.85%',
      marginRight: '9%',
      justifyContent: 'space-evenly',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: "#121212"
    },
    headerContainer: {
      flexDirection: 'row', 
      alignItems: 'center'
    },
    header: {
      fontSize: 19.20,
      fontFamily: 'Montserrat_500Medium',
      color: "#9EDAFF",
      padding: 10,
      paddingLeft: 0,
      marginTop: 8,
      alignSelf: 'center',
      width: '60%',
      marginLeft: '5%',
    },
    logo: {
      height: 27.5, 
      width: 68.75
    }
})