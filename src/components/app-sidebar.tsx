"use client"
import { PictureInPicture, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import useFetchUserWithChats from "@/hooks/use-fetch-user-chats"
import { useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image" ;
import Link from "next/link";
import SearchingDialog from "./SearchingDialog";



export function AppSidebar() {
  const { userId } = useAuth();
  const { user: user, loading, error } = useFetchUserWithChats(userId);
   
  // console.log("[App-Sidebar]::", user?.name, user);
  return (
    <Sidebar>
      
      <SidebarContent className="flex flex-col justify-between">
        
        <SidebarGroup>
          <div className="flex justify-center items-center">
            <UserButton showName />
          </div>

          <SidebarGroupLabel className="select-none">
            Search for people
          </SidebarGroupLabel>
          <SidebarGroupContent>

            <SidebarMenu>
                
                <SearchingDialog />
                
              {/* </SidebarMenuItem> */}
            </SidebarMenu>

            <SidebarGroup>
              <SidebarGroupContent>
                
                <SidebarGroupLabel>
                  Your chats
                </SidebarGroupLabel>

                <SidebarMenu>
                  {user && user.chats && user.chats.map((chat) => {
                      const secondUser = chat.users.filter(second => second?.name != user?.name)[0]
                      const chatImage = (chat.users.length > 2) ? <PictureInPicture /> : <div className="relative h-8 w-8 rounded-full"><Image src={secondUser?.imageUrl || "ALT"} fill className="h-8 w-8 rounded-full" alt="?"/></div>
                      const chatName = (chat.users.length > 2) ? "Chat" : secondUser.name
                    return (
                      <SidebarMenuItem key={chat.id}>
                          <Link href={`/${chat.id}`} className="flex flex-row items-center">
                            {chatImage} 
                            <div className="flex flex-col items-start">
                              <h1>{chatName}</h1>
                              <p>{chat.messages[-1]?.content.slice(0, 10)}</p>
                            </div>
                          </Link>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>

              </SidebarGroupContent>
            </SidebarGroup>

          </SidebarGroupContent>
        </SidebarGroup>



        <SidebarGroup className="py-3">
          <SidebarMenu>
              <SidebarMenuItem className=" flex flex-row items-center gap-2">
                
                  <Link href={`/settings`} className="text-lg w-full flex flex-row justify-between p-5">
                    Settings 
                    <Settings className="w-6 h-6"/>
                  </Link>
                
                
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>


      </SidebarContent>
    </Sidebar>
  )
}