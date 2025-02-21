import React, { createContext, useState, useEffect } from 'react';
import useAuth from '../Hooks/useAuth';
import { getRealProfileDetails } from '../firebaseUtils';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
const RealProfileContext = createContext(null);
export const RealProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const {user} = useAuth();
  useEffect(() => {
    if (user?.uid) {
      // Setting up the real-time listener directly here
      const unsub = onSnapshot(doc(db, "profiles", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setProfile({ id: user.uid, ...profileData });
        } else {
          console.warn("Profile does not exist.");
          setProfile(null);
        }
      }, (error) => {
        console.error("Error fetching profile details:", error);
      });

      // Cleanup the listener when the component unmounts or user changes
      return () => unsub();
    }
  }, [user?.uid]);
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