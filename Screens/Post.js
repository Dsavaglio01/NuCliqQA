import { StyleSheet, Text, View, ActivityIndicator} from 'react-native'
import React, {useState, useEffect, useContext} from 'react'
import { Provider} from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import PostComponent from '../Components/PostComponent';
import ThemeHeader from '../Components/ThemeHeader';
import themeContext from '../lib/themeContext';
import { db } from '../firebase'
import VideoPostComponent from '../Components/VideoPostComponent';
import ProfileContext from '../lib/profileContext';
const Post = ({route}) => {
    const {post, name, groupId, edit, caption, video} = route.params;
    const [completePosts, setCompletePosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useContext(themeContext)
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportedItem, setReportedItem] = useState(null);
    const [actualGroup, setActualGroup] = useState(null);
    const [actualPfp, setActualPfp] = useState(null);
    const [groupName, setGroupName] = useState('')
    const [doesNotExist, setDoesNotExist] = useState(false);
    const profile = useContext(ProfileContext);
    useEffect(() => {
      if (route.params?.groupId)
      {
      const getData = async() => {
        const docSnap = await getDoc(doc(db, 'groups', groupId))
        if (docSnap.exists()) {
          setActualGroup({id: docSnap.id, ...docSnap.data()})
          setGroupName(docSnap.data().name)
          setActualPfp(docSnap.data().banner)
        }
      }
      getData();
      }
  }, [route.params?.groupId])
  useEffect(() => {
    if (name != undefined) {
      if (!video) {
    const fetchData = async() => {
      try {
        const [postSnap] = await Promise.all([
          getDoc(doc(db, 'posts', post))
        ]);

        if (postSnap.exists()) {

          const postBackground = profile.postBackground;
          setCompletePosts([{ 
            id: postSnap.id, 
            ...postSnap.data(),
            background: postBackground 
          }]);
        } else {
          setDoesNotExist(true); 
        }
      }
       catch (e) {
        console.error(e)
       }
       finally {
        setLoading(false)
       }
    }
    fetchData()
  }
  else {
    const fetchData = async() => {
      try {
        const [postSnap] = await Promise.all([
          getDoc(doc(db, 'videos', post))
        ]);

        if (postSnap.exists()) {

          const postBackground = profile.postBackground;
          setCompletePosts([{ 
            id: postSnap.id, 
            reportVisible: false,
            ...postSnap.data(),
            background: postBackground 
          }]);
        } else {
          setDoesNotExist(true); 
        }
      }
       catch (e) {
        console.error(e)
       }
       finally {
        setLoading(false)
       }
    }
    fetchData()
  }
  }
  }, [name, post, video])
  const openMenuCallback = (dataToSend) => {
    //console.log(dataToSend)
    openMenu(dataToSend)
  }
  const closeMenuCallback = (dataToSend) => {
    closeMenu(dataToSend)
  }
  const openMenuFunctionCallback = (dataToSend) => {
    setReportedItem(dataToSend.item);
    setReportModalVisible(true)
    
  }

  
  
  function openMenu(editedItem) {
    //console.log(editedItem)
    const editedItemIndex = completePosts.findIndex((item) => item.id === editedItem.id);
      //console.log(editedItemIndex)
      const newData = [...completePosts];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: true
      }
      setCompletePosts(newData);
  }
  function closeMenu(editedItem) {
    const editedItemIndex = completePosts.findIndex((item) => item.id === editedItem.id);
      //console.log(editedItemIndex)
      const newData = [...completePosts];
      newData[editedItemIndex] = {
        ...newData[editedItemIndex],
        reportVisible: false
      }
      setCompletePosts(newData);
  }
  return (
    <Provider>
        <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>
          {completePosts.length > 0 && !video || doesNotExist || !video ? 
            <ThemeHeader name={name} video={video} text={"Viewing Post"} actualGroup={actualGroup} groupName={groupName} cliqueId={groupId} postArray={completePosts[0] != undefined ? completePosts[0].post : null} repost={completePosts.repost ? true : false} caption={completePosts[0] != undefined ? completePosts[0].caption : null} id={completePosts[0] != undefined ? completePosts[0].id : null}
             backButton={true} post={true} timestamp={completePosts[0] != undefined ? completePosts[0].timestamp : null} actualPost={completePosts != undefined ? completePosts[0] : null} userId={completePosts[0] != undefined ? completePosts[0].userId : null} homePost={groupId ? false: true} cliquePost={groupId? true: false} style={{marginLeft: '2.5%'}}/> : null}
            {loading ? 
            <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: '10%'}}>
          <ActivityIndicator color={theme.theme != 'light' ? "#9EDAFF" : "#005278"} size={"large"}/> 
        </View> 
            : completePosts.length > 0 && !video ?
            <PostComponent forSale={profile.forSale} background={profile.background} notificationToken={profile.notificationToken} edit={edit} caption={caption} individualPost={true} blockedUsers={profile.blockedUsers} data={[completePosts[0]]} fetchMoreData={null} home={groupId ? false : true}
            clique={groupId ? true : false} cliqueId={groupId} username={profile.userName} cliqueIdName={groupName} cliqueIdPfp={actualPfp} actualClique={actualGroup} openPostMenuFunction={openMenuFunctionCallback}
        closePostMenu={closeMenuCallback} openPostMenu={openMenuCallback}/> : 
        completePosts.length && video ? <VideoPostComponent viewing={true} reportedPosts={profile.reportedPosts} forSale={profile.forSale} background={profile.background} notificationToken={profile.notificationToken} edit={edit} caption={caption} individualPost={true} blockedUsers={profile.blockedUsers} data={[completePosts[0]]} fetchMoreData={null} home={groupId ? false : true}
            clique={groupId ? true : false} cliqueId={groupId} username={profile.userName} cliqueIdName={groupName} cliqueIdPfp={actualPfp} actualClique={actualGroup} openPostMenuFunction={openMenuFunctionCallback}
        closePostMenu={closeMenuCallback} openPostMenu={openMenuCallback}/> :
        <View style={{alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: '10%'}}> 
          <Text style={{fontSize: 15.36, fontFamily: 'Montserrat_500Medium', color: theme.color}}>Post unavailable</Text>
        </View> }
        </View>
    </Provider>
  )
}

