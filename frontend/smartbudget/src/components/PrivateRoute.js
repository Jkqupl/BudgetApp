import React from 'react';
import { Navigate} from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { session } = UserAuth();

  if(session === null ) {
    return <p>Loading...</p>; // or a loading spinner
  }

    return <> {session ? <> {children} </>: <Navigate to = "/signup" /> }</>; 

}

export default PrivateRoute;