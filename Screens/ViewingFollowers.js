import { FlatList, StyleSheet,View, ActivityIndicator} from 'react-native'
import React, {useEffect, useState, useMemo} from 'react'
import { onSnapshot, query, getDoc, doc } from 'firebase/firestore';
import ThemeHeader from '../Components/ThemeHeader';
import SearchBar from '../Components/SearchBar';
import useAuth from '../Hooks/useAuth';
import { db } from '../firebase'
import FriendComponent from '../Components/Friend/FriendComponent';
const ViewingFollowers = ({route}) => {
    const {profile, username} = route.params;
    const [friends, setFriends] = useState([])
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
    const fetchCards = async () => {
      const docSnap = await getDoc(doc(db, 'profiles', profile))
      setFriends(docSnap.data().followers.slice(0, 50))
    }
    fetchCards();
  }, [profile])
  useMemo(() => {
    if (friends.length > 0) {
      setFriendsInfo([])
      friends.map((item) => {
        let unsub;
      const fetchCards = () => {
        unsub = onSnapshot(query(doc(db, 'profiles', item)), (snapshot) => {
          setFriendsInfo(prevState => [...prevState, {id: snapshot.id, loading: false, ...snapshot.data()}])
        })
      }
      fetchCards();
      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
      })
    }
  }, [friends])

  const handleSearchCallback = (dataToSend) => {
      setSearching(dataToSend)
    }
  return (
    <View style={styles.container}> 
      <View>
        <ThemeHeader text={`@${username}'s Followers`} video={false} backButton={true}/>
      </View>
      <View style={{marginLeft: '5%'}}>
        <SearchBar friendsInfo={friendsInfo.filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))} filteredGroup={handleGroupCallback} searches={searches} chat={true} isSearching={handleSearchCallback}/>
      </View>
      {!searching && !loading ?
        <FlatList 
          data={filteredGroup.length > 0 ? filteredGroup : friendsInfo.filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))}
          renderItem={({item, index}) => <FriendComponent index={index} item={item} user={user} friendsInfo={friendsInfo} 
          updateFriendsInfo={setFriendsInfo} />}
          keyExtractor={(item) => item.id}
        /> : loading ? 
            <View style={styles.loading}>
              <ActivityIndicator color={"#9EDAFF"} size={"large"}/> 
            </View> : null}
      
    </View>
  )
}

export default ViewingFollowers

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212"
    },
    loading: {
      alignItems: 'center', 
      flex: 1, 
      justifyContent: 'center', 
      marginBottom: '20%'
    }
})