import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TmEvent } from '../types';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const categories = [
  'Music',
  'Sport',
  'Arts, Theatre, & Comedy',
  'Family',
  'Festivals'
];

const formatEventDate = (d: string, t: string) => {
  if (!d) return '';

  try {
    const date = new Date(d + 'T00:00:00');

    const day = date
      .toLocaleDateString('en-US', { weekday: 'short' })
      .toUpperCase();

    const mon = date
      .toLocaleDateString('en-US', { month: 'short' })
      .toUpperCase();

    const num = date.getDate();
    const year = date.getFullYear();

    let timeStr = '';

    if (t) {
      const [h, m] = t.split(':');
      const hr = parseInt(h);

      timeStr = ` • ${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
    }

    return `${day} • ${mon} ${num}, ${year}${timeStr}`;

  } catch {
    return d;
  }
};

export const Discover: React.FC = () => {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [activeCategory, setActiveCategory] = useState('');

  // Location
  const [city, setCity] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [showLocation, setShowLocation] = useState(false);

  // Dates
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigate = useNavigate();
  const { setSelectedEvent } = useStore();

  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(
  async (
    q: string,
    selectedCity = city,
    selectedDateValue = selectedDate
  ) => {

    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);

    try {

      const API_URL = import.meta.env.VITE_API_URL;

      const params: any = {
        q,
        size: 20,
      };

      if (selectedCity) {
        params.city = selectedCity;
      }
            if (selectedDateValue) {

        const start = new Date(selectedDateValue);
        start.setHours(0,0,0,0);

        const end = new Date(selectedDateValue);
        end.setHours(23,59,59,999);

        params.startDateTime = start.toISOString();
        params.endDateTime = end.toISOString();
      }

      const response = await axios.get(
        `${API_URL}/api/events/search`,
        {
          params
        }
      );

      setResults(response.data.events || []);
      setSearched(true);

    } catch {

      setResults([]);
      setSearched(true);

    } finally {

      setLoading(false);

    }

  }, [city, selectedDate]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const value = e.target.value;

    setQuery(value);

    clearTimeout(debounce.current);

    debounce.current = setTimeout(() => {
      search(value);
    },500);

  };

  const handleCategory = (cat:string)=>{

    setActiveCategory(cat);

    setQuery(cat);

    search(cat);

  };

  const applyLocation = () => {
    setCity(locationInput);
    setShowLocation(false);

    search(query, locationInput, selectedDate);
  };

  const applyDate = ()=>{

    setShowDatePicker(false);

    search(query, city, selectedDate);

  };

  const selectEvent = (ev:TmEvent)=>{

    setSelectedEvent({
      name: ev.name,
      image: ev.image
    });

    navigate(
      '/create-ticket',
      {
        state:{
          event:ev
        }
      }
    );

  };

  return (
    <div
      className="page-content"
      style={{ background: '#000', minHeight: '100vh' }}
    >
      {/* Header */}
      <div className="discover-header">
        {/* Location + Date Row */}
        <div
          className="flex mb-3"
          style={{
            borderBottom:'1px solid #333'
          }}
        >
          {/* LOCATION */}
          <button
            onClick={()=>setShowLocation(true)}
            className="flex items-center gap-2 flex-1 py-3 pr-4 border-r border-gray-700"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#aaa"
              strokeWidth="2"
            >
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
            </svg>
            <div className="text-left">
              <p
                style={{
                  fontSize:10,
                  color:'#aaa',
                  fontWeight:700
                }}
              >
                LOCATION
              </p>
              <p
                style={{
                  fontSize:13,
                  color:'#fff',
                  fontWeight:600
                }}
              >
                {city || "All Cities"}
              </p>
            </div>
            <span className="text-gray-400">
              ▾
            </span>
          </button>

          {/* DATE */}
          <button
            onClick={()=>setShowDatePicker(true)}
            className="flex items-center gap-2 flex-1 py-3 pl-4"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#aaa"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div className="text-left">
              <p
                style={{
                  fontSize:10,
                  color:'#aaa',
                  fontWeight:700
                }}
              >
                DATES
              </p>
              <p
                style={{
                  fontSize:13,
                  color:'#fff',
                  fontWeight:600
                }}
              >
                {
                  selectedDate
                  ? selectedDate.toLocaleDateString()
                  : "All Dates"
                }
              </p>
            </div>
            <span className="text-gray-400">
              ▾
            </span>
          </button>
        </div>

        {/* Search bar */}
        <div
          style={{
            background:'#1c1c1c',
            borderRadius:8,
            padding:'11px 14px',
            display:'flex',
            alignItems:'center',
            gap:10,
            marginBottom:12
          }}
        >
          <div style={{flex:1}}>
            <span
              style={{
                fontSize:10,
                fontWeight:800,
                color:'#aaa',
                letterSpacing:1
              }}
            >
              SEARCH
            </span>
            <input
              value={query}
              onChange={handleInput}
              placeholder="Artist, Event, or Venue"
              style={{
                background:'transparent',
                border:'none',
                outline:'none',
                color:'#fff',
                width:'100%',
                fontSize:15
              }}
            />
          </div>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#026CDF"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {
            categories.map(cat=>(
              <button
                key={cat}
                onClick={()=>handleCategory(cat)}
                className="flex-shrink-0"
                style={{
                  padding:'7px 14px',
                  borderRadius:20,
                  border:'1px solid',
                  borderColor:
                    activeCategory===cat
                    ? '#026CDF'
                    : '#444',
                  background:
                    activeCategory===cat
                    ? '#026CDF'
                    :'transparent',
                  color:'#fff',
                  fontSize:13,
                  fontWeight:600
                }}
              >
                {cat}
              </button>
            ))
          }
        </div>
      </div>

      {/* RESULTS */}
      {
        loading ? (
          <div className="flex justify-center py-20">
            <div
              style={{
                width:32,
                height:32,
                border:'2px solid #026CDF',
                borderTopColor:'transparent',
                borderRadius:'50%'
              }}
            />
          </div>
        ) : searched && results.length===0 ? (
          <div className="text-center py-16 text-gray-500">
            No results for "{query}"
          </div>
        ) : (
          <div style={{padding:'12px 0'}}>
            {
              results.map(ev=>(
                <EventCard
                  key={ev.id}
                  event={ev}
                  onSelect={selectEvent}
                />
              ))
            }
          </div>
        )
      }

      {/* LOCATION MODAL */}
      {
        showLocation && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          >
            <div
              className="bg-zinc-900 rounded-xl p-6 w-[90%] max-w-md"
            >
              <h2 className="text-white text-lg font-bold mb-4">
                Choose Location
              </h2>
              <input
                value={locationInput}
                onChange={(e)=>setLocationInput(e.target.value)}
                placeholder="Enter city..."
                className="w-full rounded-lg bg-zinc-800 text-white px-4 py-3 outline-none"
              />
              <button
                onClick={applyLocation}
                className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-white font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        )
      }

      {/* DATE MODAL */}
      {
        showDatePicker && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
          >
            <div
              className="bg-zinc-900 rounded-xl p-6"
            >
              <h2 className="text-white font-bold mb-4">
                Select Date
              </h2>
              <DatePicker
              selected={selectedDate}
              onChange={(date)=>setSelectedDate(date)}
              inline
              />
              <button
                onClick={applyDate}
                className="mt-4 w-full bg-blue-600 text-white rounded-lg py-2"
              >
                Done
              </button>
            </div>
          </div>
        )
      }
    </div>
  );
};

const EventCard: React.FC<{
  event: TmEvent;
  onSelect: (e: TmEvent) => void;
}> = ({ event, onSelect }) => (
  <div
    className="event-ticket-card cursor-pointer"
    onClick={() => onSelect(event)}
  >
    <div
      style={{
        position:'relative',
        height:220,
        overflow:'hidden',
        borderRadius:12,
        marginBottom:12
      }}
    >
      <img
        src={event.image}
        alt={event.name}
        style={{
          width:'100%',
          height:'100%',
          objectFit:'cover',
          display:'block'
        }}
        onError={(e)=>{
          (e.target as HTMLImageElement).src =
          'https://placehold.co/400x220/111/555?text=Event';
        }}
      />
      {/* Overlay */}
      <div
        style={{
          position:'absolute',
          inset:0,
          background:
          'linear-gradient(to top, rgba(0,0,0,.92), rgba(0,0,0,.3), transparent)'
        }}
      />
      {/* Content */}
      <div
        style={{
          position:'absolute',
          bottom:0,
          left:0,
          right:0,
          padding:'12px 14px'
        }}
      >
        <p
          style={{
            color:'#bbb',
            fontSize:12,
            fontWeight:600,
            marginBottom:5
          }}
        >
          {formatEventDate(event.date,event.time)}
        </p>
        <p
          style={{
            color:'#fff',
            fontSize:22,
            fontWeight:900,
            textTransform:'uppercase',
            lineHeight:1.1,
            marginBottom:8
          }}
        >
          {event.name}
        </p>
        <div
          style={{
            height:1,
            background:'rgba(255,255,255,.25)',
            marginBottom:10
          }}
        />
        <div
          className="flex items-center justify-between gap-3"
        >
          <p
            style={{
              color:'#ccc',
              fontSize:12,
              overflow:'hidden',
              textOverflow:'ellipsis'
            }}
          >
            {event.venue}
            {
              event.city
              ? `, ${event.city}`
              : ''
            }
            {
              event.state
              ? `, ${event.state}`
              : ''
            }
          </p>
          <button
            onClick={(e)=>{
              e.stopPropagation();
              onSelect(event);
            }}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              rounded
              px-4
              py-1.5
              text-xs
              font-bold
              transition
            "
          >
            Find tickets
          </button>
        </div>
      </div>
    </div>
  </div>
);