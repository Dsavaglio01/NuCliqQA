import { StyleSheet, Text, View, Alert, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useMemo, useContext} from 'react'
import useAuth from '../Hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import NextButton from '../Components/NextButton';
import ThemeHeader from '../Components/ThemeHeader';
import _ from 'lodash'
import PostComponent from '../Components/PostComponent';
import ProfileContext from '../lib/profileContext';
import { fetchCliquePostsExcludingBlockedUsers, fetchCliquePostsExcludingBlockedUsersWithActualNewPost, 
  fetchMoreCliquePostsExcludingBlockedUsers, 
  fetchNewPost} from '../firebaseUtils';
const GroupPosts = ({route}) => {
    const navigation = useNavigation();
    const {group, admin, username, blockedUsers} = route.params;
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [posts, setPosts] = useState([]);
    const [actualNewPost, setNewPost] = useState({id: null});
    const {user} = useAuth();
    const profile = useContext(ProfileContext);
    useEffect(() => {
      if (route.params?.newPost) {
        const getData = async() => {
          const fetchPostExistence = async () => {
            try {
              const post = await fetchNewPost(group.id, route.params?.postId);
              setNewPost(post)
            } catch (error) {
              console.error(error.message);
              setNewPost(null)
            }
          };
          fetchPostExistence();
        } 
        getData()
      }
    }, [route.params?.newPost])
    useMemo(() => {
      if (actualNewPost.id != null) {
        setPosts([actualNewPost])
        const getData = async () => {
          const { posts, lastVisible } = await fetchCliquePostsExcludingBlockedUsersWithActualNewPost(group.id, profile.blockedUsers, actualNewPost)
          setPosts(posts);
          setLastVisible(lastVisible);
        }
        getData();
      }
      else {
        const getData = async () => {
          const { posts, lastVisible } = await fetchCliquePostsExcludingBlockedUsers(group.id, profile.blockedUsers)
          setPosts(posts);
          setLastVisible(lastVisible);
        }
        getData();
      }
        
      
    }, [actualNewPost, group])
    
    async function fetchMoreData () {
      if (lastVisible != undefined) {
        const { tempPosts, lastVisible: newLastVisible } = await fetchMoreCliquePostsExcludingBlockedUsers(group.id, profile.blockedUsers, lastVisible);
        setPosts([...posts, ...tempPosts])
        setLastVisible(newLastVisible);
      }
  }
  return (
    <View style={styles.container}>
      <ThemeHeader backButton={true} text={group.name} groupPosts={true} actualGroup={group} blockedUsers={blockedUsers} username={username} cliqueId={group.id} groupposting={true}/>
        {user && posts.length > 0 ? <>
        <PostComponent data={posts} forSale={profile.forSale} background={profile.background} home={false} loading={loading} lastVisible={lastVisible} 
          actualClique={group} videoStyling={null || false} cliqueIdPfp={group.banner} cliqueIdName={group.name} post={null} blockedUsers={profile.blockedUsers}
          openPostMenu={null} clique={true} cliqueId={group.id} pfp={profile.pfp} ogUsername={profile.username} admin={admin} edit={false} caption={null} 
          notificationToken={profile.notificationToken} smallKeywords={profile.smallKeywords} largeKeywords={profile.largeKeywords} reportedPosts={reportedPosts}
          reportedComments={reportedComments} privacy={profile.privacy}/>
        </>
        : loading ? 
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={"#9EDAFF"} size={"large"}/> 
        </View>
        : !loading && !lastVisible ? 
        <View style={styles.loadingContainer}>
          <Text style={styles.noPostText}>No posts yet. Be the first one to post!</Text>
          <NextButton text={`Post to ${group.name}`} textStyle={{fontSize: 15.36}} onPress={group.members.includes(user.uid) ? 
            () => navigation.navigate('NewPost', {group: true, groupName: group.name, actualGroup: group, groupId: group.id, postArray: [], blockedUsers: blockedUsers, admin: group.admins.includes(user.uid), username: username}) 
            : () => Alert.alert('Cannot post', 'Must be part of Cliq to post')}/>
          </View> : 
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={"#9EDAFF"} size={"large"}/> 
          </View>}
    </View>
  )
}

export default GroupPosts

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212"
    },
    loadingContainer: {
      alignItems: 'center', 
      flex: 1, 
      backgroundColor: "#121212", 
      justifyContent: 'center'
    },
    noPostText: {
      fontFamily: 'Montserrat_500Medium', 
      fontSize: 19.20, 
      padding: 10, 
      marginBottom: '5%', 
      textAlign: 'center', 
      color: "#fafafa"
    }
})