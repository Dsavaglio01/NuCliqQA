import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, {useState, useEffect} from 'react'
import {MaterialCommunityIcons, FontAwesome, AntDesign} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import NextButton from '../Components/NextButton';
import Purchases from 'react-native-purchases'
const SubscriptionPage = () => {
    const navigation = useNavigation();
    const [premium, setPremium] = useState(true);
    const [option, setOption] = useState({premium: true, duration: '1 week', price: 2.00})
    const [showPaywall, setShowPaywall] = useState(false)
    useEffect(() => {
        // Get current available packages
        const getPackages = async () => {
          try {
            const offerings = await Purchases.getOfferings()
            if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                console.log(offerings.current.availablePackages)
            }
          } catch (e) {
            Alert.alert('Error getting offers', e.message);
          }
        };
    
        getPackages();
      }, []);
  return (
    <View style={styles.container}>
        {showPaywall ? 
            <></>
        : null}
        <View style={styles.main}>
            <TouchableOpacity style={{marginLeft: 'auto'}} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name='close' size={25} color={"#fafafa"} style={{padding: 10}}/>
            </TouchableOpacity>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => {setPremium(true); setOption({premium: true, duration: '1 week', price: 2.00})}} style={premium ? styles.highlightedHeader : styles.header}>
                    <Text numberOfLines={2} style={premium ? styles.highlightedHeaderText : styles.headerText}>Premium</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {setPremium(false); setOption({premium: false, duration: '1 week', price: 4.50})}} style={!premium ? styles.highlightedHeader : styles.header}>
                    <Text numberOfLines={2} style={!premium ? styles.highlightedHeaderText : styles.headerText}>Elite</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.priceParentContainer}>
                <TouchableOpacity style={premium ? (option.duration == '1 week' && option.premium 
                ? styles.priceContainer : styles.notHighlightedPriceContainer) : (option.duration == '1 week' && !option.premium 
                ? styles.priceContainer : styles.notHighlightedPriceContainer)} 
                onPress={premium ? () => setOption({premium: true, duration: '1 week', price: 2.00}) 
                : () => setOption({premium: false, duration: '1 week', price: 4.50})}>
                    <View style={styles.benefitHeader}>
                        <Text style={premium ? (option.duration == '1 week' && option.premium ? styles.benefitHeaderText 
                        : styles.notHighlightedBenefitHeaderText) : (option.duration == '1 week' && !option.premium ? styles.benefitHeaderText 
                        : styles.notHighlightedBenefitHeaderText)}>1 week</Text>
                    </View>
                    <View style={styles.moneyContainer}>
                        <Text style={styles.moneyText}>{premium ? '$2.00' : '$4.50'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={premium ? (option.duration == '1 month' && option.premium 
                ? styles.priceContainer : styles.notHighlightedPriceContainer) : (option.duration == '1 month' && !option.premium 
                ? styles.priceContainer : styles.notHighlightedPriceContainer)}
                onPress={premium ? () => setOption({premium: true, duration: '1 month', price: 7.99}) 
                : () => setOption({premium: false, duration: '1 month', price: 17.99})}>
                    <View style={styles.benefitHeader}>
                        <Text style={premium ? (option.duration == '1 month' && option.premium ? styles.benefitHeaderText 
                        : styles.notHighlightedBenefitHeaderText) : (option.duration == '1 month' && !option.premium ? styles.benefitHeaderText 
                        : styles.notHighlightedBenefitHeaderText)}>1 month</Text>
                    </View>
                    <View style={styles.moneyContainer}>
                        <Text style={styles.moneyText}>{premium ? '$7.99' : '$17.99'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={premium ? (option.duration == '1 year' && option.premium 
                ? styles.priceContainer : styles.notHighlightedPriceContainer) : (option.duration == '1 year' && !option.premium 
                ? styles.priceContainer : styles.notHighlightedPriceContainer)}
                onPress={premium ? () => setOption({premium: true, duration: '1 year', price: 95.88})
                : () => setOption({premium: false, duration: '1 year', price: 215.88})}>
                    <View style={styles.benefitHeader}>
                        <Text style={premium ? (option.duration == '1 year' && option.premium ? styles.benefitHeaderText 
                        : styles.notHighlightedBenefitHeaderText) : (option.duration == '1 year' && !option.premium ? styles.benefitHeaderText 
                        : styles.notHighlightedBenefitHeaderText)}>1 year</Text>
                    </View>
                    <View style={styles.moneyContainer}>
                        <Text style={styles.moneyText}>{premium ? '$95.88' : '$215.88'}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <Text style={styles.question}>Why get the {premium ? 'Premium' : 'Elite'} Tier?</Text>
            <View style={styles.benefitContainer}>
                {!premium ? <FontAwesome name='picture-o' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/> : 
                <MaterialCommunityIcons name='message-reply-text-outline' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/> }
                <Text style={styles.benefitText}>{premium ? 'Advanced messaging' : 'Share and purchase themes'}</Text>
            </View>
            <View style={styles.benefitContainer}>
                <MaterialCommunityIcons name={premium ? 'spotlight' : 'shopping'} size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>{premium ? 'Expanded Spotlight capabilities': 'Premium themes marketplace'}</Text>
            </View>
            <View style={styles.benefitContainer}>
                {!premium ? <AntDesign name='addusergroup' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/> :
                <FontAwesome name='picture-o' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>}
                <Text style={styles.benefitText}>{premium ? 'Apply, create & edit custom Themes' : 'Unlimited Cliques'}</Text>
            </View>
            <View style={styles.benefitContainer}>
                <MaterialCommunityIcons name='account-group-outline' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>{premium ? 'Create Cliques' : 'Exclusive Clique Features'}</Text>
            </View>
            <View style={styles.benefitContainer}>
                <AntDesign name={premium ? 'addusergroup' : 'checkcircle'} size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>{premium ? 'Join multiple Cliques' : 'Elite Badge - Ability to message elite badge users right away.'}</Text>
            </View>
            <View style={styles.benefitContainer}>
                <MaterialCommunityIcons name={premium ? 'filter-variant' : 'robot-outline'} size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>{premium ? 'Advanced feed filtering' : 'Prioritiy algorithm boost'}</Text>
            </View>
            {premium ? 
            <View style={styles.benefitContainer}>
                <MaterialCommunityIcons name='robot-outline' size={25} color={"#fafafa"} style={{alignSelf: 'center'}}/>
                <Text style={styles.benefitText}>Optional AI algorithm integration</Text>
            </View>
            : null}
            <View style={{marginTop: '10%'}}>
                <NextButton onPress={() => showPaywall(true)} text={`Get ${option.duration} for $${option.price.toFixed(2)}`} textStyle={{fontSize: 15.36}}/>
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
    notHighlightedPriceContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#636363",
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
        borderTopLeftRadius: 5, // Round the top-left corner
        borderTopRightRadius: 5, // Round the top-right corner
        overflow: 'hidden',
    },
    benefitHeaderText: {
        fontFamily: 'Montserrat_500Medium',
        color: "#fafafa",
        fontSize: 15.36,
        textAlign: 'center',
        padding: 5,
        backgroundColor: "#005278",
        overflow: 'hidden',
    },
    notHighlightedBenefitHeaderText: {
        fontFamily: 'Montserrat_500Medium',
        color: "#fafafa",
        fontSize: 15.36,
        textAlign: 'center',
        padding: 5,
        backgroundColor: "#636363",
        overflow: 'hidden',
    },
    moneyText: {
        color: "#fafafa",
        fontFamily: 'Montserrat_500Medium',
        fontSize: 19.20
    },
    moneyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    }
})