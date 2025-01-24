"use client"

import { SignInButton, SignOutButton, useAuth, UserButton } from '@clerk/nextjs'
import React from 'react'

export default function settings() {

    const { userId } = useAuth()
    

  return (
    <div className='w-full h-full flex justify-center items-center'>
        {userId 
        ? 
        
            <div className='flex flex-col items-center justify-center'>
                <h1>Settings</h1>
                <h1 className='w-full h-full flex flex-row items-center justify-center text-xl gap-2'>Manage your account <UserButton /></h1>
                <SignOutButton><span className='text-lg text-red-500 p-3 rounded-md border-[1px] border-transparent hover:border-red-500 transition-all duration-200'>Sign out of the account</span></SignOutButton>
            </div>
            
        : <SignInButton />}
    </div>
  )
}
