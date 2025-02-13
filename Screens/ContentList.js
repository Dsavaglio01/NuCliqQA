import { ActivityIndicator, FlatList, Dimensions, Alert, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { collection, getDoc, getDocs, onSnapshot, query, where, doc, updateDoc, arrayRemove, limit, startAfter, orderBy } from 'firebase/firestore';
import useAuth from '../Hooks/useAuth';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import {MaterialCommunityIcons} from '@expo/vector-icons'
import NextButton from '../Components/NextButton';
import ThemeHeader from '../Components/ThemeHeader';
import { Divider, Provider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import MainButton from '../Components/MainButton';
import Checkbox from 'expo-checkbox'
import { db } from '../firebase';
import _ from 'lodash'
import themeContext from '../lib/themeContext';
import ProfileContext from '../lib/profileContext';
const ContentList = ({route}) => {
    const {likes, comments, saves, archived, cards, blocked, mentions} = route.params;
    const {user} = useAuth()
    const [posts, setPosts] = useState([]);
    const [editedCards, setEditedCards] = useState([]);
    const theme = useContext(themeContext)
    const [postDone, setPostDone] = useState(false);
    const [completePosts, setCompletePosts] = useState([]);
    const [current, setCurrent] = useState(false)
    const [lastVisible, setLastVisible] = useState();
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const profile = useContext(ProfileContext);
    useEffect(() => {
      if (mentions) {
      setPosts([]);
      const getLikes = async() => {
        const first = query(collection(db, "profiles", user.uid, 'mentions'), orderBy('timestamp', 'desc'), limit(10));
        const querySnapshot = await getDocs(first);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
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
        } 
        else if (comments) {
          const getLikes = async () => {
    try {
      setPosts([]);  // Clear posts only if you need to refresh the list
      const first = query(collection(db, "profiles", user.uid, 'comments'), orderBy('timestamp', 'desc'), limit(10));
      const querySnapshot = await getDocs(first);
      
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      
      // Use Promise.all to wait for all documents to be processed
      const postPromises = querySnapshot.docs.map(document => {
        return { id: document.id, ...document.data() };
      });
      
      const resolvedPosts = await Promise.all(postPromises);
      setPosts(prevState => [...prevState, ...resolvedPosts]);  // Batch update once

      // Delay to simulate loading or complete loading flag
      setTimeout(() => setPostDone(true), 1000);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
  };

  getLikes();
          
        } else if (saves) {
                setPosts([]);
                new Promise(resolve => {
      const getLikes = async() => {
        
        const first = query(collection(db, "profiles", user.uid, 'saves'), orderBy('timestamp', 'desc'), limit(10));
        const querySnapshot = await getDocs(first);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
        querySnapshot.forEach(async(document) => {
          //console.log(document.id)
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
      resolve()
      }).finally(() => setLoading(false))
      
        }
        else if (archived) {
          let unsub;
          const getArchivedPosts = async() => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'posts'), where('archived', '==', true), orderBy('timestamp', 'desc'), limit(10)), (snapshot) => {
              setPosts(snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
              })))
              setLastVisible(snapshot.docs[snapshot.docs.length - 1])
            })
          }
          getArchivedPosts();
          setTimeout(() => {
              setLoading(false)
            }, 1000);
            return unsub;
        }
        else if (cards) {
          const getCards = async() => {
            const docSnap = await getDoc(doc(db, 'profiles', user.uid))
            if (docSnap.exists()) {
              //console.log(docSnap.data().paymentMethodLast4)
              setEditedCards(docSnap.data().paymentMethodLast4)
            }
            /* if (docSnap.exists()) {
              setEditedCards(docSnap)
            } */
            
          }
          getCards()
        }
        else if (blocked) {
          const getUsers = async() => {
            let blockedUsers = (await getDoc(doc(db, 'profiles', user.uid))).data().blockedUsers
            blockedUsers.forEach(async(item) => {
              let user = await getDoc(doc(db, 'profiles', item))
              setPosts(prevState => [...prevState, {id: user.id, ...user.data()}])
            })
            
            //setPosts(blockedUsers)
          } 
          getUsers()
          //await getDoc(doc(db, ))
          //etPosts(await getDoc(doc(db, profiles)))
        }
        
    }, [])
    useEffect(() => {
      if (postDone && comments) {
    const processPosts = async () => {
      setLoading(true);
      //setCompletePosts([]);  // Only clear if necessary
      
      try {
        // Use Promise.all to handle async fetch for all posts
        const completePostPromises = posts.map(async (item) => {
          let secondSnap;
          if (item.video) {
            secondSnap = await getDoc(doc(db, 'videos', item.postId));
          } else {
            secondSnap = await getDoc(doc(db, 'posts', item.postId));
          }
          
          if (secondSnap.exists()) {
            return { id: item.id, postId: item.postId, comment: item.comment, ...secondSnap.data() };
          }
        });

        const resolvedCompletePosts = await Promise.all(completePostPromises);
        setCompletePosts(prevState => [...prevState, ...resolvedCompletePosts.filter(Boolean)]);  // Batch update
        
      } catch (error) {
        console.error("Error processing posts: ", error);
      } finally {
        setLoading(false);
      }
    };

    processPosts();
  }
    }, [postDone, posts, comments])
    //console.log(posts.length)
    /* useEffect(() => {
      if (done) {
        setPosts([...posts, ...tempPosts])
      }
    }, [done]) */
    //console.log(posts.length)
    //console.log(loading)render
    async function fetchMoreData() {
      if (lastVisible != undefined) {
        if (mentions) {
          setLoading(true)
        const getLikes = async() => {
            const first = query(collection(db, "profiles", user.uid, 'mentions'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10))
        const querySnapshot = await getDocs(first);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
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
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);
        }
        else if (comments && lastVisible) {
          //)
          setLoading(true);
  setPostDone(false);

  try {
    const first = query(
      collection(db, "profiles", user.uid, 'comments'),
      orderBy('timestamp', 'desc'),
      startAfter(lastVisible),
      limit(10)
    );

    const querySnapshot = await getDocs(first);

    const newData = await Promise.all(
      querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data(),
      }))
    );
    console.log(newData.length)

    if (newData.length > 0) {
      console.log(newData)
      setPosts([...newData]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

      // Process only the new comments
      //processPosts(newData); 
    }
  } catch (error) {
    console.error("Error fetching more data: ", error);
  } finally {
    setLoading(false);
    setPostDone(true);
  }
        }
        else if (saves) {
          setLoading(true)
        const getLikes = async() => {
            const first = query(collection(db, "profiles", user.uid, 'saves'), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10))
        const querySnapshot = await getDocs(first);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
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
          //console.log(tempPosts)
          getLikes();
          setTimeout(() => {
                    setLoading(false)
                  }, 1000);

        }
        else if (archived) {
          let unsub;
          const fetchCards = async () => {
            unsub = onSnapshot(query(collection(db, 'profiles', user.uid, 'posts'), where('archived', '==', true), orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(10)), (snapshot) => {
              const newData = [];
              setPosts(snapshot.docs.map((doc)=> {
                newData.push({
                  id: doc.id,
                ...doc.data(),
                })
                
              }))
              setPosts([...posts, ...newData])
              setLastVisible(snapshot.docs[snapshot.docs.length-1])
              
            })
          } 
          fetchCards();
          return unsub;
        }
        setTimeout(() => {
          setLoading(false)
        }, 1000);
      }
    }
    const renderBlocked = ({item, index}) => {
      return (
        <View key={index}>
            <View style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} >
                <View style={{flexDirection: 'row', marginLeft: '1%'}}>
                  {item.pfp ? 
                  <FastImage source={{uri: item.pfp}} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/> :
                  <FastImage source={require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
                  }
                    
                 <TouchableOpacity style={{paddingLeft: 20, width: '100%', justifyContent: 'center'}} onPress={() => navigation.navigate('ViewingProfile', {name: item.id, viewing: true})}>
                    <Text numberOfLines={1} style={[styles.name, {color: theme.color}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.message, {color: theme.color}]}>@{item.userName}</Text>
                </TouchableOpacity>
                </View>
              <View style={{ marginLeft: 'auto', marginRight: '1%'}}>
                <NextButton text={"Un-Block"} textStyle={{fontSize: 12.29, fontFamily: 'Montserrat_500Medium'}} onPress={() => unBlock(item)}/>
              </View>
            </View>
          </View>
      )
      
     //console.log(item.id)
    }
    //console.log(posts.length)
    async function unBlock(item) {
      //console.log(item)
      /* await updateDoc(doc(db, 'profiles', user.uid), {
        blockedUsers: arrayRemove(item.id)
      }).then(async() => await updateDoc(doc(db, 'profiles', item.id), {
        
      })) */
      await updateDoc(doc(db, 'profiles', user.uid), {
      blockedUsers: arrayRemove(item.id)
    }).then(async() => await updateDoc(doc(db, 'profiles', item.id), {
      usersThatBlocked: arrayRemove(user.uid)
    })).then(() => setPosts(posts.filter((e) => e.id != item.id)))
    }
    const renderPosts = ({item, index}) => {
      //console.log(item)
      return (
        !item.repost && item.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id,  name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.id,  name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post[0].post, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : item.repost && item.post.post[0].image ? 
      <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id,  name: item.userId, groupId: null, video: false}) : () =>navigation.navigate('Repost', {post: item.id,  name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post.post[0].post, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : !item.repost && item.post[0].video ? <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id,  name: item.userId, groupId: null, video: true}) : () =>navigation.navigate('Repost', {post: item.id,  name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post[0].thumbnail, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : item.repost && item.post.post[0].video ? <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625,}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id,  name: item.userId, groupId: null, video: true}) :() => navigation.navigate('Repost', {post: item.id,  name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post.post[0].thumbnail, priority: 'normal'}} style={styles.image}/>
      </TouchableOpacity> : !item.repost ?
      <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625, backgroundColor: "#262626"}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id,  name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.id,  name: item.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.post[0].textSize, color: theme.color}]}>{item.post[0].value}</Text>
      </TouchableOpacity> : <TouchableOpacity style={{borderRadius: 10, margin: '2.5%', width: 155,
    height: 155 / 1.015625, backgroundColor: "#262626"}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.id,  name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.id,  name: item.userId, groupId: null})}>
        <Text style={[styles.image, {fontSize: item.post.post[0].textSize, color: theme.color}]}>{item.post.post[0].value}</Text>
      </TouchableOpacity>
    ) 
    }
    const renderComments = ({item, index}) => {
      //console.log(item)
      return (
        <View style={{margin: '2.5%', flexDirection: 'row', marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#d3d3d3", paddingBottom: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', width: '89%'}}>
          <FastImage source={profile.pfp ? {uri: profile.pfp} : require('../assets/defaultpfp.jpg')} style={[styles.commentImage, {borderRadius: 8}]}/>
          <Text numberOfLines={2} style={[styles.addText, {color: theme.color}]}>You {item.reply != undefined ? 'replied' : 'commented'}: {item.comment} </Text>
        </View>
        {!item.repost && item.post[0].image ? 
      <TouchableOpacity style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: '-2.5%'}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.postId,  name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postId,  name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post[0].post, priority: 'normal'}} style={styles.commentImage}/>
      </TouchableOpacity> : item.repost && item.post.post[0].image ? 
      <TouchableOpacity style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: '-2.5%'}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.postId,  name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postId,  name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post.post[0].post, priority: 'normal'}} style={styles.commentImage}/>
      </TouchableOpacity>
      : !item.repost && item.post[0].video ? <TouchableOpacity style={{marginLeft: 'auto', flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: '-2.5%'}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.postId,  name: item.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postId,  name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post[0].thumbnail, priority: 'normal'}} style={styles.commentImage}/>
      </TouchableOpacity> : item.repost && item.post.post[0].video ? <TouchableOpacity style={{marginLeft: 'auto', flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: '-2.5%'}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.postId,  name: item.userId, groupId: null, video: true}) : () => navigation.navigate('Repost', {post: item.postId,  name: item.userId, groupId: null})}>
        <FastImage source={{uri: item.post.post[0].thumbnail, priority: 'normal'}} style={styles.commentImage}/>
      </TouchableOpacity> : !item.repost ?
      <TouchableOpacity style={{marginLeft: 'auto', flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: '-2.5%'}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.postId,  name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postId,  name: item.userId, groupId: null})}>
        <Text style={[styles.commentImage, {fontSize: item.post[0].textSize, color: theme.color}]}>{item.post[0].value}</Text>
      </TouchableOpacity> : <TouchableOpacity style={{marginLeft: 'auto', flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: '-2.5%'}} onPress={!item.repost ? () => navigation.navigate('Post', {post: item.postId,  name: item.userId, groupId: null, video: false}) : () => navigation.navigate('Repost', {post: item.postId,  name: item.userId, groupId: null})}>
        <Text style={[styles.commentImage, {fontSize: item.post.post[0].textSize, color: theme.color}]}>{item.post.post[0].value}</Text>
      </TouchableOpacity>}
        </View>
    ) 
    }
    //console.log(completePosts)
  const removePaymentMethod = (item) => {
    Alert.alert('Remove Payment Method?', 'If you remove payment method you will have to put in a new one when purchasing', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: async() => {
        await updateDoc(doc(db, 'profiles', user.uid), {
          paymentMethodID: null,
          paymentMethodLast4: []
        }).then(() => setEditedCards(editedCards.filter((e) => e != item)))
      }},
    ]);
  }
  const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    fetchMoreData()
  }, 500);
  return (
    <Provider>
    <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
 <>
      <ThemeHeader backButton={true} video={false} text={archived ? "Archived Posts" : likes ? "Liked Posts" : 
      comments ? "Commented Posts" : saves ? "Saved Posts" : mentions ? 'Mentioned Posts' : cards ? "Payment Methods" : blocked ? 
      "Blocked Users" : ""}/>
      <Divider borderWidth={0.4} borderColor={theme.color}/>
      </>
      {<>
       {saves && !loading && posts.length == 0 ? 
       <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Saved Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}} color={theme.color}/>
      
      </View>
      : archived && !loading && posts.length == 0 ?  
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Archived Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}} color={theme.color}/>
      
      </View> :
      cards && !loading && editedCards.length == 0 ?
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Saved Payment Methods Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}} color={theme.color}/>
      <View style={{marginTop: '10%', marginLeft: '5%', marginRight: '5%'}}>
        <NextButton text={"Explore Themes"} onPress={() => navigation.navigate('Themes', {screen: 'All', params: {name: null, groupId: null, goToMy: false, groupTheme: null, group: null, registers: false} })}/>
      </View>
      </View> :
       likes && !loading && posts.length == 0 ? 
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Liked Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}} color={theme.color}/>
      
      </View>  : 
      mentions && !loading && posts.length == 0 ?
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Mentioned Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}}  color={theme.color}/>
      </View> :
      blocked && !loading && posts.length == 0 ?
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Blocked Users Yet</Text> 
      <MaterialCommunityIcons name='emoticon-happy-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}} color={theme.color}/>
      </View> :
      comments && !loading && completePosts.length == 0 ? 
      <View style={{flex: 1, justifyContent: 'center', marginBottom: '50%'}}>
      <Text style={[styles.headerText, {color: theme.color}]}>No Commented Posts Yet!</Text> 
      <MaterialCommunityIcons name='emoticon-sad-outline' size={50} style={{alignSelf: 'center', marginTop: '5%'}} color={theme.color}/>
      
      </View> :
      cards ? 
      <View>
      {editedCards.map((item => {
        return (
          <View>
            <TouchableOpacity activeOpacity={1} onPress={() => setCurrent(!current)}  style={{flexDirection: 'row', alignItems: 'center', marginTop: '5%', marginLeft: '5%'}}>
                    <Checkbox value={current} onValueChange={() => setCurrent(!current)} color={current ? theme.theme != 'light' ? "#9EDAFF" : "#005278" : theme.color} />
                    <Text style={[styles.editText, {color: theme.color}]}>Card Ending in {item}</Text>
                </TouchableOpacity>
          
      {current ?
      <View style={{margin: '5%'}}>
          <MainButton text={"Remove Payment Method"} onPress={() => removePaymentMethod(item)}/>
        </View>: null} 

          </View>
        )
      }))}
      </View> : null}
      {posts.length > 0 ? <>
      <FlatList 
      data={comments ? completePosts : posts}
      renderItem={blocked ? renderBlocked : comments ? renderComments : renderPosts}
      keyExtractor={(item) =>item.id.toString()}
      numColumns={blocked || comments ? 1 : 2}
      scrollEnabled
      style={saves || mentions ? {margin: '5%', marginTop: '2.5%', marginLeft: '7.5%'} : {margin: '5%', marginTop: '2.5%',}}
      ListFooterComponent={<View style={{paddingBottom: 100}}/>}
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
    </Provider>
  )
}

export default ContentList

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    marginTop: '5%'
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
  editText: {
    fontSize: 19.20,
    fontFamily: 'Montserrat_500Medium',
    marginLeft: '5%'
  },
  friendsContainer: {
      backgroundColor: '#fff',
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '105%',
        marginLeft: '-2.5%'
    },
    name: {
        fontSize: 15.36,
        paddingTop: 5,
        fontFamily: 'Montserrat_700Bold',
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
      padding: 7.5,
      paddingLeft: 15,
      fontFamily: 'Montserrat_500Medium',
      maxWidth: '75%'
    }
})