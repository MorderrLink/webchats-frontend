import React from 'react'
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Header() {
  return (
    <header className='fixed top-0 h-20   flex items-center justify-between p-4 '>
        <SidebarTrigger />    
    </header>
  )
}
