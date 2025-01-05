import { useState } from "react";
import { Alert } from "react-native";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { IMAGE_MODERATION_URL, MODERATION_API_SECRET, MODERATION_API_USER, BACKEND_URL } from "@env";
import axios from "axios";

export const useMultiDownloadImage = ({ fileName, data, backendURL, dataForURL, actualPostArray, setNewPostArray }) => {
  const [downloadLoading, setDownloadLoading] = useState(false);
  const storage = getStorage();

  // Upload Image to Firebase Storage
  const addImage = async () => {
    try {
      setDownloadLoading(true);
      const response = await fetch(data.post);
      const blob = await response.blob();
      const storageRef = ref(storage, fileName);

      await uploadBytesResumable(storageRef, blob);
      await getLink(fileName, data);
    } catch (error) {
      console.error("Error uploading image:", error);
      setDownloadLoading(false);
    }
  };
  const addVideo = async () => {
    try {
    setDownloadLoading(true);
    const response = await fetch(data.post);
    const blob = await response.blob();
    const storageRef = ref(storage, fileName);

    await uploadBytesResumable(storageRef, blob);
    await getVideoLink(fileName, data);
    } catch (error) {
    console.error("Error uploading image:", error);
    setDownloadLoading(false);
    }
  };
  // Get Download URL from Firebase
  const getLink = async (post, item) => {
    try {
      const starsRef = ref(storage, post);
      const url = await getDownloadURL(starsRef);
      await checkImageModeration(url, starsRef, item);
    } catch (error) {
      console.error("Error getting download URL:", error);
      setDownloadLoading(false);
    }
  };
  const getVideoLink = async (post, item) => {
    try {
      const starsRef = ref(storage, post);
      const url = await getDownloadURL(starsRef);
      await checkVideoModeration(url, starsRef, item);
    } catch (error) {
      console.error("Error getting download URL:", error);
      setDownloadLoading(false);
    }
  };

  // Image Moderation Check
  const checkImageModeration = async (url, reference, item) => {
    try {
      const moderationResponse = await axios.get(IMAGE_MODERATION_URL, {
        params: {
          url,
          models: "nudity-2.0,wad,offensive,scam,gore,qr-content",
          api_user: MODERATION_API_USER,
          api_secret: MODERATION_API_SECRET,
        },
      });

      if (!validateModerationResponse(moderationResponse.data)) {
        handleModerationFailure(reference);
        return;
      }

      // Post Validated Image to Backend
      await postImageToBackend(item);
    } catch (error) {
      console.error("Error in image moderation:", error);
      setDownloadLoading(false);
    }
  };
  // Video Moderation Check 
  const checkVideoModeration = async (url, reference, item) => {
    try {
      const moderationResponse = fetch(`${BACKEND_URL}/api/videoModeration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video: url,
      }),
      });

      if (!validateModerationResponse(moderationResponse.data.frames)) {
        handleModerationFailure(reference);
        return;
      }

      // Post Validated Image to Backend
      await postVideoToBackend(item);
    } catch (error) {
      console.error("Error in image moderation:", error);
      setDownloadLoading(false);
    }
  };
  // Validate Moderation Response
  const validateModerationResponse = (data) => {
    const thresholds = {
      drugs: 0.9,
      gore: 0.9,
      offensive: 0.9,
      scam: 0.9,
      weapon: 0.9,
    };

    const failed = Object.entries(data).some(([key, value]) => {
      if (key in thresholds && value > thresholds[key]) return true;
      if (key === "nudity" && containsNumberGreaterThan(getValuesFromImages(Object.values(value)), 0.95)) return true;
      return false;
    });

    return !failed;
  };

  // Handle Moderation Failure
  const handleModerationFailure = async (reference) => {
    Alert.alert(
      "Unable to Post",
      "This Story Goes Against Our Guidelines",
      [
        {
          text: "Cancel",
          onPress: () => deleteObject(reference).then(() => setDownloadLoading(false)),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => deleteObject(reference).then(() => setDownloadLoading(false)),
        },
      ]
    );
  };

  // Post Image to Backend
  const postImageToBackend = async (item) => {
    try {
      const response = await fetch(`${backendURL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: dataForURL,
        }),
      });

      const responseData = await response.json();

      if (responseData.done) {
        setDownloadLoading(false);
      }
    } catch (error) {
      console.error("Error posting image to backend:", error);
      setDownloadLoading(false);
    }
  };

  // Helper Functions
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

  return { addImage, addVideo, downloadLoading };
};
