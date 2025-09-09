import React from 'react'
import { useAppContext } from '../context/AppContext'
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

const Loader = () => {
    const {navigate} = useAppContext();
    const {nextUrl} = useParams();


    useEffect(()=>{
        if(nextUrl){
            setTimeout(()=>navigate(`/${nextUrl}`),8000)
        }
    },[nextUrl])

  return (
    <div className='flex justify-center items-center h-screen'>
       <div className='h-24 w-24 rounded-full border-4 border-t-primary border-gray-300 animate-spin'></div>
    </div>
  )
}

export default Loader