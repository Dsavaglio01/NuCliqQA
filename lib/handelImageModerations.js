import axios from "axios";
import { Alert } from "react-native";
import { deleteObject } from "firebase/storage";
const handleModerationAlert = async (reference, itemId) => {
  Alert.alert('Unable to Post', `Post #${itemId} Goes Against Our Guidelines`, [
    {
      text: 'Cancel',
      onPress: () => deleteObject(reference).catch(console.error),
      style: 'cancel',
    },
    {
      text: 'OK',
      onPress: () => deleteObject(reference).catch(console.error),
    },
  ]);
};

const removeUnnecessaryNudityKeys = (data) => {
  const keysToRemove = ['none', 'context'];

  const removeKeysRecursively = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Base case: Not an object, return as is
    }

    // Iterate over object keys
    for (const key in obj) {
      if (keysToRemove.includes(key)) {
        delete obj[key]; // Remove unwanted keys
      } else if (typeof obj[key] === 'object') {
        removeKeysRecursively(obj[key]); // Recurse into nested objects
      }
    }

    return obj;
  };

  return removeKeysRecursively(data);
};

const handleContentModeration = async ({
  url,
  mood,
  caption,
  IMAGE_MODERATION_URL,
  MODERATION_API_USER,
  MODERATION_API_SECRET,
  TEXT_MODERATION_URL,
  actualPostArray,
  setNewPostArray,
  reference,
  item,
}) => {
  try {
    // Fetch Image Moderation Data
    console.log(`Item: ${item}`)
    const response = await axios.get(IMAGE_MODERATION_URL, {
      params: {
        url,
        models: 'nudity-2.0,wad,offensive,scam,gore,qr-content',
        api_user: MODERATION_API_USER,
        api_secret: MODERATION_API_SECRET,
      },
    });

    const moderationData = response.data;
    const cleanedData = removeUnnecessaryNudityKeys(moderationData.nudity);
    const containsNumberGreaterThan = (array, threshold) => array.some((element) => element > threshold);
  
    const getValuesFromImages = (list) => {
        let values = [];
        list.forEach((item) => {
        if (typeof item === "number") values.push(item);
        if (typeof item === "object") {
            Object.values(item).forEach((value) => {
            if (typeof value === "number") values.push(value);
            if (typeof value === "object") values = values.concat(getValuesFromImages([value]));
            });
        }
        });

        return values;
    };
    //console.log(getValuesFromImages(Object.values(moderationData.nudity)))
    const moderationFailures = [
      moderationData.drugs > 0.9,
      moderationData.gore?.prob > 0.9,
      containsNumberGreaterThan(getValuesFromImages(Object.values(cleanedData)), 0.95),
      containsNumberGreaterThan(Object.values(moderationData.offensive), 0.9),
      moderationData.scam > 0.9,
      moderationData.weapon > 0.9,
    ];

    if (moderationFailures.some(Boolean)) {
      await handleModerationAlert(reference, item.id);
      throw new Error('Content moderation failed');
    }

    // Handle Caption Text Moderation
    if (caption.length > 0) {
      const formData = new FormData();
      formData.append('text', caption);
      formData.append('lang', 'en');
      formData.append('mode', 'rules');
      formData.append('api_user', MODERATION_API_USER);
      formData.append('api_secret', MODERATION_API_SECRET);

      const textResponse = await axios.post(TEXT_MODERATION_URL, formData);
      const { link, profanity } = textResponse.data;

      if (link.matches.length > 0) {
        linkUsernameAlert();
        throw new Error('Link moderation failed');
      }

      if (profanity.matches.some(obj => obj.intensity === 'high')) {
        profanityUsernameAlert();
        throw new Error('Profanity moderation failed');
      }
    }

    // Update Post Array
    const updatedArray = actualPostArray.map(obj => ({ ...obj }));
    const targetIndex = actualPostArray.findIndex(e => e.post === item.post);
    updatedArray[targetIndex].post = url;
    setNewPostArray(prevState => [updatedArray[targetIndex], ...prevState]);

  } catch (error) {
    console.error('Error in content moderation:', error);
  }
};
export default handleContentModeration;
