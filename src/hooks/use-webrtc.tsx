import { EditingMessageType, MessageType } from '@/types';
import { useState, useEffect, useRef } from 'react';

export function useWebRTC(userId: string, peerId: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteId, setRemoteId] = useState<string>(peerId);
  const localStream = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [restrictedToEdit, setRestrictedToEdit] = useState<Date[]>([]);
  // if (userId == "undefined" || peerId == "undefined" || userId == "null" || peerId == "null") return;

  useEffect(() => {
    const domain = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT
    const ws = new WebSocket(`ws://${domain}`);
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', userId }))
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'message-create':
          console.log("NEW MESSAGE", message)
          setMessages((prev) => [...prev, message]);
          break;
        case 'enable-message-update': {
          console.log("Enabling editing for message:", message.createdAt);
          setRestrictedToEdit((prev) => {
            console.log("Before filtering:", prev);
            const updated = prev.filter(
              (date) => new Date(date).toISOString() !== new Date(message.createdAt).toISOString()
            );
            console.log("Filtered restrictedToEdit:", updated);
            return updated;
          });
          break;
        }
        case 'message-update': {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.createdAt === message.createdAt
                ? { ...msg, content: message.content, updatedAt: message.updatedAt }
                : msg
            )
          );
          console.log("Update on a message!", message);
          break;
        }
        case 'message-delete': {
          setMessages((prev) =>
            prev.filter(msg => msg.createdAt !== message.createdAt || msg.content !== message.content || msg.author.id !== message.authorId)
          );
          break;
        }
        case 'offer':
          handleOffer(message.offer, message.from);
          break;
        case 'answer':
          peerConnection.current?.setRemoteDescription(message.answer);
          break;
        case 'ice-candidate':
          peerConnection.current?.addIceCandidate(message.candidate);
          break;
        default:
          console.log('Unknown message type:', message);
      }
    };

    return () => ws.close();
  }, [userId]);

  const startCall = async () => {
    if (!remoteId) {
      console.error('No remote user ID selected!');
      return;
    }

    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current && localStream.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current!);
      });

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.send(
            JSON.stringify({
              type: 'ice-candidate',
              candidate: event.candidate,
              to: remoteId,
            })
          );
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.send(JSON.stringify({ type: 'offer', offer, to: remoteId }));

      peerConnection.current = pc;
    } catch (error) {
      console.error('Error accessing media devices', error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    localStream.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideoRef.current && localStream.current) {
      localVideoRef.current.srcObject = localStream.current;
    }

    localStream.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.current!);
    });

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.send(
          JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            to: from,
          })
        );
      }
    };

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket?.send(JSON.stringify({ type: 'answer', answer, to: from }));

    peerConnection.current = pc;
  };

  const sendMessage = (message: MessageType & { chatId: string }) => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'message-create', toId: peerId, id: message.id, content: message.content, author: message.author, createdAt: message.createdAt, updatedAt: message.updatedAt, chatId: message.chatId }));
      setRestrictedToEdit((prev) => [...prev, message.createdAt])
      console.log("Restricted after sending:", restrictedToEdit)
    }
  };

  const updateMessage = (message: EditingMessageType & { toId: string, updatedAt: Date } & { chatId: string }) => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'message-update', toId: peerId, id: message.id, content: message.content, updatedAt: message.updatedAt, chatId: message.chatId, createdAt: message.createdAt, authorId: message.authorId }));
    }
  }

  const deleteMessage = (message: EditingMessageType & { toId: string } & { chatId: string }) => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'message-delete', toId: peerId, id: message.id, content: message.content, chatId: message.chatId, createdAt: message.createdAt, authorId: message.authorId }));
    }
    setMessages((prev) =>
      prev.filter(msg => msg.createdAt !== message.createdAt || msg.content !== message.content || msg.author.id !== message.authorId)
    );
  }

  return {
    localVideoRef,
    remoteVideoRef,
    remoteStream,
    startCall,
    messages,
    sendMessage,
    updateMessage,
    deleteMessage,
    setMessages,
    restrictedToEdit
  };
}
