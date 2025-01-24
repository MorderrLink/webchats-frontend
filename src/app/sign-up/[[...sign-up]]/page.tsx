import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='absolute top-0 left-0 w-screen h-screen flex items-center justify-center '>
        <SignUp />
    </div>
  )
}