export default Post

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    captionText: {
        fontSize: 19.20,
        fontFamily: 'Montserrat_500Medium',
        padding: 10
    },
    postingContainer: {
        width: '100%',
        //marginLeft: '-5%',
        height: '100%',
        //alignItems: 'center'
        justifyContent: 'center',
        backgroundColor: "#005278",
        
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: '2.5%',
    },
    addText: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      padding: 10,
      color: "#090909"
    },
    multiSlideDot: {
      width: 6,
      height: 7,
      backgroundColor: "#000",
      margin: '2%'
    },
    firstName: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_700Bold',
      color: "#090909",
      padding: 7.5,
      paddingBottom: 15
    },
    previewThemeContainer: {
    margin: '5%',
    marginTop: '10%',
    marginBottom: "2.5%",
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  barColor: {
        borderColor: '#3286ac'
    },
  previewHeader: {
    fontSize: 15.36,
    fontFamily: 'Montserrat_600SemiBold',
    padding: 5,
    textAlign: 'center'
  },
  previewContainer: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#979797"
  },
  previewText: {
    padding: 5,
    fontSize: 15.36,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
  paginationContainer: {
    marginTop: -33
    //margin: 10
  },
  modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
  modalView: {
    width: '100%',
    height: '100%',
    //margin: 20,
    //backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    //paddingRight: 0,
    paddingTop: 5,
    paddingBottom: 25,
    //alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  postFooter: {
    position: 'absolute',
    left: '102.5%',
    top: '75%'
    //flexDirection: 'column'
  },
  postFooterText: {
      fontSize: 12.29,
      fontFamily: 'Montserrat_500Medium',
      color: "grey",
      padding: 5,
      alignSelf: 'center'
    },
})