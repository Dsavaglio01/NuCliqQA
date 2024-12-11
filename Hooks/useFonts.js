import * as Font from 'expo-font';
export default useFonts = async() => {
    await Font.loadAsync({
        montserrat: require('../assets/Montserrat-VariableFont_wght.ttf')
    })
}