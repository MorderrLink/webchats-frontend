import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type MediaDialogProps = {
    setChosenVideoId: (id: string) => void;
    startCall: () => void;
}

export default function MediaDialog({ setChosenVideoId, startCall }: MediaDialogProps) {

    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        async function checkDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('Available media devices:', devices);
            if (devices) {
            setDevices(devices)
            }
        } catch (err) {
            alert(err);
        }
        }

        checkDevices();
    }, []);

  return (
    <Dialog>
        <DialogTrigger>
            Start Call
        </DialogTrigger>
        <DialogContent>
          
          <DialogTitle>Choose video channel</DialogTitle>
          {devices.map((device, index) => (
            <button key={device.deviceId+index} onClick={() => {
              
              setChosenVideoId(device.deviceId)
              startCall()
            }}>{device.label}</button>
          ))}
          
        </DialogContent>
      </Dialog>
  )
}
