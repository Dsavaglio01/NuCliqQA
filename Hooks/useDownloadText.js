import { TEXT_MODERATION_URL, MODERATION_API_SECRET, MODERATION_API_USER } from "@env";
import axios from "axios";

export const useDownloadText = ({ data }) => {

  // Text Moderation Check 
  const checkTextModeration = async () => {
    data = new FormData();
    data.append('text', caption);
    data.append('lang', 'en');
    data.append('mode', 'rules');
    data.append('api_user', `${MODERATION_API_USER}`);
    data.append('api_secret', `${MODERATION_API_SECRET}`);
    try {
      const moderationResponse = await axios.get(TEXT_MODERATION_URL, {
        method:'post',
        data: data,
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
