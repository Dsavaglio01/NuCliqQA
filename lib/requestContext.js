import React, { createContext, useState, useEffect } from 'react';
import useAuth from '../Hooks/useAuth';
import { getRequests } from '../firebaseUtils';
const RequestContext = createContext(null);
export const RequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const {user} = useAuth();
  useEffect(() => {
    if (user.uid) {
        const fetchRequestData = async () => {
            await getRequests(user.uid, (data) => {
                setRequests(data); // Update the state with the fetched data
            });
        };
        fetchRequestData();
    }
  }, [user?.uid]);
  return (
    <RequestContext.Provider value={requests}>
      {children}
    </RequestContext.Provider>
  );
};

export default RequestContext;