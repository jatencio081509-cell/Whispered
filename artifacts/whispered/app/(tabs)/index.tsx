import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import * as Location from 'expo-location';

import { Animated, Easing, View, Text, Pressable, StyleSheet, ScrollView, Modal, TextInput, Alert } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '🙂', label: 'Okay' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '❤️', label: 'Loved' },
  { emoji: '🔥', label: 'Motivated' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const colors = useColors();
  const { myMood, setMyMood, partnerMood, streak } = useApp();

  const [showMyMoodDropdown, setShowMyMoodDropdown] = useState(false);
  const [showEditPartnerName, setShowEditPartnerName] = useState(false);
  const [editingPartnerName, setEditingPartnerName] = useState('');
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [myLocation, setMyLocation] = useState<string | null>(null);
  const [partnerLocation, setPartnerLocation] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPartnerAddressModal, setShowPartnerAddressModal] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [partnerManualAddress, setPartnerManualAddress] = useState('');
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [isGeocodingPartnerAddress, setIsGeocodingPartnerAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [partnerAddressSuggestions, setPartnerAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const partnerDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    entrance.setValue(0);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  // Request location permission and start tracking
  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    };
    requestLocationPermission();
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get distance message based on distance
  const getDistanceMessage = (distanceInMiles: number): string => {
    const feet = distanceInMiles * 5280;
    
    if (feet < 500) return "Together? 💕";
    if (feet < 1000) return "So close! 🏃";
    if (distanceInMiles < 1) return "Nearly there 🚶";
    if (distanceInMiles < 5) return "Just a few miles away 🚗";
    if (distanceInMiles < 25) return "In the same area 🌆";
    if (distanceInMiles < 100) return "Same region 🗺️";
    if (distanceInMiles < 500) return "A drive away 🛣️";
    return "Far but connected ✨";
  };

  // Format distance for display
  const formatDistance = (distanceInMiles: number): string => {
    const feet = distanceInMiles * 5280;
    
    if (feet < 1000) {
      return `${Math.round(feet)} ft`;
    } else if (distanceInMiles < 1) {
      return `${(feet / 5280).toFixed(2)} mi`;
    } else if (distanceInMiles < 10) {
      return `${distanceInMiles.toFixed(1)} mi`;
    } else {
      return `${Math.round(distanceInMiles)} mi`;
    }
  };

  // Get location name from coordinates
  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result && result.length > 0) {
        const location = result[0];
        const city = location.city || location.subregion || location.region || '';
        const state = location.region || '';
        const country = location.country || '';
        
        const parts = [city, state, country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Unknown location';
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
    return 'Unknown location';
  };

  // Geocode address to coordinates
  const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const result = await Location.geocodeAsync(address);
      if (result && result.length > 0) {
        return {
          latitude: result[0].latitude,
          longitude: result[0].longitude,
        };
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
    return null;
  };

  // Fetch address suggestions using geocode.farm geocoding endpoint
  const fetchAddressSuggestions = async (query: string): Promise<string[]> => {
    if (query.length < 3) return [];
    
    try {
      const response = await fetch(`https://geocode.farm/v3/json/forward/?key=019ef4e9-9ace-7b50-9896-cf9168186248&addr=${encodeURIComponent(query)}&country=US&limit=5`);
      
      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        return [];
      }
      
      const text = await response.text();
      
      // Check if response is HTML (error page) instead of JSON
      if (text.trim().startsWith('<')) {
        console.error('API returned HTML instead of JSON');
        return [];
      }
      
      const data = JSON.parse(text);
      
      if (data.results && data.results.addresses && data.results.addresses.length > 0) {
        return data.results.addresses.map((result: any) => result.formatted_address || result.address).filter(Boolean);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
    return [];
  };

  // Debounced handler for my address input
  const handleManualAddressChange = (text: string) => {
    setManualAddress(text);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (text.length >= 3) {
      debounceTimer.current = setTimeout(async () => {
        const suggestions = await fetchAddressSuggestions(text);
        setAddressSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      }, 300);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Debounced handler for partner address input
  const handlePartnerAddressChange = (text: string) => {
    setPartnerManualAddress(text);
    
    if (partnerDebounceTimer.current) {
      clearTimeout(partnerDebounceTimer.current);
    }
    
    if (text.length >= 3) {
      partnerDebounceTimer.current = setTimeout(async () => {
        const suggestions = await fetchAddressSuggestions(text);
        setPartnerAddressSuggestions(suggestions);
        setShowPartnerSuggestions(suggestions.length > 0);
      }, 300);
    } else {
      setPartnerAddressSuggestions([]);
      setShowPartnerSuggestions(false);
    }
  };

  // Select address suggestion
  const selectAddressSuggestion = (suggestion: string) => {
    setManualAddress(suggestion);
    setShowSuggestions(false);
  };

  // Select partner address suggestion
  const selectPartnerAddressSuggestion = (suggestion: string) => {
    setPartnerManualAddress(suggestion);
    setShowPartnerSuggestions(false);
  };

  // Save manual address
  const saveManualAddress = async () => {
    if (!user || !manualAddress.trim()) return;
    
    setIsGeocodingAddress(true);
    try {
      const coords = await geocodeAddress(manualAddress);
      if (coords) {
        const locationName = await getLocationName(coords.latitude, coords.longitude);
        
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            latitude: coords.latitude,
            longitude: coords.longitude,
            manual_address: manualAddress,
            location_name: locationName,
            location_updated_at: new Date().toISOString(),
          });
        
        setMyLocation(locationName);
        setShowAddressModal(false);
        setManualAddress('');
      } else {
        alert('Could not find that address. Please try again.');
      }
    } catch (error) {
      console.error('Error saving manual address:', error);
      alert('Error saving address. Please try again.');
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  // Save partner's manual address
  const savePartnerManualAddress = async () => {
    if (!user || !partnerManualAddress.trim()) return;
    
    const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
    if (!partnerUserId) return;
    
    setIsGeocodingPartnerAddress(true);
    try {
      const coords = await geocodeAddress(partnerManualAddress);
      if (coords) {
        const locationName = await getLocationName(coords.latitude, coords.longitude);
        
        await supabase
          .from('users')
          .upsert({
            id: partnerUserId,
            latitude: coords.latitude,
            longitude: coords.longitude,
            manual_address: partnerManualAddress,
            location_name: locationName,
            location_updated_at: new Date().toISOString(),
          });
        
        setPartnerLocation(locationName);
        setShowPartnerAddressModal(false);
        setPartnerManualAddress('');
        
        // Recalculate distance after saving partner location
        const { data: myData } = await supabase
          .from('users')
          .select('latitude, longitude, location_name, manual_address')
          .eq('id', user.id)
          .single();
        
        let myLat, myLon;
        if (myData?.latitude && myData?.longitude) {
          myLat = myData.latitude;
          myLon = myData.longitude;
          setMyLocation(myData.location_name || 'Unknown');
        } else {
          // Fall back to GPS
          const myLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          myLat = myLocation.coords.latitude;
          myLon = myLocation.coords.longitude;
        }
        
        const dist = calculateDistance(
          myLat,
          myLon,
          coords.latitude,
          coords.longitude
        );
        setDistance(dist);
      } else {
        alert('Could not find that address. Please try again.');
      }
    } catch (error) {
      console.error('Error saving partner address:', error);
      alert('Error saving address. Please try again.');
    } finally {
      setIsGeocodingPartnerAddress(false);
    }
  };

  // Reset partner's location
  const resetPartnerLocation = async () => {
    if (!user) return;
    
    const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
    if (!partnerUserId) return;
    
    try {
      await supabase
        .from('users')
        .update({
          latitude: null,
          longitude: null,
          manual_address: null,
          location_name: null,
          location_updated_at: null,
        })
        .eq('id', partnerUserId);
      
      setPartnerLocation(null);
      setDistance(null);
      
      // Trigger location check to reload
      const { data: partnerData } = await supabase
        .from('users')
        .select('latitude, longitude, location_name, location_updated_at, manual_address')
        .eq('id', partnerUserId)
        .single();

      if (partnerData?.latitude && partnerData?.longitude) {
        setPartnerLocation(partnerData.location_name || 'Unknown');
        
        const hasManualAddress = partnerData.manual_address && partnerData.manual_address.trim().length > 0;
        const partnerLocationAge = partnerData.location_updated_at ? Date.now() - new Date(partnerData.location_updated_at).getTime() : Infinity;
        
        if (hasManualAddress || partnerLocationAge < 5 * 60 * 1000) {
          // Get my location
          const { data: myData } = await supabase
            .from('users')
            .select('latitude, longitude, location_name, manual_address')
            .eq('id', user.id)
            .single();
          
          if (myData?.latitude && myData?.longitude) {
            const dist = calculateDistance(
              myData.latitude,
              myData.longitude,
              partnerData.latitude,
              partnerData.longitude
            );
            setDistance(dist);
          }
        }
      }
    } catch (error) {
      console.error('Error resetting partner location:', error);
      alert('Error resetting location. Please try again.');
    }
  };

  // Check partner's location on mount/reload
  useEffect(() => {
    if (!user) return;

    const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
    const coupleId = user.unsafeMetadata?.coupleId as string | undefined;
    const partnerCode = user.unsafeMetadata?.partnerCode as string | undefined;
    const isLinked = !!coupleId || !!partnerCode;
    
    if (!isLinked || !partnerUserId) return;

    const checkPartnerLocation = async () => {
      try {
        // Get my location from database (could be manual or GPS)
        const { data: myData } = await supabase
          .from('users')
          .select('latitude, longitude, location_name, manual_address')
          .eq('id', user.id)
          .single();

        // Get partner's location from database
        const { data: partnerData } = await supabase
          .from('users')
          .select('latitude, longitude, location_name, location_updated_at, manual_address')
          .eq('id', partnerUserId)
          .single();

        if (partnerData?.latitude && partnerData?.longitude) {
          setPartnerLocation(partnerData.location_name || 'Unknown');
          
          // Check if partner has manual address (always valid) or if GPS location is recent
          const hasManualAddress = partnerData.manual_address && partnerData.manual_address.trim().length > 0;
          const partnerLocationAge = partnerData.location_updated_at ? Date.now() - new Date(partnerData.location_updated_at).getTime() : Infinity;
          
          if (hasManualAddress || partnerLocationAge < 5 * 60 * 1000) {
            // Use my location from database if available (manual or GPS), otherwise get current GPS
            let myLat, myLon;
            if (myData?.latitude && myData?.longitude) {
              myLat = myData.latitude;
              myLon = myData.longitude;
              setMyLocation(myData.location_name || 'Unknown');
            } else {
              // Fall back to GPS
              const myLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
              myLat = myLocation.coords.latitude;
              myLon = myLocation.coords.longitude;
            }
            
            const dist = calculateDistance(
              myLat,
              myLon,
              partnerData.latitude,
              partnerData.longitude
            );
            setDistance(dist);
          } else {
            setDistance(null); // Partner GPS location too old and no manual address
          }
        } else {
          setPartnerLocation(null);
          setDistance(null);
        }
      } catch (error) {
        console.error('Error checking partner location:', error);
        setDistance(null);
      }
    };

    checkPartnerLocation();
  }, [user]);

  // Track location and update distance
  useEffect(() => {
    if (!locationPermission || !user) return;

    const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
    const coupleId = user.unsafeMetadata?.coupleId as string | undefined;
    const partnerCode = user.unsafeMetadata?.partnerCode as string | undefined;
    const isLinked = !!coupleId || !!partnerCode;
    
    if (!isLinked || !partnerUserId) return;

    let locationSubscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      try {
        // Check if user has manual address set as fallback
        const { data: myData } = await supabase
          .from('users')
          .select('manual_address, latitude, longitude, location_name')
          .eq('id', user.id)
          .single();

        const hasManualAddress = myData?.manual_address && myData.manual_address.trim().length > 0;

        // Always track with GPS every 30 seconds, with fallback to manual address
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // 30 seconds
            distanceInterval: 50, // 50 meters
          },
          async (location) => {
            try {
              const { latitude, longitude } = location.coords;

              // Get location name from GPS
              const locationName = await getLocationName(latitude, longitude);
              setMyLocation(locationName);

              // Update my location in database with GPS coordinates
              await supabase
                .from('users')
                .upsert({
                  id: user.id,
                  latitude,
                  longitude,
                  location_name: locationName,
                  location_updated_at: new Date().toISOString(),
                });

              // Get partner's location
              const { data: partnerData } = await supabase
                .from('users')
                .select('latitude, longitude, location_name, location_updated_at, manual_address')
                .eq('id', partnerUserId)
                .single();

              if (partnerData?.latitude && partnerData?.longitude) {
                // Set partner location name
                setPartnerLocation(partnerData.location_name || 'Unknown');
                
                // Check if partner has manual address (always valid) or if GPS location is recent
                const partnerHasManualAddress = partnerData.manual_address && partnerData.manual_address.trim().length > 0;
                const partnerLocationAge = partnerData.location_updated_at ? Date.now() - new Date(partnerData.location_updated_at).getTime() : Infinity;
                
                if (partnerHasManualAddress || partnerLocationAge < 5 * 60 * 1000) {
                  const dist = calculateDistance(
                    latitude,
                    longitude,
                    partnerData.latitude,
                    partnerData.longitude
                  );
                  setDistance(dist);
                } else {
                  setDistance(null); // Partner GPS location too old and no manual address
                }
              } else {
                setPartnerLocation(null);
                setDistance(null);
              }
            } catch (gpsError) {
              console.error('GPS tracking error, falling back to manual address:', gpsError);
              
              // Fallback to manual address if GPS fails
              if (hasManualAddress && myData?.latitude && myData?.longitude) {
                setMyLocation(myData.location_name || 'Unknown');
                
                // Get partner's location
                const { data: partnerData } = await supabase
                  .from('users')
                  .select('latitude, longitude, location_name, location_updated_at, manual_address')
                  .eq('id', partnerUserId)
                  .single();

                if (partnerData?.latitude && partnerData?.longitude) {
                  setPartnerLocation(partnerData.location_name || 'Unknown');
                  
                  // Check if partner has manual address (always valid) or if GPS location is recent
                  const partnerHasManualAddress = partnerData.manual_address && partnerData.manual_address.trim().length > 0;
                  const partnerLocationAge = partnerData.location_updated_at ? Date.now() - new Date(partnerData.location_updated_at).getTime() : Infinity;
                  
                  if (partnerHasManualAddress || partnerLocationAge < 5 * 60 * 1000) {
                    const dist = calculateDistance(
                      myData.latitude,
                      myData.longitude,
                      partnerData.latitude,
                      partnerData.longitude
                    );
                    setDistance(dist);
                  } else {
                    setDistance(null);
                  }
                }
              }
            }
          }
        );
      } catch (error) {
        console.error('Error starting location tracking:', error);
      }
    };

    startTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationPermission, user]);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (err) {
              console.error('Sign out failed', err);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const coupleId = user?.unsafeMetadata?.coupleId as string | undefined;
  const partnerCode = user?.unsafeMetadata?.partnerCode as string | undefined;
  const partnerName = user?.unsafeMetadata?.partnerName as string | undefined;
  const isLinked = !!coupleId || !!partnerCode;

  const [weddingDate, setWeddingDate] = useState<string>();
  const [engagementDate, setEngagementDate] = useState<string>();
  const [officialDate, setOfficialDate] = useState<string>();

  // Force re-render when screen comes into focus
  const [refreshKey, setRefreshKey] = React.useState(0);
  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Load dates from Supabase when component mounts or refreshes
  React.useEffect(() => {
    const loadDates = async () => {
      if (!coupleId) {
        // Fallback to Clerk metadata if no couple exists
        setWeddingDate(user?.unsafeMetadata?.weddingDate as string | undefined);
        setEngagementDate(user?.unsafeMetadata?.engagementDate as string | undefined);
        setOfficialDate(user?.unsafeMetadata?.officialDate as string | undefined);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('couples')
          .select('official_date, engagement_date, wedding_date')
          .eq('id', coupleId)
          .single();

        if (error) throw error;

        setWeddingDate(data?.wedding_date || undefined);
        setEngagementDate(data?.engagement_date || undefined);
        setOfficialDate(data?.official_date || undefined);
      } catch (err) {
        console.error('Failed to load dates:', err);
      }
    };

    loadDates();

    // Real-time sync for couples table
    if (coupleId) {
      const channel = supabase
        .channel('couples-dates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'couples',
            filter: `id=eq.${coupleId}`,
          },
          (payload) => {
            console.log('Couples date change:', payload);
            const updated = payload.new as any;
            setWeddingDate(updated.wedding_date || undefined);
            setEngagementDate(updated.engagement_date || undefined);
            setOfficialDate(updated.official_date || undefined);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [coupleId, user, refreshKey]);

  // Update editing partner name when partnerName changes
  React.useEffect(() => {
    if (partnerName && !editingPartnerName) {
      setEditingPartnerName(partnerName);
    }
  }, [partnerName]);

  const savePartnerName = async () => {
    if (!user) return;
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          partnerName: editingPartnerName.trim() || 'Partner',
        },
      });
      setShowEditPartnerName(false);
    } catch (error) {
      console.error('Failed to save partner name', error);
    }
  };

  // Calculate days together if anniversary date exists
  // Priority: Wedding > Engagement > Official
  const anniversaryDate = weddingDate || engagementDate || officialDate;
  
  // Determine which date type is being used for display
  let dateLabel = '';
  if (weddingDate) dateLabel = 'Wedding';
  else if (engagementDate) dateLabel = 'Engagement';
  else if (officialDate) dateLabel = 'Official';
  
  let daysTogether = null;
  let daysUntilAnniversary = null;
  if (anniversaryDate) {
    const start = new Date(anniversaryDate);
    const today = new Date();
    daysTogether = Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    // Calculate next anniversary
    const nextAnniversary = new Date(start);
    nextAnniversary.setFullYear(today.getFullYear());
    if (nextAnniversary < today) {
      nextAnniversary.setFullYear(today.getFullYear() + 1);
    }
    daysUntilAnniversary = Math.floor((nextAnniversary.getTime() - today.getTime()) / (1000 * 3600 * 24));
  }

  // Calculate progress for 365-day circle
  const progress = daysUntilAnniversary !== null ? (365 - daysUntilAnniversary) / 365 : 0;
  const circumference = 2 * Math.PI * 80; // radius = 80
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeBackground>
        <ScrollView style={[styles.scrollView, { paddingTop: insets.top + 12 }]} key={refreshKey}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: entrance,
              transform: [
                {
                  translateY: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
                {
                  scale: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.98, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
              </Text>
              <Text style={[styles.name, { color: colors.text }]}>
                {user?.firstName || 'there'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={handleSignOut} style={styles.headerButton}>
                <Feather name="log-out" size={20} color={colors.mutedForeground} />
              </Pressable>
              <Pressable onPress={() => setShowNavigationDrawer(true)} style={styles.headerButton}>
                <Feather name="menu" size={24} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Streak Section */}
          {isLinked && (
            <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.streakContent}>
                <View style={styles.streakIcon}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                </View>
                <View style={styles.streakText}>
                  <Text style={[styles.streakNumber, { color: colors.text }]}>
                    {streak} {streak === 1 ? 'day' : 'days'}
                  </Text>
                  <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>
                    {streak === 0 ? 'Start your streak!' : 'Keep it going!'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Distance Section */}
          {isLinked && (
            <View style={[styles.distanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Visual Distance Display */}
              <View style={styles.visualDistanceContainer}>
                <Text style={[styles.visualDistanceNumber, { color: colors.text }]}>
                  {distance !== null
                    ? distance < 1
                      ? `${(distance * 5280).toFixed(1)} Feet`
                      : `${distance.toFixed(1)} Miles`
                    : 'Unknown distance'
                  }
                </Text>
                <View style={styles.waypointLine}>
                  <View style={[styles.waypoint, { backgroundColor: colors.primary }]}>
                    <Feather name="map-pin" size={12} color={colors.background} />
                  </View>
                  <View style={[styles.connectingLine, { backgroundColor: colors.primary }]} />
                  <View style={[styles.waypoint, { backgroundColor: colors.primary }]}>
                    <Feather name="map-pin" size={12} color={colors.background} />
                  </View>
                </View>
                <Text style={[styles.distanceLabel, { color: colors.mutedForeground }]}>
                  {distance !== null ? getDistanceMessage(distance) : 'Partner location not available'}
                </Text>
              </View>

            </View>
          )}

          {/* Individual Location Cards */}
          {isLinked && (
            <View style={styles.locationCardsContainer}>
              {/* My Location Card */}
              <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.locationCardTitle, { color: colors.text }]}>Your location</Text>
                {myLocation ? (
                  <Text style={[styles.locationCardValue, { color: colors.mutedForeground }]}>
                    {myLocation}
                  </Text>
                ) : (
                  <Pressable onPress={() => setShowAddressModal(true)}>
                    <Text style={[styles.addLocationButton, { color: colors.primary }]}>
                      + Add manually
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Partner Location Card */}
              <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.locationCardTitle, { color: colors.text }]}>
                  {partnerName ? `${partnerName}'s location` : "Partner's location"}
                </Text>
                {partnerLocation ? (
                  <View style={styles.locationActions}>
                    <Text style={[styles.locationCardValue, { color: colors.mutedForeground }]}>
                      {partnerLocation}
                    </Text>
                    <Pressable onPress={resetPartnerLocation}>
                      <Feather name="refresh-cw" size={14} color={colors.primary} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => setShowPartnerAddressModal(true)}>
                    <Text style={[styles.addLocationButton, { color: colors.primary }]}>
                      + Add manually
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

        {/* Anniversary Date Section - Moved to middle */}
        {anniversaryDate && daysTogether !== null && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Anniversary</Text>
            
            {/* Holographic 365-day countdown circle */}
            <View style={styles.circleContainer}>
              <Svg width={200} height={200} style={styles.circle}>
                {/* Background circle */}
                <Circle
                  cx={100}
                  cy={100}
                  r={80}
                  stroke={colors.border}
                  strokeWidth={8}
                  fill="transparent"
                />
                {/* Progress circle */}
                <Circle
                  cx={100}
                  cy={100}
                  r={80}
                  stroke={colors.primary}
                  strokeWidth={8}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 100 100)`}
                />
              </Svg>
              <View style={styles.circleContent}>
                <Text style={[styles.circleDays, { color: colors.text }]}>
                  {daysUntilAnniversary}
                </Text>
                <Text style={[styles.circleLabel, { color: colors.mutedForeground }]}>
                  days left
                </Text>
              </View>
            </View>

            <View style={[styles.anniversaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.anniversaryText, { color: colors.text }]}>
                {daysTogether} days together
              </Text>
              {daysUntilAnniversary !== null && (
                <Text style={[styles.anniversarySubtext, { color: colors.mutedForeground }]}>
                  {dateLabel} since {anniversaryDate}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Moods Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Moods</Text>
          <View style={styles.moodsRow}>
            {/* My Mood */}
            <View style={styles.moodBox}>
              <Text style={[styles.moodBoxTitle, { color: colors.text }]}>My mood</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.moodDropdown,
                  { 
                    borderColor: myMood ? colors.primary : colors.border,
                    backgroundColor: myMood ? colors.chatBoxes : colors.surface,
                    opacity: pressed ? 0.8 : 1
                  }
                ]}
                onPress={() => setShowMyMoodDropdown(true)}
              >
                <View style={styles.moodDropdownContent}>
                  <Text style={[styles.moodDropdownText, { color: myMood ? colors.text : colors.mutedForeground }]}>
                    {myMood ? MOODS.find(m => m.label.toLowerCase() === myMood)?.emoji + ' ' + myMood : 'Select mood'}
                  </Text>
                  <Feather name="chevron-down" size={16} color={myMood ? colors.primary : colors.mutedForeground} />
                </View>
              </Pressable>
            </View>

            {/* Partner's Mood - Display only */}
            <View style={styles.moodBox}>
              <Text style={[styles.moodBoxTitle, { color: colors.text }]}>
                {partnerName ? `${partnerName}'s mood` : "Partner's mood"}
              </Text>
              <View style={[styles.moodDropdown, { 
                borderColor: partnerMood ? colors.primary : colors.border,
                backgroundColor: partnerMood ? colors.chatBoxes : colors.surface
              }]}>
                <View style={styles.moodDropdownContent}>
                  <Text style={[styles.moodDropdownText, { color: partnerMood ? colors.text : colors.mutedForeground }]}>
                    {partnerMood ? MOODS.find(m => m.label.toLowerCase() === partnerMood)?.emoji + ' ' + partnerMood : 'Not set'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Partner Section - Moved below anniversary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Partner</Text>
          
          {isLinked ? (
            <View style={[styles.partnerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.partnerHeader}>
                <Feather name="heart" size={20} color={colors.primary} />
                <Text style={[styles.partnerTitle, { color: colors.text }]}>
                  {partnerName ? `Linked with ${partnerName}` : 'Linked with partner'}
                </Text>
                <Pressable onPress={() => { setEditingPartnerName(partnerName || ''); setShowEditPartnerName(true); }}>
                  <Feather name="edit-2" size={16} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable 
              style={[styles.partnerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/(auth)/link-partner')}
            >
              <Text style={[styles.partnerTitle, { color: colors.mutedForeground }]}>
                You're currently solo
              </Text>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Link with your partner →
              </Text>
            </Pressable>
          )}
        </View>

      </Animated.View>

      {/* My Mood Dropdown Modal */}
      <Modal
        visible={showMyMoodDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMyMoodDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMyMoodDropdown(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select your mood</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => (
                <Pressable
                  key={mood.label}
                  style={({ pressed }) => [
                    styles.moodOption,
                    { 
                      backgroundColor: myMood === mood.label.toLowerCase() ? colors.chatBoxes : colors.surface,
                      borderColor: myMood === mood.label.toLowerCase() ? colors.primary : colors.border,
                      borderBottomColor: colors.border,
                      opacity: pressed ? 0.8 : 1
                    }
                  ]}
                  onPress={() => {
                    setMyMood(mood.label.toLowerCase() as any);
                    setShowMyMoodDropdown(false);
                  }}
                >
                  <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodOptionLabel, { color: colors.text }]}>{mood.label}</Text>
                  {myMood === mood.label.toLowerCase() && (
                    <View style={styles.selectedIndicator}>
                      <Feather name="check" size={14} color={colors.primary} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Partner Name Modal */}
      <Modal
        visible={showEditPartnerName}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditPartnerName(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditPartnerName(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit partner name</Text>
            <TextInput
              style={[styles.editInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={editingPartnerName}
              onChangeText={setEditingPartnerName}
              placeholder="Enter partner's name"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowEditPartnerName(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={savePartnerName}
              >
                <Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Add Manual Address Modal */}
      <Modal
        visible={showAddressModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => { setShowAddressModal(false); setShowSuggestions(false); }}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add your location</Text>
            <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
              Enter your address or city
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.editInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                value={manualAddress}
                onChangeText={handleManualAddressChange}
                placeholder="e.g., New York, NY or 123 Main St"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ScrollView style={styles.suggestionsScroll} keyboardShouldPersistTaps="handled">
                    {addressSuggestions.map((suggestion, index) => (
                      <Pressable
                        key={index}
                        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                        onPress={() => selectAddressSuggestion(suggestion)}
                      >
                        <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShowAddressModal(false);
                  setManualAddress('');
                  setShowSuggestions(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary, borderColor: colors.primary, opacity: isGeocodingAddress ? 0.6 : 1 }]}
                onPress={saveManualAddress}
                disabled={isGeocodingAddress || !manualAddress.trim()}
              >
                <Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>
                  {isGeocodingAddress ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Add Partner Address Modal */}
      <Modal
        visible={showPartnerAddressModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPartnerAddressModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => { setShowPartnerAddressModal(false); setShowPartnerSuggestions(false); }}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add {partnerName ? `${partnerName}'s` : "partner's"} location
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
              Enter their address or city
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.editInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                value={partnerManualAddress}
                onChangeText={handlePartnerAddressChange}
                placeholder="e.g., Los Angeles, CA or 456 Oak Ave"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
              />
              {showPartnerSuggestions && partnerAddressSuggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ScrollView style={styles.suggestionsScroll} keyboardShouldPersistTaps="handled">
                    {partnerAddressSuggestions.map((suggestion, index) => (
                      <Pressable
                        key={index}
                        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                        onPress={() => selectPartnerAddressSuggestion(suggestion)}
                      >
                        <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShowPartnerAddressModal(false);
                  setPartnerManualAddress('');
                  setShowPartnerSuggestions(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary, borderColor: colors.primary, opacity: isGeocodingPartnerAddress ? 0.6 : 1 }]}
                onPress={savePartnerManualAddress}
                disabled={isGeocodingPartnerAddress || !partnerManualAddress.trim()}
              >
                <Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>
                  {isGeocodingPartnerAddress ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />

      </ScrollView>
      </ThemeBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "System",
  },
  name: {
    fontSize: 28,
    fontFamily: "System",
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "System",
    fontWeight: '600',
    marginBottom: 16,
  },
  streakCard: {
    borderRadius: 4,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakText: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    fontFamily: 'System',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  moodButtonActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentMood: {
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
  },
  partnerCard: {
    borderRadius: 4,
    padding: 20,
    borderWidth: 1,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  partnerSubtext: {
    fontSize: 14,
    fontFamily: 'System',
  },
  moodPlaceholder: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  anniversaryCard: {
    borderRadius: 4,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  anniversaryText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  anniversarySubtext: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'System',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
    height: 160,
  },
  circle: {
    position: 'absolute',
  },
  circleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDays: {
    fontSize: 36,
    fontWeight: '700',
  },
  circleLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  moodsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  moodBox: {
    flex: 1,
  },
  moodBoxTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  moodDropdown: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  moodDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moodDropdownText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  modalContent: {
    borderRadius: 4,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  moodGrid: {
    gap: 8,
  },
  moodOptionEmoji: {
    fontSize: 24,
  },
  moodOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  editInput: {
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    borderRadius: 4,
    borderWidth: 1,
  },
  selectedIndicator: {
    marginLeft: 'auto',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  inputContainer: {
    position: 'relative',
    zIndex: 1,
  },
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 4,
    borderWidth: 1,
    maxHeight: 150,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsScroll: {
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'System',
  },
  distanceCard: {
    borderRadius: 4,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  distanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  distanceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceText: {
    flex: 1,
  },
  distanceNumber: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 4,
  },
  distanceLabel: {
    fontSize: 14,
    fontFamily: 'System',
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  distanceHeaderText: {
    flex: 1,
  },
  locationsContainer: {
    gap: 16,
  },
  locationCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  locationCard: {
    flex: 1,
    borderRadius: 4,
    padding: 16,
    borderWidth: 1,
  },
  locationCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 8,
  },
  locationCardValue: {
    fontSize: 16,
    fontFamily: 'System',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  locationValue: {
    fontSize: 14,
    fontFamily: 'System',
  },
  addLocationButton: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  visualDistanceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  visualDistanceNumber: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 16,
  },
  waypointLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: 200,
  },
  waypoint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  connectingLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 4,
  },
});
