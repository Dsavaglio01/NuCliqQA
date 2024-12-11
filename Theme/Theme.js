import { StyleSheet, Text, View } from 'react-native'
import React, {useState} from 'react'
import RegisterHeader from '../Components/RegisterHeader'
import { useNavigation } from '@react-navigation/native'
import NextButton from '../Components/NextButton'
//import { createDrawerNavigator } from '@react-navigation/drawer';
/* import All from './All'
import NewThemes from './NewThemes'
import Templates from './Templates'
import Stickers from './Stickers'
import UserCreated from './UserCreated'
import MyThemes from './MyThemes' */
//const Drawer = createDrawerNavigator();

const Theme = () => {
    const navigation = useNavigation();
    const [searching, setSearching] = useState(false)
    const onSearch = (text) => {
    //console.log(text)
    if (text) {
      setSearching(true)
      const temp = text.toLowerCase()
      //console.log(temp)
      const tempList = contacts.filter(item => {
        //console.log(item.name)
        if (item.name.toLowerCase().match(temp)) {
          //console.log(item)
          return item
        }
        else {
          setFiltered([])
          //setNoMatch(true)
          //setContacts([])
        }
      })
      setFiltered(tempList)
    }
    else {
      setSearching(false)
      setFiltered(contacts)
    }

  }
  return (
    <View style={styles.container}>
      <RegisterHeader onPress={() => navigation.goBack()}/>
      {/* <Text style={styles.header}>Get Themes</Text> */}
      {/* <View style={{borderTopWidth: 0.5 }}/>
          <SearchInput icon={'magnify'} text={searching ? true : false} placeholder={'Find Themes'} onChangeText={onSearch} onPress={() => setSearching(false)}/>
                {
                    searching &&
                    <SearchDropDown
                    onPress={() => {setSearching(false)}}
                    items={filtered} 
                    //setNewData={(e) => setContacts(contacts.filter(item => item.id == e))}
                    />
                }
          <View style={{borderBottomWidth: 0.25 }}/> */}
      <View style={{flex: 1, marginTop: '2.5%'}}>
        {/* <Drawer.Navigator useLegacyImplementation={true} screenOptions={{ headerStyle: {borderRadius: 10, height: '20%', backgroundColor: "transparent"}, headerPressColor: {color: "#005278"},
        headerShadowVisible: false, headerTitleStyle: {fontSize: 24, marginTop: -40}, headerLeftContainerStyle: {marginTop: -40, color: "#005278"}}}>
            <Drawer.Screen name={'All Themes'} component={All} options={{drawerStyle: {marginTop: -20}}}/>
            <Drawer.Screen name={'My Themes'} component={MyThemes} options={{drawerStyle: {marginTop: -20}}}/>
            <Drawer.Screen name={'New Themes'} component={NewThemes} options={{}}/>
            <Drawer.Screen name={'Stickers'} component={Stickers} options={{}}/>
            <Drawer.Screen name={'Templates'} component={Templates} options={{}}/>
            <Drawer.Screen name={'User-Created Themes'} component={UserCreated} options={{}}/>
        </Drawer.Navigator> */}
      </View>
      <View style={{marginBottom: '10%', marginLeft: '5%', marginRight: '5%',}}>
         <NextButton text={"Create Your Own Theme"} onPress={() => navigation.navigate('CreateTheme', {avatar: false})}/>
      </View>
    </View>
  )
}

export default Theme

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        fontSize: 30,
        textAlign: 'center',
        fontWeight: '700',
        padding: 10
    },
    menuText: {
        fontSize: 19.20,
        padding: 10,
        paddingLeft: 0,
        paddingBottom: 0
    }
})