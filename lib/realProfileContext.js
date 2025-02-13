import React, { createContext, useState, useEffect } from 'react';
import useAuth from '../Hooks/useAuth';
import { getRealProfileDetails } from '../firebaseUtils';
import { onSnapshot } from 'firebase/firestore';
const RealProfileContext = createContext(null);
export const RealProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const {user} = useAuth();
  useEffect(() => {
    if (user?.uid) {
        const fetchProfileData = async () => {
            const profileData = await getRealProfileDetails(user.uid);
            if (profileData) {
                console.log(`Profile data: ${profileData}`)
                setProfile({id: user.uid, ...profileData})
            }
        };
        fetchProfileData();
    }
  }, [user?.uid, onSnapshot]);
  /* const fetchNotifications = async() => {
          const tempList = await fetchFirstNotifications(user.uid, false, null)
          setNotifications(tempList)
        }
        fetchNotifications(); */
  return (
    <RealProfileContext.Provider value={profile}>
      {children}
    </RealProfileContext.Provider>
  );
};

export default RealProfileContext;