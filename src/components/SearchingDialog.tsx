import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { DialogTrigger } from './ui/dialog';
import { SidebarMenuItem } from './ui/sidebar';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import useSearch from '@/hooks/use-search';
import Image from 'next/image';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from './ui/button';
import { findOrCreateChat } from '@/functions/find-or-create-char';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SearchingDialog() {
    const router = useRouter();
    const [inputValue, setInputValue] = useState(""); 
    const [debouncedValue, setDebouncedValue] = useState("");
    const { userId } = useAuth();
    const [isOpen, setIsOpen] = useState(false); // Стейт для управления открытием диалога

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(inputValue); 
        }, 1250);

        return () => clearTimeout(handler); 
    }, [inputValue]);

    const { results, loadingResults, errorResults } = useSearch(debouncedValue.trim());
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setInputValue("");
            setDebouncedValue("");
        }
    };

    const getOrCreateHandler = async (peerId: string) => {
        const { chatId: chatId } = await findOrCreateChat({ userId: userId!, peerId: peerId });
        if (chatId) {
            router.push(`/${chatId.id}`);
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}> {/* Передаем управление через state */}
            <DialogTrigger className='text-lg w-full flex flex-row gap-3 px-5 py-3 transition-all duration-200 rounded-md hover:bg-neutral-100'>
                <SidebarMenuItem className="w-full flex flex-row items-center gap-2">
                    <Search className="w-6 h-6"/>
                    Search            
                </SidebarMenuItem>
            </DialogTrigger>

            <DialogContent>
                <DialogTitle className='font-normal text-gray-500'>
                    Search for people
                    <VisuallyHidden>Search for people</VisuallyHidden>
                </DialogTitle>  
                <Input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder='Start Typing...'
                    className='outline-none focus-visible:outline-none' 
                />
                {(Array.isArray(results) && results.length > 0)
                    ?  <div className={`w-full h-full min-h-80 rounded-md border border-input shadow-md p-3 flex items-start justify-start gap-1`}>
                        {results.map(user => 
                            (
                                <div key={user.id} className="w-full flex flex-row items-center justify-between px-3 py-2 border border-muted rounded-sm">
                                    <div className='flex flex-row gap-2 items-center'>
                                        <div className='relative h-10 w-10 rounded-full'>
                                            <Image fill src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                                        </div>
                                        <h1>{user.name}</h1>
                                    </div>
                                    <Button type='submit' variant={'ghost'} onClick={async () => await getOrCreateHandler(user.id)}> Message </Button>
                                </div>
                            )
                        )}
                    </div>
                    :  <div className={`w-full h-full min-h-80 rounded-md border border-input shadow-md p-3 flex items-center justify-center`}>
                        <h1>Try typing something else</h1>
                    </div>
                }
            </DialogContent>
        </Dialog>
    );
}
