import { ActivityIndicator, FlatList, Dimensions, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState, } from 'react'
import { collection, getDoc, onSnapshot, query, where, doc, deleteDoc, limit, startAfter, orderBy } from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import ThemeHeader from '../Components/ThemeHeader';
import { Divider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { db } from '../firebase';
import _ from 'lodash';
import themeContext from '../lib/themeContext';
const CliqueContentList = ({route}) => {
    const {likes, comments, saves, archived, posts, id, name, mentions} = route.params;
    const {user} = useAuth()
    const [contentDone, setContentDone]= useState(false);
    const theme = useContext(themeContext)
    const [content, setContent] = useState([]);
    const [pfp, setPfp] = useState(null);
    const [completePosts, setCompletePosts] = useState([]);
    const [requests, setRequests] = useState([]);
    const [lastVisible, setLastVisible] = useState();
    const [loading, setLoading] = useState(true);
    const [isDead, setIsDead] = useState(false);
    const navigation = useNavigation();
    useEffect(() => {
      if (comments) {
        const getData = async() => {
          const docSnap = await getDoc(doc(db, 'profiles', user.uid))
          setPfp(docSnap.data().pfp)
        }
        getData()
      }
    }, [comments])
    useEffect(() => {
      if (contentDone) {
        setCompletePosts([]);
        if (comments) {
          content.map(async(item) => {
            
          const secondSnap = await getDoc(doc(db, 'groups', id, 'posts', item.postId))
              if (secondSnap.exists()) {
                setCompletePosts(prevState => [...prevState, {id: item.id, comment: item.comment, ...secondSnap.data()}])
              }
          
        })
        }
      }
    }, [contentDone])
    useEffect(() => {
      const getData = async() => {
        const docSnap = await getDoc(doc(db, 'groups', id))
        if (docSnap.exists()) {
        if (likes) {
          setLoading(true)
          let unsub;
          const getLikes = async() => {
            unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'likes'), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
              //console.log(snapshot)
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                
                const secondSnap = await getDoc(doc(db, 'groups', id, 'posts', document.id))
              if (secondSnap.exists() && !content.some(doc2 => doc2.id === secondSnap.id)) {
                setContent(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
              }
              })
            })
          } 
          getLikes();
          setTimeout(() => {
          setLoading(false)
        }, 1000);
        return unsub;
        } 
        else if (mentions) {
          setLoading(true)
          let unsub;
          const getLikes = async() => {
            unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'mentions'), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
              //console.log(snapshot)
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                
                const secondSnap = await getDoc(doc(db, 'groups', id, 'posts', document.id))
              if (secondSnap.exists() && !content.some(doc2 => doc2.id === secondSnap.id)) {
                setContent(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
              }
              })
            })
          } 
          getLikes();
          setTimeout(() => {
          setLoading(false)
        }, 1000);
        return unsub;
        }
        else if (comments) {
          let unsub;
          const getComments = async() => {
            unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'comments'), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              setContent(snapshot.docs.map((document) => ({
                
                id: document.id,
                ...document.data()
              })))
            })
          }
          getComments();
            setTimeout(() => {
              setContentDone(true)
          setLoading(false)
        }, 1000);
        return unsub; 
        } else if (saves) {
          let unsub;
          const getLikes = async() => {
            unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'saves'), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
              //console.log(snapshot)
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                
                const secondSnap = await getDoc(doc(db, 'groups', id, 'posts', document.id))
              if (secondSnap.exists() && !content.some(doc2 => doc2.id === secondSnap.id)) {
                setContent(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
              }
              })
            })
          } 
          getLikes();
          setTimeout(() => {
          setLoading(false)
        }, 1000);
        return unsub;
        }
        else if (archived) {
          let unsub;
          const getArchivedPosts = async() => {
            unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'archivedPosts'), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
            snapshot.forEach(async(document) => {
              const secondSnap = await getDoc(doc(db, 'groups', id, 'posts', document.id))
              if (secondSnap.exists() && !content.some(doc2 => doc2.id === secondSnap.id)) {
                setContent(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
              }
              else {
                await deleteDoc(doc(db, 'profiles', user.uid, 'saves', document.id))
              }
            })
            })
          }
          getArchivedPosts();
          setTimeout(() => {
              setLoading(false)
            }, 1000);
            return unsub;
        }
        //&& !content.some(doc2 => doc2.id === secondSnap.id)
        else if (posts) {
          let unsub;
                const fetchCards = () => {
                    unsub = onSnapshot(query(collection(db, 'groups', id, 'posts'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
                    //console.log(snapshot.docs.length)
                    setContent(snapshot.docs.map((doc)=> ( {
                        id: doc.id,
                        ...doc.data()
                    })))
                    setLastVisible(snapshot.docs[snapshot.docs.length - 1])
                    })
                }
                fetchCards();
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
                return unsub;
                    }
                  }
                  else {
                    setIsDead(true)
                  }
                }
                  getData()
    }, [])
    function fetchMoreData() {
      
      if (lastVisible != undefined) {
        //setLoading(true)
        if (likes) {
          setLoading(true)
        let unsub;
           const getLikes = () => {
            unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'likes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
            //unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'likes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                
                const secondSnap = await getDoc(doc(db, 'groups', id, 'posts', document.id))
                //console.log('s')
              if (secondSnap.exists() && !content.some(doc2 => doc2.id === secondSnap.id)) {
                setContent(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
              }
              })
            })
          } 
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);
          return unsub;
        }
        else if (mentions) {
        setLoading(true)
        let unsub;
           const getLikes = () => {
            unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'mentions'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
            //unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'likes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                
                const secondSnap = await getDoc(doc(db, 'groups', id, 'posts', document.id))
                //console.log('s')
              if (secondSnap.exists() && !content.some(doc2 => doc2.id === secondSnap.id)) {
                setContent(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
              }
              })
            })
          } 
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);
          return unsub;
        }
        else if (comments) {
          setContentDone(false)
          let unsub;
          let newData = []
          const getLikes = async() => {
             unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'comments'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map((doc) => {
            if (!content.some((doc2 => doc2.id == doc.id))) {
              newData.push({
              id: doc.id,
              ...doc.data()
            })
            }
          })
          if (newData.length > 0 ) {
            setLoading(true)
            
          setContent([...content, ...newData])
          //console.log(posts.map((item) => (item.id)))
          setLastVisible(snapshot.docs[snapshot.docs.length-1])
          }
            })
          } 
          getLikes();
          setTimeout(() => {
            setContentDone(true)
                    setLoading(false)
                  }, 1000);
          return unsub;
        }
        else if (saves) {
          setLoading(true)
        let unsub;
           const getLikes = () => {
            unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'saves'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
            //unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'likes'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              snapshot.docs.map(async(document) => {
                
                const secondSnap = await getDoc(doc(db, 'groups', id, 'posts', document.id))
                //console.log('s')
              if (secondSnap.exists() && !content.some(doc2 => doc2.id === secondSnap.id)) {
                setContent(prevState => [...prevState, {id: secondSnap.id, ...secondSnap.data()}])
              }
              })
            })
          } 
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);
          return unsub;
        }
        else if (archived) {
          let unsub;
          const fetchCards = async () => {
            unsub = onSnapshot(query(collection(db, 'groups', id, 'profiles', user.uid, 'archivedPosts'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
              const newData = [];
              setContent(snapshot.docs.map((doc)=> {
                newData.push({
                  id: doc.id,
                ...doc.data(),
                })
                
              }))
              setContent([...content, ...newData])
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              
            })
          } 
          fetchCards();
          return unsub;
        }
         else if (posts) {
          let unsub;
                const fetchCards = () => {
                    unsub = onSnapshot(query(collection(db, 'groups', id, 'posts'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
                    //console.log(snapshot.docs.length)
                    setContent(snapshot.docs.map((doc)=> ( {
                        id: doc.id,
                        ...doc.data()
                    })))
                    setLastVisible(snapshot.docs[snapshot.docs.length - 1])
                    })
                }
                fetchCards();
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
                return unsub;
                    }
        setTimeout(() => {
          setLoading(false)
        }, 1000);
      }
    }
    const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    fetchMoreData()
  }, 500);

    const renderPosts = ({item, index}) => {
      //console.log(item)
      return (
        item.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 8, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={() => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: id})}>
        <FastImage source={{uri: item.post[0].post, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : item.post[0].video ? <TouchableOpacity style={{borderRadius: 8, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={() => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: id})}>
        <MaterialCommunityIcons name='play' size={30} style={{position: 'absolute', zIndex: 3, left: 130}} color={"#000"}/>
        <FastImage source={{uri: item.post[0].thumbnail, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : 
      <TouchableOpacity style={{borderRadius: 8,  margin: '2.5%', width: 155,
    height: 155 / 1.015625, backgroundColor: "#262626"}} onPress={() => navigation.navigate('Post', {post: item.id, name: item.userId, requests: requests, groupId: id})}>
        <Text style={[styles.image, {fontSize: item.post[0].textSize, color: theme.color}]}>{item.post[0].value}</Text>
      </TouchableOpacity>
    ) 
    }
    const renderComments = ({item, index}) => {
      return (
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '89%'}}>
          <FastImage source={pfp ? {uri: pfp} : require('../assets/defaultpfp.jpg')} style={[styles.commentImage, {borderRadius: 8}]}/>
          <Text numberOfLines={2} style={[styles.addText, {color: theme.color}]}>You {item.reply != undefined ? 'replied' : 'commented'}: {item.comment} </Text>
        </View>
        {item.post[0].image ? 
      <TouchableOpacity style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} onPress={() => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: id})}>
        <FastImage source={{uri: item.post[0].post, priority: 'normal'}} style={styles.commentImage}/>
      </TouchableOpacity> : item.post[0].video ? <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignItems: 'center'}} onPress={() => navigation.navigate('Post', {post: item.id, requests: requests, name: item.userId, groupId: id})}>
        <FastImage source={{uri: item.post[0].thumbnail, priority: 'normal'}} style={styles.commentImage}/>
      </TouchableOpacity> :
      <TouchableOpacity style={{borderRadius: 10, marginLeft: 'auto', alignItems: 'center'}} onPress={() => navigation.navigate('Post', {post: item.id, name: item.userId, requests: requests, groupId: id})}>
        <Text style={[styles.commentImage, {fontSize: item.post[0].textSize, color: theme.color}]}>{item.post[0].value}</Text>
      </TouchableOpacity>}
        </View>
    ) 
    }
  return (
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
      {isDead ?
       <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginBottom: '25%'}}>
        <Text style={{fontSize: 24, padding: 10, fontFamily: 'Montserrat_500Medium'}}>Sorry, cliq is unavailable</Text>
        </View> : 
        <>
      <ThemeHeader backButton={true} text={archived ? `Archived ${name} Posts` : likes ? `Liked ${name} Posts` : 
      comments ? `Commented ${name} Posts` : saves ? `Saved ${name} Posts` : posts ? `${name} Posts` : mentions ? `Mentioned ${name} Posts` : ""}/>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      {<>
       {saves && !loading && content.length == 0 ? 
       <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Saved Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
      </View>
      : archived && !loading && content.length == 0 ?  
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Archived Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
      </View> :
       likes && !loading && content.length == 0 ? 
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Liked Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
      </View> : 
      mentions && !loading && content.length == 0 ?
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Mentioned Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' color={theme.color} size={50} style={{alignSelf: 'center', marginTop: '5%'}}/>
      </View> : 
      posts && !loading && content.length == 0 ?
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Posts Yet</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}} color={theme.color}/>
      </View> :
      comments && !loading && content.length == 0 ? 
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Commented Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}} color={theme.color}/>
      </View> : null}
      {comments ? completePosts.length > 0 ? <FlatList 
      data={completePosts}
      renderItem={renderComments}
      keyExtractor={(item) =>item.id.toString()}
      style={comments ? {margin: '5%'} : {margin: '5%', marginLeft: '7%', marginTop: '2.5%'}}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      /> : null : content.length > 0 ? 
    <FlatList 
      data={content}
      renderItem={renderPosts}
      keyExtractor={(item) =>item.id.toString()}
      numColumns={2}
      style={comments ? {margin: '5%'} : {margin: '5%', marginLeft: '7%', marginTop: '2.5%'}}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      /> : null}
      {/* {content.length > 0 ? <>
      
      </>: null} */}
      {loading ? <View style={{flex: 1, alignItems: 'center', justifyContent:'flex-end'}}>
        <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/> 
        </View> : null}
       </>
      }
      </>}
    </View>
  )
}

export default CliqueContentList

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    marginTop: '5%'
    },
  headerText: {
    fontSize: 24,
    textAlign: 'center',
    padding: 10,
    margin: '2.5%',
    //marginTop: '8%',
    fontFamily: 'Montserrat_700Bold'
  },
  image: {
     width: Dimensions.get('screen').height / 5.45,
    height: (Dimensions.get('screen').height / 5.45) / 1.015625,
    borderRadius: 8
  },
  editText: {
    fontSize: 19.20,
    marginLeft: '5%',
    fontFamily: 'Montserrat_500Medium'
  },
    name: {
        fontSize: 15.36,
        paddingTop: 5,
        fontFamily: 'Montserrat_700Bold'
        //width: '95%'
    },
    message: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        paddingBottom: 5
    },
    commentImage: {
      height: 40, width: 40, alignSelf: 'center', borderWidth: 1,
    },
    addText: {
      fontSize: 15.36,
      color: "#090909",
      padding: 7.5,
      paddingLeft: 15,
      fontFamily: 'Montserrat_500Medium',
      maxWidth: '90%'
    }
})