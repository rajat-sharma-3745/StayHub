import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL

const AppContext = createContext();

export const AppProvider = ({children}) => {
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const {user} = useUser();
    const {getToken} = useAuth(); // gettoken is a function to access the current user session token(jwt),it returns a promise resolved to token , it passed in the auth headers, so that the clerk middleware can use it 
    const [isOwner,setIsOwner] = useState(false)
    const [showHotelReg,setShowHotelReg] = useState(false)
    const [searchedCities,setSearchedCities]= useState([]);
    const [rooms,setRooms]= useState([]);
    

    const fetchRooms = async() =>{
        try {
            const {data} = await axios.get('/api/rooms')
            if(data.success){
                setRooms(data.rooms)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
   

    const fetchUser = async()=>{
        try {
           const {data} =  await axios.get('/api/user',{
                headers:{
                    Authorization:`Bearer ${await getToken()}`
                }
            })
            if(data.success){
                setIsOwner(data.role==="hotelOwner");
                setSearchedCities(data.recentSearchedCities)
            }else{
                // Retry fetching
                setTimeout(()=>{
                    fetchUser()
                },5000)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(()=>{
      if(user){
        fetchUser();
      }
    },[user])
     useEffect(()=>{
        fetchRooms()
    },[])
    const value = {
     currency,navigate,user,getToken,isOwner,setIsOwner,showHotelReg,setShowHotelReg,axios,searchedCities,setSearchedCities,rooms,setRooms
    }
    return (
        <AppContext.Provider value={value}>
         {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext);

