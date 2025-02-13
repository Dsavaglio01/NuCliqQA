import { FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useEffect, useState, useMemo, useContext} from 'react'
import { onSnapshot, query, collection, where, doc, getDoc, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import SearchInput from '../Components/SearchInput';
import { Divider } from 'react-native-paper';
import useAuth from '../Hooks/useAuth';
import FastImage from 'react-native-fast-image';
import themeContext from '../lib/themeContext';
import _ from 'lodash';
import { db } from '../firebase';
import ProfileContext from '../lib/profileContext';
import AdminModal from '../Components/Group/AdminModal';
const GroupMembers = ({route}) => {
    const {groupId, admins} = route.params;
    const [specificSearch, setSpecificSearch] = useState('');
    const theme = useContext(themeContext)
    const [loading, setLoading] = useState(true);
    const [memberInfo, setMemberInfo] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [person, setPerson] = useState({});
    const [searches, setSearches] = useState([]);
    const [members, setMembers] = useState([]);
    const [searching, setSearching] = useState(false)
    const [filtered, setFiltered] = useState([]);
    const [followingCount, setFollowingCount] = useState(20);
    const [adminModal, setAdminModal] = useState(false)
    const [filteredGroup, setFilteredGroup] = useState([]);
    const navigation = useNavigation();
    const [moreResults, setMoreResults] = useState(false);
    const [moreResultButton, setMoreResultButton] = useState(false);
    const profile = useContext(ProfileContext);
    const {user} = useAuth();
    useEffect(() => {
    const getData = async() => {
      const docSnap = await getDoc(doc(db, 'groups', groupId))
      setGroupName(docSnap.data().name)
      setMembers(docSnap.data().members.slice(followingCount - 20, followingCount))
    } 
    getData()
    setTimeout(() => {
      setFollowingCount(followingCount + 20)
    }, 1000);
  },[])
    useMemo(() => {
    if (specificSearch.length > 0) {
      //console.log(specificSearch)
      setSearches([])
      const getData = async() => {
        const firstQ = query(collection(db, "groups", groupId, 'profiles'), where('searchKeywords', 'array-contains', specificSearch.toLowerCase()), limit(10));
        const firstQuerySnapshot = await getDocs(firstQ)
        firstQuerySnapshot.forEach(async(document) => {
          const docSnap = await getDoc(doc(db, 'profiles', document.id))
          if (docSnap.exists()) {
          setSearches(prevState => [...prevState, {id: docSnap.id, ...docSnap.data()}])
          }
        })
      }
      
      getData();
    } 
  }, [specificSearch])
  useEffect(() => {
    if (specificSearch.length > 0) {
      setSearching(true)
      setMoreResultButton(false)
      setMoreResults(false)
      const temp = specificSearch.toLowerCase()
      const tempList = Array.from(new Set(searches.map(JSON.stringify))).map(JSON.parse).filter(item => {
        if (item.searchusername.toLowerCase().match(temp)) {
          return item
        } 
      })
      if (tempList.length > 3) {
        setMoreResultButton(true)
      }
      setFiltered(tempList)
    }
    else {
      setFiltered([])
    }
  }, [searches])
  useMemo(() => {
      members.map((item) => {
        let unsub;
      const fetchCards = async () => {
        unsub = onSnapshot(query(doc(db, 'profiles', item)), (snapshot) => {        
            setMemberInfo(prevState => [...prevState, {id: snapshot.id, ...snapshot.data()}])
        })
      } 
      fetchCards();

      setTimeout(() => {
        setLoading(false)
      }, 1000);
      return unsub;
      })
    }, [members])
  const renderMember = ({item, index}) => {
    //console.log(item)
    return (
        <View key={item.id}>
        <View  style={{flexDirection: 'row', width: '82.5%', alignItems: 'center'}}>
            <TouchableOpacity style={[styles.friendsContainer, {backgroundColor: theme.backgroundColor}]} activeOpacity={1} onPress={item.id == user.uid ? null : admins.includes(user.uid) ? () => {setAdminModal(true); setPerson(item)}  : () => navigation.navigate('ViewingProfile', {name: item.id, viewing: true})}>
                <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 45, width: 45, borderRadius: 8, borderWidth: 1.5}}/>
                 <View style={{paddingLeft: 20, width: '75%'}}>
                    <Text numberOfLines={1} style={[styles.nameText, {fontWeight: '700', fontSize: 19.20, color: "#fafafa", fontFamily: 'Montserrat_700Bold'}]}>{item.firstName} {item.lastName}</Text>
                    <Text numberOfLines={1} style={[styles.nameText, {color: "#fafafa"}]}>@{item.userName}</Text>
                </View>
            
                
            </TouchableOpacity>
            <View style={{justifyContent: 'center'}}>
              {admins.includes(item.id) ? 
              <MaterialCommunityIcons name='crown-outline' color={"#fafafa"} size={35} style={{alignSelf: 'center'}}/> : null}
              
            </View>
          </View>
          <Divider />
      </View>
    )
  }
  const renderEvents = ({item, index}) => {
    //console.log(item)
    return (
      <View key={index}>
        <TouchableOpacity style={[styles.categoriesContainer, {backgroundColor: theme.backgroundColor}]} onPress={() => {setFilteredGroup([item]); setSearching(false)}}>
            <FastImage source={item.pfp ? {uri: item.pfp} : require('../assets/defaultpfp.jpg')} style={{height: 40, width: 40, borderRadius: 8}}/>
            <Text numberOfLines={1} style={[styles.categories, {color: "#fafafa"}]}>{item.firstName} {item.lastName} | @{item.username != undefined ? item.username : item.userName}</Text>
            <MaterialCommunityIcons name='arrow-top-left' size={30} style={{alignSelf: 'center', marginLeft: 'auto'}} color={theme.theme != 'light' ? "#9EDAFF" : "#005278"}/>
        </TouchableOpacity>
      </View>
    )
  }
    const handleScroll = _.debounce((event) => {
    // Your logic for fetching more data
    fetchMoreData()
  }, 500);
  //console.log(members)
  const fetchMoreData = () => {
    console.log('thi')
    setLoading(true)
        const fetchCards = async () => {
          newData = [];
          const docSnap = await getDoc(doc(db, 'groups', groupId))
          setMembers([...members, ...docSnap.data().members.slice(followingCount - 20, followingCount)])
          
        }
        fetchCards();
        setTimeout(() => {
          setFollowingCount(followingCount + 20)
            setLoading(false)
          }, 1000);
  }
  return (
    <View style={styles.container}> 
      <AdminModal adminModal={adminModal} groupName={groupName} closeAdminModal={() => setAdminModal(false)} person={person} admins={admins} navigation={navigation}
        groupId={groupId} profile={profile} filterMemberInfo={setMemberInfo(memberInfo.filter((e) => person.id !== e.id))}/>
      {!searching ? 
        <>
        <View style={styles.innerContainer}>
          <View style={{flexDirection: 'row'}}>
            <MaterialCommunityIcons name='chevron-left' size={37.5} color={"#fafafa"} style={styles.left} onPress={() => navigation.goBack()}/>
              <View style={styles.logoContainer}>
                <FastImage source={require('../assets/DarkMode5.png')} style={styles.logo}/>
              </View>
          </View>   
        </View>
        <Divider borderBottomWidth={0.4} color={"#fafafa"} style={{borderBottomColor: "#fafafa"}}/>
        <Text style={styles.header}>All Members: {Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length > 999 && Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length < 1000000 
        ? `${Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length / 1000}k` : Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length > 999999 ? `${Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length / 1000000}m` : Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id)).length}</Text>
          <FlatList 
            data={filteredGroup.length > 0 ? Array.from(new Set(filteredGroup.map(item => item.id))).map(id => filteredGroup.find(obj => obj.id === id)) : Array.from(new Set(memberInfo.map(item => item.id))).map(id => memberInfo.find(obj => obj.id === id))}
            renderItem={renderMember}
            keyExtractor={(item, index) => item.id + index}
            onScroll={handleScroll}
          /> 
        </>
        : 
        <> 
          <View style={{marginTop: '10%'}}>
            <Text style={styles.header}>All Members: {members.length}</Text>
            <View style={{margin: '5%'}}>
            <TouchableOpacity activeOpacity={1} style={{width: '100%', marginTop: '2.5%', zIndex: 0}}>
            <View style={{flexDirection: 'row'}}>
                  <SearchInput value={specificSearch} icon={'magnify'} placeholder={'Search'} onFocus={() => { setSearching(true)}} iconStyle={styles.homeIcon}
                  containerStyle={!searching ? {borderWidth: 1, borderColor: "#fafafa", width: '100%'} : {borderWidth: 1, borderColor: "#fafafa", width: '90%'}} text={searching ? true : false} onChangeText={setSpecificSearch} 
                  onPress={() => {  setSpecificSearch(''); setSearching(true)}}/>
                  {searching ?
                  <MaterialCommunityIcons name='close' size={40} style={styles.closeHomeIcon} color={"#fafafa"} onPress={() => { setSearching(false); Keyboard.dismiss(); setFiltered([]); setSpecificSearch('')}}/> : null}
                  </View>
                  <View>
                  {searching && filtered.length == 0 && specificSearch.length > 0 ?
                  <View>
                    <Text style={{fontFamily: 'Montserrat_500Medium', color: "#fafafa", fontSize: 15.36, paddingHorizontal: 10, textAlign: 'center', marginRight: '5%', marginTop: '5%'}}>No Search Results</Text>
                  </View> :  
                  searching && moreResults
                  ?
                  <>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      //contentContainerStyle={{width: '100%', zIndex: 3, flewGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  </>
                  : searching && (moreResults || specificSearch.length > 0) ? 
                  <View>
                  <FlatList 
                      data={!moreResults ? filtered.slice(0, 3) : filtered.slice(0, 10)}
                      renderItem={renderEvents}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{flexGrow: 1}}
                      scrollEnabled={moreResultButton ? false: true}
                  /> 
                  
                  <TouchableOpacity style={{alignItems: 'center', marginRight: '5%'}} onPress={() => { setMoreResults(true); setMoreResultButton(false);}}>
                    <Text style={{paddingTop: 5, fontFamily: 'Montserrat_400Regular', color: theme.theme != 'light' ? "#9EDAFF" : "#005278"}}>See more results</Text>
                    </TouchableOpacity>
                  </View> : <></>}
                  </View>
                  
                  
              </TouchableOpacity>
              
          </View>
            
          </View>
        </>
        }
    
    </View>
  )
}

