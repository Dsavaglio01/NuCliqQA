import { FlatList, StyleSheet, View, ActivityIndicator} from 'react-native'
import React, {useEffect, useState, useMemo} from 'react'
import { onSnapshot, query, getDoc, doc, getDocs} from 'firebase/firestore';
import ThemeHeader from '../Components/ThemeHeader';
import SearchBar from '../Components/SearchBar';
import useAuth from '../Hooks/useAuth';
import { db } from '../firebase'
import FriendComponent from '../Components/Friend/FriendComponent';
const Friends = ({route}) => {
    const {profile, username} = route.params;
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [friendsInfo, setFriendsInfo] = useState([]);
    const [searching, setSearching] = useState(false)
    const [filteredGroup, setFilteredGroup] = useState([]);
    const [searches, setSearches] = useState([]);
    const {user} = useAuth();
    const handleGroupCallback = (dataToSend) => {
    setFilteredGroup(dataToSend)
    }
    useEffect(() => {
    let unsub;

      const fetchCards = async () => {
          const docSnap = await getDoc(doc(db, 'profiles', profile))
          setFriends(docSnap.data().following.slice(0, 50))

        }
      fetchCards();
      return unsub;
  }, [profile])
  const handleSearchCallback = (dataToSend) => {
      //console.log(dataToSend)
      setSearching(dataToSend)
    }
  useMemo(() => {
    if (friends.length > 0) {
      setFriendsInfo([])
      const friendInfo = [];
      friends.map((item) => {
        const fetchCards = async() => {
          const data = await getDoc(doc(db, "profiles", item));
          friendInfo.push({id: data.id, loading: false, ...data.data()})
        }
        fetchCards();
        setTimeout(() => {
          setLoading(false)
        }, 1000);
      })
      setFriendsInfo(friendInfo)
    }
  }, [friends])
  return (
    <View style={styles.container}> 
      <View>
        <ThemeHeader text={`@${username}'s Friends`} video={false} backButton={true}/>
      </View>
      <View style={{marginLeft: '5%'}}>
        <SearchBar friendsInfo={friendsInfo.filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))} filteredGroup={handleGroupCallback} searches={searches} chat={true} isSearching={handleSearchCallback}/>
      </View>
      {!searching && !loading ?
        <FlatList 
          data={filteredGroup.length > 0 ? filteredGroup : friendsInfo.filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))}
          renderItem={({item, index}) => <FriendComponent index={index} item={item} user={user} friendsInfo={friendsInfo} updateFriendsInfo={setFriendsInfo}/>}
          keyExtractor={(item) => item.id}
        /> : loading ? 
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={ "#9EDAFF"} size={"large"}/> 
        </View> 
      : null}
      
    </View>
  )
}

export default Friends

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  loadingContainer: {
    alignItems: 'center', 
    flex: 1, 
    justifyContent: 'center', 
    marginBottom: '20%'
  }
})