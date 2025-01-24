'use client';
import { SignOutButton, useAuth } from '@clerk/nextjs';



const Home = () => {

  const { userId } = useAuth();
  
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