"use client";
import React, { useState, useEffect, useRef } from "react";
import { useWebRTC } from "@/hooks/use-webrtc";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useFetchChat from "@/hooks/use-fetch-chat";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ChatPeerType, EditingMessageType } from "@/types";
import { formatDistanceToNow } from "date-fns"
import { Pen, Phone } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"



const ChatPage = () => {
  const { chatId } = useParams();
  const { isSignedIn, userId } = useAuth();
  const { chat } = useFetchChat(chatId);

  const [peer, setPeer] = useState<ChatPeerType | undefined>(undefined);
  const [user, setUser] = useState<ChatPeerType | undefined>(undefined);
  const { startCall, sendMessage, updateMessage, deleteMessage, messages, setMessages, restrictedToEdit } = useWebRTC(userId!, peer?.id!);

  const [newMessage, setNewMessage] = useState<string>("");
  const [placeholder, setPlaceholder] = useState<string>("");
  const [editingMessage, setEditingMessage] = useState<EditingMessageType | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    new Notification("working")
  }, [])

  
  useEffect(() => {
    if (chat) {
      if (chat.messages) {
        setMessages(chat.messages);
      }
      if (chat.users) {
        const findPeer = chat.users.find((user) => user.id != userId);
        setPeer(findPeer);
        const findUser = chat.users.find((user) => user.id === userId);
        setUser(findUser);
      }
    }
  }, [chat]);

  // Прокрутка к последнему сообщению при обновлении списка сообщений
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Отправка сообщения
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      if (typeof chatId !== "string" || chatId === undefined) return;

      console.log("sending message chatId:", chatId);
      const messageDate =  new Date();
      sendMessage({
        content: newMessage,
        author: {
          id: userId || "",
          imageUrl: user?.imageUrl || "",
          name: user?.name || ""
        },
        id: "socketId",
        createdAt: messageDate,
        updatedAt: messageDate,
        chatId: chatId
      });
      setMessages((prev) => [
        ...prev,
        {
          id: (prev.length+1).toString(), 
          content: newMessage,
          author: {
            id: userId || "",
            name: user?.name || "Anonymous",
            imageUrl: user?.imageUrl || "",
          },
          createdAt: messageDate,
          updatedAt: messageDate,
        },
      ]);
      setNewMessage("");
    }
  };

  const handleEditMessage = ({ msgId, msgContent, authorId, createdAt }: { msgId: string, msgContent: string, authorId: string; createdAt: Date }) => {
    if (!editingMessage) {
      setPlaceholder(newMessage);
    }
    setEditingMessage({ content: msgContent, id: msgId, authorId: authorId, createdAt: createdAt});
    setNewMessage(msgContent);
  }

  const handleUpdateMessage = () => {
    //TODO
    if (!editingMessage || !peer || !chatId || typeof chatId !== "string") return;
    const updateDate = new Date()
    setMessages((prev) =>
      prev.map((message) =>
        message.id === editingMessage.id
          ? { ...message, content: editingMessage.content, updatedAt: updateDate }
          : message
      )
    );

    updateMessage({
      id: editingMessage.id,
      content: editingMessage.content,
      updatedAt: updateDate,
      toId: peer.id,
      chatId: chatId,
      authorId: editingMessage.authorId,
      createdAt: editingMessage.createdAt
    })

    setEditingMessage(null);
    setNewMessage(placeholder);
    setPlaceholder("");

  }

  const handleDeleteMessage = ({ msgId, msgContent, authorId, createdAt }: { msgId: string, msgContent: string, authorId: string; createdAt: Date }) => {

    if (!chatId || typeof chatId !== "string" || !peer) return;
    deleteMessage({
      authorId: authorId,
      chatId: chatId,
      content: msgContent,
      id: msgId,
      createdAt: createdAt,
      toId: peer.id
    })

  }


  // Обработка нажатия клавиш
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.ctrlKey && !editingMessage) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Enter" && e.ctrlKey) {
      setNewMessage((prev) => prev + "\n");
    } else if (e.key === "Enter" && !e.ctrlKey && editingMessage) {
      e.preventDefault()
      handleUpdateMessage()
    } else if (e.key === "Escape" && !e.ctrlKey && editingMessage) {
      e.preventDefault()
      setNewMessage(placeholder);
      setEditingMessage(null);
    }
  };


  if (!isSignedIn) return <div>Please sign in to chat.</div>;
  if (!chatId) return <div>Invalid chat ID.</div>;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-300">
        <div className="ml-16 flex items-center space-x-3">
          <div className="relative w-12 h-12 rounded-full">
            <Image
              fill
              src={peer?.imageUrl || "/favicon.ico"}
              alt="User"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <span className="text-lg font-semibold">{peer?.name}</span>
        </div>
        <Button onClick={startCall} className="bg-blue-500 text-white hover:bg-blue-600">
          <Phone /> Start Call
        </Button>
      </header>

      <div
        id="chat-container"
        ref={chatContainerRef}
        className="flex-1 bg-white flex flex-col gap-0.5 p-4 overflow-y-auto"
      >
        {messages.map((msg, index) => {
          
          return (
          <ContextMenu key={msg.id === "socketId" ? msg.id+index : msg.id}>
            <ContextMenuTrigger>
              <div key={msg.id === "socketId" ? msg.id+index : msg.id} className={` w-full message flex flex-row p-[2px] rounded-lg  ${msg.author.id === userId ? "justify-end" : "justify-start"}`}>
                <div className={`relative group rounded-lg w-max min-w-[250px] ${msg.author.id === userId ? "bg-blue-300" : "bg-gray-300"}`}>
                  <p className="text-sm py-2 pl-4 pr-5 ">{msg.content}</p>
                  <span className=" px-[10px] py-[2px] w-full flex justify-end text-end text-[11px] text-gray-700 select-none">{msg.createdAt != msg.updatedAt && "(edited) "}{formatDistanceToNow(msg.createdAt) + " ago"} </span>
                  { (msg.author.id === userId) && 
                  <button 
                  onClick={() => {
                    if (!restrictedToEdit || !restrictedToEdit.includes(msg.createdAt)) {
                      handleEditMessage({ msgId: msg.id, msgContent: msg.content, authorId: msg.author.id, createdAt: msg.createdAt })
                    } else {
                      alert("Wait a little bit please")
                    }
                  }}
                  className="absolute top-0 right-0 p-0 mx-3 my-2 bg-transparent hover:bg-transparent shadow-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    
                    <Pen className="h-[1.7ch] w-[1.7ch] p-0" /> 
                  
                  </button> }
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className={` ${msg.author.id === user?.id ? "" : "hidden"} `}>
              <ContextMenuItem onClick={() => {
                if (!restrictedToEdit || !restrictedToEdit.includes(msg.createdAt)) {
                  handleDeleteMessage({ msgId: msg.id, msgContent: msg.content, authorId: msg.author.id, createdAt: msg.createdAt })
                } else {
                  alert("Wait a little bit please")
                }
              }}>
                Delete
              </ContextMenuItem>

              <ContextMenuItem onClick={() => {
                if (!restrictedToEdit || !restrictedToEdit.includes(msg.createdAt)) {
                  handleEditMessage({ msgId: msg.id, msgContent: msg.content, authorId: msg.author.id, createdAt: msg.createdAt })
                } else {
                  alert("Wait a little bit please")
                }
              }}>
                Edit
              </ContextMenuItem>
              
              
            </ContextMenuContent>
          </ContextMenu>
          
        
        )})}
      </div>

      <div className="p-4">
        <div className="message-input flex items-center space-x-2">
          <Textarea
            value={!editingMessage ? newMessage : editingMessage.content}
            onChange={(e) => {
              if (!editingMessage) {
                setNewMessage(e.target.value)
              } else {
                setEditingMessage({ 
                  ...editingMessage,
                  content: e.target.value
                 })
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full p-2 border rounded-lg border-gray-300"
          />
          <Button onClick={!editingMessage ? handleSendMessage : handleUpdateMessage} className="bg-blue-500 text-white hover:bg-blue-600">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
