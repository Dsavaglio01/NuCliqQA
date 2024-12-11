import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat'
const RecentSearches = ({data, renderSearches, extraStyling, group, home, friend, theme, ai, get, my, free, purchased}) => {
  const navigation = useNavigation();
  const [fontsLoaded, fontError] = useFonts({
    // your other fonts here
    Montserrat_400Regular,
    Montserrat_700Bold
  });

  if (!fontsLoaded || fontError) {
    // Handle loading errors
    return null;
  }
  return (
    <>
    <View style={[styles.recentCategories, extraStyling]}>
        <Text style={styles.recentCategoriesText}>Recent</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RecentSearches', {home: home, friend: friend, get: get, my: my, free: free, purchased: purchased, ai: ai, group: group})}>
        <Text style={styles.clearAllText}>More</Text>
        </TouchableOpacity>
    </View>
        <FlatList 
        data={data}
        renderItem={renderSearches}
        keyExtractor={(item) => item.id}
        />
    </>
  )
}

export default RecentSearches

const styles = StyleSheet.create({
    recentCategories: {
    backgroundColor: "#d4d4d4",
    fontWeight: 'bold',
    width: '95%',
    marginTop: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  recentCategoriesText: {
    fontSize: 15.36,
    padding: 5,
    fontFamily: 'Montserrat_700Bold'
  },
  clearAllText: {
    fontSize: 15.36,
    padding: 5,
    fontFamily: 'Montserrat_400Regular'
  },
})