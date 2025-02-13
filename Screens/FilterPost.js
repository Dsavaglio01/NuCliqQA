import { StyleSheet, Text, View, Button, Dimensions } from 'react-native'
import React, {useState, useRef} from 'react'
import RegisterHeader from '../Components/RegisterHeader';
import { useNavigation } from '@react-navigation/native';
import NewPostHeader from '../Components/NewPostHeader';
import Filter from '../Design/Filter';
const settings = [
  {
    name: 'hue',
    minValue: 0,
    maxValue: 6.3,
  },
  {
    name: 'blur',
    minValue: 0,
    maxValue: 30,
  },
  {
    name: 'sepia',
    minValue: -5,
    maxValue: 5,
  },
  {
    name: 'sharpen',
    minValue: 0,
    maxValue: 15,
  },
  {
    name: 'negative',
    minValue: -2.0,
    maxValue: 2.0,
  },
  {
    name: 'contrast',
    minValue: -10.0,
    maxValue: 10.0,
  },
  {
    name: 'saturation',
    minValue: 0.0,
    maxValue: 2,
  },
  {
    name: 'brightness',
    minValue: 0,
    maxValue: 5,
  },
  {
    name: 'temperature',
    minValue: 0.0,
    maxValue: 40000.0,
  },
  {
    name: 'exposure',
    step: 0.05,
    minValue: -1.0,
    maxValue: 1.0,
  },
];
const FilterPost = ({route}) => {
    const {post} = route.params;
    const navigation = useNavigation();
    const [editorVisible, setEditorVisible] = useState(false);
    const [imageData, setImageData] = useState(null);
    const [filters, setFilters] = useState(false);
    const [actualFilter, setActualFilter] = useState({});
    const [imageFilter, setImageFilter] = useState({...settings,
    hue: 0,
    blur: 0,
    sepia: 0,
    sharpen: 0,
    negative: 0,
    contrast: 1,
    saturation: 1,
    brightness: 1,
    temperature: 6500,
    exposure: 0})
    //console.log(actualFilter
    const width = Dimensions.get('screen').width
    const height = Dimensions.get('screen').height
    const [filterName, setFilterName] = useState('');
    const imageRef = useRef(null)
  return (
    <View style={styles.container}>
        <View style={styles.main}> 
          <NewPostHeader />
          
          {settings.map(filter => (
            <Filter
              key={filter.name}
              name={filter.name}
              value={filterName}
              minimum={filter.minValue}
              maximum={filter.maxValue}
              step={filter.step}
              onChange={value => setFilterName(value)}
            />
          ))}
          <Button
            rounded={false}
            title='Save'
            style={styles.button}
            block />
        </View>
    </View>
  )
}

export default FilterPost

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212"
    },
    main: {
       marginRight: '5%',
        marginLeft: '5%',
        marginTop: '5%',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        flex: 1,
    }
    
})