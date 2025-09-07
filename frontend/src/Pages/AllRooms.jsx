import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { assets, facilityIcons, roomsDummyData } from '../assets/assets';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';

const roomTypes=[
    "Single Bed",
    "Double Bed",
    "Luxury Room",
    "Family Suite",
]

const priceRanges = [
    '0 to 500',
    '500 to 1000',
    '1000 to 2000',
    '2000 to 3000',
]

const sortOptions=[
    'Price Low to High',
    'Price High to Low',
    'Newest First',
]

const CheckBox = ({label,selected=false,name,value,onChange=()=>{} }) =>{
    return (
        <label className='flex items-center cursor-pointer gap-3 mt-2 text-sm'>
            <input type="checkbox" name={name} value={value} checked={selected} onChange={(e)=>onChange(e)}   />
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}
const RadioButton = ({label,selected=false,onChange=()=>{} }) =>{
    return (
        <label className='flex items-center cursor-pointer gap-3 mt-2 text-sm'>
            <input type="radio" name="sortOption"  checked={selected} onChange={(e)=>onChange(e)}   />
            <span className='font-light select-none'>{label}</span>
        </label>
    )
}

const AllRooms = () => {
    const [searchParams,setSearchParams] = useSearchParams();
    const {rooms,navigate,currency} = useAppContext();
    
    const [showFilters,setShowFilters] = useState(false); // to hide/display filters
    const [selectedFilters,setSelectedFilters] = useState({
         roomType:[],
         priceRange:[],
    })
    const [selectedSort,setSelectedSort] = useState('');

    const handleFilterChange = (e) => {
       const {checked,value,type,name} = e.target;
    //    console.log()
       const newFilters = {...selectedFilters}
       if(type=='checkbox'){
        if(checked){
            // then add the value to array inside the object
             newFilters[name] = [...(newFilters[name]||[]),value];//we can directly push also
        }else{
             newFilters[name]  = newFilters[name].filter((item)=>item!==value)
        }
       }


       setSelectedFilters(newFilters)
    }

    const handleSortChange = (sortOption) =>{
        setSelectedSort(sortOption)
    }

    // this function will run for each room and first it will check if the none of the filters are selected then return true for each room , means they all will be shown and 2nd condition will return true if the roomtype is in the selected filters
    // first condition of both the below functions will return true for all rooms ,when there are no selected filters
    const matchesRoomType = (room) => {
        return selectedFilters.roomType.length===0 || selectedFilters.roomType.includes(room.roomType)
    }
    
    //function which will check that the room matches any selected price range 
    // For e.g there are 4 price ranges we have to check that a single room matches any one of them thats why some method
    // Why some() : bcoz we wanna check that does the room price falls 
    const matchesPriceRange = (room) => {
        return selectedFilters.priceRange.length===0 || selectedFilters.priceRange.some((range)=>{
            // get the min and max
            const [min,max] = range.split(' to ').map(Number);
            return room.pricePerNight>=min && room.pricePerNight<=max  //if any of the selected price range matches this condition than it returns true
        })
    }

    // function to sort rooms
    const sortRooms = (a,b) => {
      if(selectedSort ==="Price Low to High"){
        return a.pricePerNight-b.pricePerNight;  //a-b for smaller first , ascending order
      }
      if(selectedSort ==="Price High to Low"){
        return b.pricePerNight-a.pricePerNight;  //a-b for larger first , descending order
      }
      if(selectedSort ==="Newest First"){
        return new Date(a.createdAt)-new Date(b.createdAt);  //a-b for smaller first , ascending order ,sort a/c to date
      }
      return 0; //for same order 
    }

    // filter destination
    const filterDestination = (room) =>{
        const destination = searchParams.get('destination');
        if(!destination){
            return true;
        }
        return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
    }

    // We will filter rooms on the frontend itself, all above methods are for that
    const filteredRooms = useMemo(()=>{
        return rooms.filter((room)=>matchesRoomType(room) && matchesPriceRange(room) && filterDestination(room)).sort(sortRooms)
    },[rooms,selectedFilters,selectedSort,searchParams])

    const clearFilters = () => {
        setSelectedFilters({
         roomType:[],
         priceRange:[],
    })
    setSelectedSort('');
    setSearchParams({})
    }
    
  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 l:px-32'>
        {/* left side */}
        <div className=''>
           <div className='flex flex-col items-start text-left'>
            <h1 className='font-playFair text-4xl md:text-[40px]'>Hotel Rooms</h1>
            <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>Take advantage of limited-time offers and special packages to enhance your stay and create unforgettable memories.</p>
           </div>

           {filteredRooms.map((room)=>(
            <div key={room._id} className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
                <img src={room.images[0]} alt="hotel-img" title='View Room Details' className='rounded-xl shadow-lg object-cover cursor-pointer max-h-65 md:w-1/2' onClick={()=>{navigate(`/rooms/${room._id}`);scrollTo(0,0)}}/>
                <div className='md:w-1/2 flex flex-col gap-2'>
                    <p className='text-gray-500'>{room.hotel.city}</p>
                    <p onClick={()=>{navigate(`/rooms/${room._id}`);scrollTo(0,0);}} className='text-gray-800 text-3xl font-playFair cursor-pointer'>{room.hotel.name}</p>
                    <div className='flex items-center'>
                        <StarRating/>
                        <p className='ml-2'>200+ reviews</p>
                    </div>
                    <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                        <img src={assets.locationIcon} alt="locationIcon" />
                        <span>{room.hotel.address}</span>
                    </div>
                    <div className='flex flex-wrap my-3 gap-4'>
                        {room.amenities.map((item,index)=>(
                            <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'>
                                <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
                                <p className='text-xs'>{item}</p>
                            </div>
                        ))}
                    </div>

                    <p className='text-xl font-medium text-gray-700'>${room.pricePerNight} /night</p>
                </div>
            </div>
           ))}
        </div>
        {/* filters */}
        <div className = 'bg-white w-80 border border-gray-300 text-gray-600 max-lg:mt-8 min-lg:mt-16'>
          <div className = {`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300  ${showFilters && 'border-b'}`}>
            <p className = 'text-base font-medium text-gray-800'>FILTERS</p>
            <div className = 'text-xs cursor-pointer'>
                <span onClick={()=>setShowFilters(p=>!p)} className='lg:hidden'>{showFilters?'HIDE':"SHOW"}</span>
                <span className='hidden lg:block'>
                    CLEAR
                </span>
            </div>
          </div>
          <div className = {`${showFilters ? 'h-auto':'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
            <div className = 'px-5 pt-5'>
               <p className ='font-medium text-gray-800 pb-2 '>Popular filters</p>
               {roomTypes.map((room,index)=>(
                <CheckBox key={index} label={room} name={'roomType'} value={room} selected={selectedFilters.roomType.includes(room)} onChange={handleFilterChange} />
               ))}
            </div>
            <div className = 'px-5 pt-5'>
               <p className ='font-medium text-gray-800 pb-2 '>Price Range</p>
               {priceRanges.map((range,index)=>(
                <CheckBox key={index} label={`${currency} ${range}`} name={'priceRange'} value={range} selected={selectedFilters.priceRange.includes(range)} onChange={(e)=>handleFilterChange(e)} />
               ))}
            </div>
            <div className = 'px-5 pt-5 pb-7'>
               <p className ='font-medium text-gray-800 pb-2 '>Sort By</p>
               {sortOptions.map((option,index)=>(
                <RadioButton key={index} label={option} onChange={()=>handleSortChange(option)} selected={selectedSort===option} />
               ))}
            </div>
          </div>
        </div>
    </div>
  )
}

export default AllRooms