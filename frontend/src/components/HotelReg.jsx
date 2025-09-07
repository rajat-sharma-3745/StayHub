import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';
import { data } from 'react-router-dom';

const HotelReg = () => {
  const {setShowHotelReg,axios,getToken,setIsOwner} = useAppContext();
  const [name,setName] = useState("");
  const [address,setAddress] = useState("");
  const [contact,setContact] = useState("");
  const [city,setCity] = useState("");

  async function submitHandler(e){
     e.stopPropagation();
     e.preventDefault();
     try {
      const {data}= await axios.post('/api/hotels',{name,address,contact,city},{
        headers:{
          Authorization:`Bearer ${await getToken()}`
        }
       })
       if(data.success){
        toast.success(data.message);
        setIsOwner(true);
        setShowHotelReg(false);
       }else{
        toast.error(data.message)
       }
     } catch (error) {
        toast.error(error.message)
     }
  }
  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70'>
        <form onSubmit={submitHandler} action="" className='flex bg-white rounded-xl max-w-4xl max-md:mx-2'>
            <img src={assets.regImage} alt="" className='w-1/2 rounded-xl hidden md:block' />
            <div className='relative flex flex-col items-center md:w-1/2 p-8 md:p-10'>
                <img src={assets.closeIcon} alt="close" onClick={()=>setShowHotelReg(p=>!p)}  className='absolute top-4 right-4 h-4 w-4 cursor-pointer' />
                <p className='text-2xl font-semibold mt-6'>Register Your Hotel</p>
                {/* Hotel Name */}
                <div className='w-full mt-4'>
                   <label htmlFor="name" className='font-medium text-gray-500'>Hotel Name</label>
                   <input id='name' value={name} onChange={(e)=>setName(e.target.value)} type="text" placeholder='Type Here' className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 font-light outline-indigo-500' required />
                </div>
                {/* Phone */}
                <div className='w-full mt-4'>
                   <label htmlFor="contact" className='font-medium text-gray-500'>Phone</label>
                   <input id='contact' value={contact} onChange={(e)=>setContact(e.target.value)} type="text" placeholder='Type Here' className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 font-light outline-indigo-500' required />
                </div>
                {/* Address */}
                <div className='w-full mt-4'>
                   <label htmlFor="address" className='font-medium text-gray-500'>Address</label>
                   <input id='address' value={address} onChange={(e)=>setAddress(e.target.value)}  type="text" placeholder='Type Here' className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 font-light outline-indigo-500' required />
                </div>
                {/* City dropdown */}
                <div className='w-full mt-4 max-w-60 mr-auto'>
                    <label htmlFor="city" className='font-medium text-gray-500'>City</label>
                    <select name="" id="city" value={city} onChange={(e)=>setCity(e.target.value)} className='border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light' required>
                       <option value="">Select City</option>
                       {cities.map((city)=>(
                        <option value={city}>{city}</option>
                       ))}
                    </select>
                </div>
                <button className='bg-indigo-500 hover:bg-indigo-600 transition-all mr-auto text-white px-6 py-2 rounded cursor-pointer mt-6'>Register</button>
            </div>
        </form>
    </div>
  )
}

export default HotelReg