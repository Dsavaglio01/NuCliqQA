import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React, {useMemo, useEffect, useState} from 'react'
import FastImage from 'react-native-fast-image'
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { collection, query, orderBy, limit, startAfter, Timestamp} from 'firebase/firestore';
import { db } from '../firebase';
import StoryModal from './Posts/StoryModal';
import { randomUUID } from 'expo-crypto';
const STORY_ITEM_FAKE = [{background: 'https://firebasestorage.googleapis.com/v0/b/nucliq-c6d24.appspot.com/o/themes%2FSF7tgtPBmFSukQiRBKF7K8Tbt383Leaves1716337081160theme.jpg?alt=media&token=db009aad-ccc9-40fa-a93c-4d9b7dd47751',
    forSale: true, id: randomUUID(), post: [{id: 1, image: true, post: 'https://firebasestorage.googleapis.com/v0/b/nucliq-c6d24.appspot.com/o/posts%2FSRCoL1F5w2VDQHrM0Fdw0TMxIUm1post17300704891791.jpg?alt=media&token=cecc5d5c-078a-48bb-b844-21d76e38f35b',
        thumbnail:null, visible: false, video: false
    }], userId: 'SRCoL1F5w2VDQHrM0Fdw0TMxIUm1', timestamp: Timestamp
}]
const StoriesArray = ({profile, story, userId, user}) => {
    const [storyItem, setStoryItem] = useState(null);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [ogUserStoryModal, setOgUserStoryModal] = useState(false);
    const [userStoryModal, setUserStoryModal] = useState(false);
    const renderStories = ({item, index}) => {
      return (
        <TouchableOpacity key={index} style={styles.storyContainer} onPress={() => { setStoryItem(item)}}>
           <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={styles.storyImage}/>
           <Text numberOfLines={1} style={styles.storyText}>{item.userName}</Text>
        </TouchableOpacity>
      )
    }
    const fetchStories = async() => {
    setLoading(true);
    try {
      //const feedRef = collection(db, `storyFeeds/${userId}/stories`);
      const feedRef = collection(db, 'storyFeeds', userId, 'stories')
      const q = query(feedRef, orderBy('timestamp', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setHasMore(false); // No more data
      } else {
        const newStories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStories((prevStories) => [...prevStories, ...newStories]); // Append new stories
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]); // Track last doc
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
        fetchStories()
    }, [profile.following])
  return (
    <View style={{flexDirection: 'row'}}>
        {ogUserStoryModal || userStoryModal ? 
        <StoryModal userStoryModal={ogUserStoryModal} closeStoryModal={() => setUserStoryModal(false)} username={profile.userName} user={user}
        background={profile.background} forSale={profile.forSale} openUserStoryModal={() => setOgUserStoryModal(true)} 
        closeUserStoryModal={() => setOgUserStoryModal(false)} pfp={profile.pfp} storyItem={storyItem}/> : null}
        <TouchableOpacity style={styles.storyArrayContainer} onPress={() => setUserStoryModal(true)}>
            <FastImage source={profile.pfp ? {uri: profile.pfp} : require('../assets/defaultpfp.jpg')} 
            style={story.length > 0 ? [styles.storyOutline, {borderWidth: 2, borderColor: "#005278"}] : styles.storyOutline}/>
            <TouchableOpacity onPress={() => setOgUserStoryModal(true)} style={styles.plusContainer}>
                <MaterialCommunityIcons name='plus' size={17.5} color={"#005278"}/>
            </TouchableOpacity>
            <Text numberOfLines={1} style={[styles.storyText, {paddingTop: -10, marginTop: -10}]}>Your Story</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.storyContainer} onPress={() => {setUserStoryModal(true); setStoryItem(STORY_ITEM_FAKE)}}>
           <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.storyImage}/>
           <Text numberOfLines={1} style={styles.storyText}>{'userName1'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.storyContainer} onPress={() => {setUserStoryModal(true); setStoryItem(STORY_ITEM_FAKE)}}>
           <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.storyImage}/>
           <Text numberOfLines={1} style={styles.storyText}>{'userName2'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.storyContainer} onPress={() => {setUserStoryModal(true); setStoryItem(STORY_ITEM_FAKE)}}>
           <FastImage source={require('../assets/defaultpfp.jpg')} style={styles.storyImage}/>
           <Text numberOfLines={1} style={styles.storyText}>{'userName3'}</Text>
        </TouchableOpacity>
        {/* <FlatList 
            data={stories}
            renderItem={renderStories}
            keyExtractor={item => item.id}
            horizontal={true}
        /> */}
    </View>
  )
}

export default StoriesArray

const styles = StyleSheet.create({
    storyArrayContainer: {
        marginHorizontal: 10, 
        borderRadius: 999, 
        alignItems: 'center'
    },
    storyOutline: {
        height: 50,
        borderRadius: 999, 
        width: 50, 
    },
    plusContainer: {
        position: 'relative', 
        backgroundColor: "#fafafa", 
        bottom: 20, 
        left: 20, 
        borderRadius: 999
    },
    storyText: {
        fontFamily: 'Montserray_400Regular',
        color: "#fafafa",
        paddingTop: 10,
        paddingBottom: 5,
        fontSize: 12.29
    },
    storyContainer: {
        marginHorizontal: 10, 
        borderRadius: 999,
        alignItems: 'center'
    },
    storyImage: {
        height: 50, 
        borderRadius: 999, 
        width: 50,
        borderWidth: 2,
        borderColor: "#005278",
    }
})