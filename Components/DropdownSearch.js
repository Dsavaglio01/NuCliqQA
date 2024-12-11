import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    View,
    Text,
    TextInput,
    FlatList
} from 'react-native';

const SearchDropDown = ({items, onPress, data, renderEvents}) => {
    //const { dataSource } = props
    return (
        <FlatList 
            data={data}
            renderItem={renderEvents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{width: '100%', zIndex: 3}}
        />

    )
}
export default SearchDropDown

const styles = StyleSheet.create({
    container: {
        width: '100%',
        //backgroundColor: 'red'
    },
    /* container: {
        position: 'absolute',
        top: '6.2%',
        left: 0, right: 0, bottom: 0,

    }, */
    itemText: {
        color: 'black',
        paddingHorizontal: 10,
    },
    noResultView: {
        alignSelf: 'center',
        // margin: 20,
        height: 100,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center'
    },

});