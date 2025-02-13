import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, {useState} from 'react'
import {MaterialCommunityIcons, FontAwesome, AntDesign} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
const SubscriptionPage = () => {
    const navigation = useNavigation();
    const [premium, setPremium] = useState(true);
  return (
    <View style={styles.container}>
        <View style={styles.main}>
            <TouchableOpacity style={{marginLeft: 'auto'}} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name='close' size={25} color={"#fafafa"} style={{padding: 10}}/>
            </TouchableOpacity>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => setPremium(true)} style={premium ? styles.highlightedHeader : styles.header}>
                    <Text numberOfLines={2} style={premium ? styles.highlightedHeaderText : styles.headerText}>Premium</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPremium(false)} style={!premium ? styles.highlightedHeader : styles.header}>
                    <Text numberOfLines={2} style={!premium ? styles.highlightedHeaderText : styles.headerText}>Elite</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.priceParentContainer}>
                <View style={styles.priceContainer}>
                    <View style={styles.benefitHeader}>
                        <Text style={styles.benefitHeaderText}>1 week</Text>
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    <View style={styles.benefitHeader}>
                        <Text style={styles.benefitHeaderText}>1 month</Text>
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    <View style={styles.benefitHeader}>
                        <Text style={styles.benefitHeaderText}>1 year</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.question}>Why get the Premium Tier?</Text>
            <View style={styles.benefitContainer}>
                <MaterialCommunityIcons name='message-reply-text-outline' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>Advanced messaging</Text>
            </View>
            <View style={styles.benefitContainer}>
                <MaterialCommunityIcons name='spotlight' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>Expanded Spotlight capabilities</Text>
            </View>
            <View style={styles.benefitContainer}>
                <FontAwesome name='picture-o' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>Apply, create & edit custom Themes</Text>
            </View>
            <View style={styles.benefitContainer}>
                <MaterialCommunityIcons name='account-group-outline' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>Create Cliques</Text>
            </View>
            <View style={styles.benefitContainer}>
                <AntDesign name='addusergroup' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>Join multiple Cliques</Text>
            </View>
            <View style={styles.benefitContainer}>
                <MaterialCommunityIcons name='filter-variant' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>Advanced feed filtering</Text>
            </View>
            <View style={styles.benefitContainer}>
                <MaterialCommunityIcons name='robot-outline' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>Optional AI algorithm integration</Text>
            </View>
        </View>
    
    </View>
  )
}

export default SubscriptionPage

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    main: {
        marginTop: '8%',
        marginHorizontal: '2.5%'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    headerText: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 19.20,
        color: "#fafafa",
        paddingBottom: 10
    },
    highlightedHeaderText: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 19.20,
        color: "#9edaff",
        paddingBottom: 10
    },
    header: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: "#fafafa"
    },
    highlightedHeader: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: "#9edaff"
    },
    priceParentContainer: {
        alignItems: 'center',
        marginTop: '5%',
        flexDirection: 'row'
    },
    priceContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#005278",
        height: 120,
        width: '28.5%',
        marginHorizontal: '2.5%'
    },
    question: {
        fontFamily: 'Montserrat_600SemiBold',
        color: "#fafafa",
        fontSize: 19.20,
        textAlign: 'center',
        marginTop: '5%'
    },
    benefitContainer: {
        flexDirection: 'row',
        marginTop: '5%',
        marginHorizontal: '5%'
    },
    benefitText: {
        fontFamily: 'Montserrat_500Medium',
        color: "#fafafa",
        fontSize: 15.36,
        padding: 7.5
    },
    benefitHeader: {
        borderRadius: 8
    },
    benefitHeaderText: {
        fontFamily: 'Montserrat_500Medium',
        color: "#fafafa",
        fontSize: 15.36,
        textAlign: 'center',
        padding: 5,
        backgroundColor: "red",
        overflow: 'hidden',
        borderTopEndRadius: 8,
        width: '99%',
        marginHorizontal: '0.5%'
    }
})