'use client';

import useFetchUser from '@/hooks/use-fetch-user';
import { SignOutButton, useAuth } from '@clerk/nextjs';



const Home = () => {

  const { isSignedIn, userId, getToken } = useAuth();
  const { user, loading, error } = useFetchUser(userId); 
  
  return (
    <div>
      userID: {userId}
      {/* <h1 className='text-'>{loading ? "Loading..." : error ? "Error..." : JSON.stringify(user)}</h1> */}
      <div>
        <SignOutButton />
      </div>
    </div>
  );
};

export default Home;