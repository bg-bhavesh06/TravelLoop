export const getTripCover = (trip) => {
  if (trip?.coverPhoto && trip.coverPhoto.trim().startsWith('http')) {
    return trip.coverPhoto;
  }

  // Fallbacks based on destination keywords
  const destination = (trip?.destinations?.[0] || trip?.title || '').toLowerCase();
  
  if (destination.includes('italy') || destination.includes('rome') || destination.includes('venice') || destination.includes('milan') || destination.includes('florence')) {
    return 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=800'; // Rome Colosseum
  }
  if (destination.includes('bali') || destination.includes('indonesia')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'; // Bali
  }
  if (destination.includes('london') || destination.includes('uk') || destination.includes('england')) {
    return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'; // London
  }
  if (destination.includes('paris') || destination.includes('france')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'; // Paris Eiffel
  }
  if (destination.includes('tokyo') || destination.includes('kyoto') || destination.includes('japan')) {
    return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'; // Japan Pagoda
  }
  if (destination.includes('swiss') || destination.includes('switzerland') || destination.includes('alps')) {
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'; // Swiss Alps
  }
  if (destination.includes('beach') || destination.includes('maldives') || destination.includes('hawaii') || destination.includes('tropical')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'; // Tropical Beach
  }
  if (destination.includes('new york') || destination.includes('nyc') || destination.includes('usa')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'; // NYC Times Sq
  }

  // Default general beautiful travel photos
  const hash = Array.from(destination).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const defaults = [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800', // Desert roadtrip
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', // Map/Planning
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', // Mountain lake
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800', // Lake/Boat
  ];
  return defaults[hash % defaults.length];
};
