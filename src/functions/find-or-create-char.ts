


type findOrCreateChatParams = {
    userId: string;
    peerId: string;
}

export const findOrCreateChat = async ({ userId, peerId }: findOrCreateChatParams) => {
    if (!userId || !peerId) return;
    try {
        const response = await fetch('http://localhost:8000/api/find-or-create-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, peerId }),
        });

        if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const chatId = await response.json();

        return chatId

    } catch (error) {
        console.error('Failed to find or create chat:', error);
        throw error;
    }
};