export default GroupMembers

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212"
    },
    removeButton: {
        alignSelf: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#005278',
        //marginLeft: '-15%'
    },
    removeButtonText: {
        padding: 10,
        fontSize: 12.29,
        fontFamily: 'Montserrat_500Medium',
        color: '#005278',
        paddingLeft: 12,
        paddingRight: 12
    },
    firstNameText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 2.5,
        paddingBottom: 0
    },
    membersContainer: {
        flexDirection: 'row', 
        marginTop: '5%', 
        marginLeft: '5%', 
        marginRight: '5%', 
        justifyContent: 'space-between',
    },
    header: {
      fontSize: 19.20,
      fontFamily: 'Montserrat_500Medium',
      marginLeft: '5%',
      marginTop: '5%',
      color: "#fafafa"
    },
    innerContainer: {
    marginTop: '5%',
      marginBottom: '3%',
      //marginLeft: '5%',
      //marginRight: '5%',
      justifyContent: 'space-between',
      flexDirection: 'row',
  },
  left: {
    marginLeft: '5%', 
    marginTop: 25
  },
  logoContainer: {
    alignSelf: 'center', 
    marginTop: '15%', 
    marginLeft: '5%'
  },
  logo: {
    height: 27.5, 
    width: 68.75
  },
  nameText: {
        fontSize: 15.36,
        fontFamily: 'Montserrat_500Medium',
        padding: 2.5,
        paddingBottom: 0,
        width: '90%'
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        //marginLeft: '5%',
        //marginRight: '5%',
        marginTop: '5%'
    },
    friendsContainer: {
        borderRadius: 10,
        borderBottomColor: "#d3d3d3",
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        marginLeft: '2.5%'
    },
    homeIcon: {position: 'absolute', left: 280, top: 8.5},
    closeHomeIcon: {marginLeft: '1%'},
})