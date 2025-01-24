

export type UserType = {
    id: string;
    name: string;
    imageUrl: string;
    chats: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
}

 // this is "sidebar user data" because it contains more data about user's chats, so this type is used in a sidebar to describe user's chats
export type SidebarUserData = {
    id: string;
    name: string;
    imageUrl: string;
    chats: {
        id: string;
        updatedAt: Date;
        users: {
            name: string;
            imageUrl: string;
            _count: {
                chats: number;
            };
        }[];
        messages: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            content: string;
            chatId: string;
        }[];
    }[];
}



export type ChatType = {
    id: string;
    messages: {
        id: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: string;
            name: string;
            imageUrl: string;
        }
    }[];
    users: {
        id: string;
            name: string;
            imageUrl: string;
    }[];
    updatedAt: Date;
}

export type ChatPeerType =  {
    id: string;
    name: string;
    imageUrl: string;
}


export type MessageType = {
        id: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        author: {
            id: string;
            name: string;
            imageUrl: string;
        }
}


export type EditingMessageType = {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
}