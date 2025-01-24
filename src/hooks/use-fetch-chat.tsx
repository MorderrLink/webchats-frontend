import { ChatType } from '@/types';
import { useState, useEffect } from 'react';

const useFetchChat = (chatId: string | string[] | undefined) => {
  const [chat, setChat] = useState<ChatType | null>(null);
  const [loadingChat, setLoading] = useState<boolean>(true);
  const [errorChat, setError] = useState<null | string>(null);

  useEffect(() => {
    if (typeof chatId !== "string" || chatId === undefined) return;

    const fetchChat = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('Sending chatId:', chatId);

        const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/api/get-chat-by-id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatId }),
        });

        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.statusText}`);
        }

        const { chat: chatData } = await response.json();
        setChat(chatData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId]);

  return { chat, loadingChat, errorChat };
};

export default useFetchChat;
