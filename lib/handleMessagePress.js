import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import renderLiked from './renderLiked';
function handleMessagePress(item) {
  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef(null);
    setTapCount(tapCount + 1);
    if (tapCount === 0) {
      // Set a timer for the second tap
      timerRef.current = setTimeout(() => {
        // If no second tap occurs within the timer, treat it as a single tap
        setTapCount(0);
      }, 500); // Adjust the time limit according to your requirements
    } else if (tapCount === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      // If it's the second tap and the timer is still active, treat it as a double tap
      clearTimeout(timerRef.current);
      setTapCount(0);
      renderLiked(item)
    }
  }
export default handleMessagePress;