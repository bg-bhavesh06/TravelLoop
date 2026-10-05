const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const City = require('../models/City');
const Activity = require('../models/Activity');

const cities = [
  {
    name: 'Paris', country: 'France', region: 'Europe',
    description: 'The City of Light, famous for the Eiffel Tower, world-class cuisine, and romantic ambiance.',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    costIndex: 8, popularity: 10, tags: ['culture', 'romance', 'food', 'history'],
  },
  {
    name: 'Tokyo', country: 'Japan', region: 'Asia',
    description: 'A vibrant metropolis blending ancient traditions with cutting-edge technology.',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    costIndex: 7, popularity: 9, tags: ['culture', 'food', 'technology', 'shopping'],
  },
  {
    name: 'New York', country: 'USA', region: 'North America',
    description: 'The city that never sleeps — iconic skyline, Broadway shows, and Central Park.',
    coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    costIndex: 9, popularity: 10, tags: ['culture', 'shopping', 'nightlife', 'food'],
  },
  {
    name: 'Bali', country: 'Indonesia', region: 'Asia',
    description: 'Tropical paradise known for stunning beaches, terraced rice paddies, and vibrant spiritual culture.',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    costIndex: 3, popularity: 9, tags: ['beach', 'relaxation', 'adventure', 'culture'],
  },
  {
    name: 'Rome', country: 'Italy', region: 'Europe',
    description: 'The Eternal City — home to the Colosseum, Vatican City, and authentic Italian cuisine.',
    coverImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    costIndex: 6, popularity: 9, tags: ['history', 'culture', 'food', 'architecture'],
  },
  {
    name: 'Barcelona', country: 'Spain', region: 'Europe',
    description: 'Gaudí architecture, Mediterranean beaches, and lively nightlife in the heart of Catalonia.',
    coverImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    costIndex: 5, popularity: 8, tags: ['beach', 'culture', 'architecture', 'nightlife'],
  },
  {
    name: 'Dubai', country: 'UAE', region: 'Middle East',
    description: 'Futuristic skyline, luxury shopping, and desert adventures in the Arabian Gulf.',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    costIndex: 8, popularity: 8, tags: ['luxury', 'shopping', 'adventure', 'architecture'],
  },
  {
    name: 'London', country: 'United Kingdom', region: 'Europe',
    description: 'Historic landmarks, royal palaces, world-class museums, and diverse culinary scene.',
    coverImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    costIndex: 9, popularity: 9, tags: ['culture', 'history', 'shopping', 'food'],
  },
  {
    name: 'Bangkok', country: 'Thailand', region: 'Asia',
    description: 'Ornate shrines, vibrant street life, and world-renowned street food capital.',
    coverImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
    costIndex: 2, popularity: 8, tags: ['food', 'culture', 'adventure', 'nightlife'],
  },
  {
    name: 'Sydney', country: 'Australia', region: 'Oceania',
    description: 'Stunning harbor, iconic Opera House, golden beaches, and outdoor adventure.',
    coverImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    costIndex: 7, popularity: 8, tags: ['beach', 'adventure', 'culture', 'nature'],
  },
];

const activitiesData = {
  Paris: [
    { name: 'Eiffel Tower Visit', type: 'sightseeing', description: 'Ascend the iconic iron lattice tower for panoramic views of Paris.', averageCost: 25, duration: 3, rating: 4.8 },
    { name: 'Louvre Museum Tour', type: 'culture', description: 'Explore the world\'s largest art museum housing the Mona Lisa.', averageCost: 17, duration: 4, rating: 4.9 },
    { name: 'Seine River Cruise', type: 'relaxation', description: 'Glide along the Seine past illuminated landmarks at sunset.', averageCost: 15, duration: 1.5, rating: 4.6 },
    { name: 'French Cooking Class', type: 'food', description: 'Learn to make classic French dishes with a Parisian chef.', averageCost: 80, duration: 3, rating: 4.7 },
  ],
  Tokyo: [
    { name: 'Shibuya Crossing & Harajuku Walk', type: 'sightseeing', description: 'Experience the world\'s busiest crossing and vibrant Harajuku fashion street.', averageCost: 0, duration: 3, rating: 4.5 },
    { name: 'Tsukiji Outer Market Food Tour', type: 'food', description: 'Sample fresh sushi, tamagoyaki, and Japanese street food.', averageCost: 40, duration: 2.5, rating: 4.8 },
    { name: 'Senso-ji Temple Visit', type: 'culture', description: 'Explore Tokyo\'s oldest temple in the historic Asakusa district.', averageCost: 0, duration: 2, rating: 4.7 },
    { name: 'TeamLab Borderless', type: 'culture', description: 'Immersive digital art museum with stunning interactive exhibits.', averageCost: 30, duration: 3, rating: 4.9 },
  ],
  'New York': [
    { name: 'Statue of Liberty & Ellis Island', type: 'sightseeing', description: 'Ferry ride to iconic landmarks of American freedom and immigration.', averageCost: 24, duration: 4, rating: 4.7 },
    { name: 'Central Park Bike Tour', type: 'adventure', description: 'Cycle through 843 acres of urban oasis in the heart of Manhattan.', averageCost: 45, duration: 2.5, rating: 4.6 },
    { name: 'Broadway Show', type: 'culture', description: 'Experience world-class theater in the Theater District.', averageCost: 120, duration: 2.5, rating: 4.9 },
    { name: 'NYC Pizza Walk', type: 'food', description: 'Taste the best pizza slices across Manhattan\'s legendary pizzerias.', averageCost: 35, duration: 2, rating: 4.5 },
  ],
  Bali: [
    { name: 'Tegallalang Rice Terraces', type: 'sightseeing', description: 'Walk through stunning cascading rice paddies in Ubud.', averageCost: 10, duration: 2, rating: 4.7 },
    { name: 'Uluwatu Temple Sunset', type: 'culture', description: 'Watch a traditional Kecak dance at the clifftop temple at sunset.', averageCost: 5, duration: 3, rating: 4.8 },
    { name: 'Bali Swing', type: 'adventure', description: 'Soar over the jungle canopy on a thrilling swing ride.', averageCost: 35, duration: 1, rating: 4.4 },
    { name: 'Balinese Spa Treatment', type: 'relaxation', description: 'Traditional massage and flower bath in a tropical garden setting.', averageCost: 25, duration: 2, rating: 4.9 },
  ],
  Rome: [
    { name: 'Colosseum Guided Tour', type: 'sightseeing', description: 'Step inside the ancient arena where gladiators once fought.', averageCost: 35, duration: 3, rating: 4.8 },
    { name: 'Vatican Museums & Sistine Chapel', type: 'culture', description: 'Marvel at Michelangelo\'s ceiling and centuries of papal art collections.', averageCost: 20, duration: 4, rating: 4.9 },
    { name: 'Trastevere Food Walk', type: 'food', description: 'Taste authentic Roman cuisine in the charming Trastevere neighborhood.', averageCost: 45, duration: 3, rating: 4.7 },
    { name: 'Trevi Fountain & Spanish Steps Walk', type: 'sightseeing', description: 'Toss a coin and wander through Rome\'s most photogenic landmarks.', averageCost: 0, duration: 2, rating: 4.5 },
  ],
  Barcelona: [
    { name: 'Sagrada Família Tour', type: 'sightseeing', description: 'Gaudí\'s unfinished masterpiece — breathtaking stained-glass interiors.', averageCost: 26, duration: 2, rating: 4.9 },
    { name: 'La Boqueria Market', type: 'food', description: 'Vibrant market on Las Ramblas with fresh seafood, fruits, and tapas.', averageCost: 20, duration: 1.5, rating: 4.6 },
    { name: 'Park Güell', type: 'culture', description: 'Colorful mosaic terraces and Gaudí architecture with city views.', averageCost: 10, duration: 2, rating: 4.7 },
    { name: 'Barcelona Beach & Barceloneta', type: 'relaxation', description: 'Relax on Mediterranean sands and enjoy beachfront seafood.', averageCost: 15, duration: 3, rating: 4.4 },
  ],
  Dubai: [
    { name: 'Burj Khalifa Observation Deck', type: 'sightseeing', description: 'Visit the world\'s tallest building for stunning panoramic views.', averageCost: 40, duration: 2, rating: 4.8 },
    { name: 'Desert Safari & BBQ Dinner', type: 'adventure', description: 'Dune bashing, camel rides, and traditional Arabian BBQ under the stars.', averageCost: 60, duration: 6, rating: 4.7 },
    { name: 'Dubai Mall & Aquarium', type: 'sightseeing', description: 'Explore the world\'s largest mall and its massive aquarium.', averageCost: 30, duration: 4, rating: 4.5 },
    { name: 'Traditional Dhow Cruise', type: 'relaxation', description: 'Evening dinner cruise along Dubai Creek or Marina.', averageCost: 50, duration: 2, rating: 4.6 },
  ],
  London: [
    { name: 'Tower of London', type: 'sightseeing', description: 'Explore the historic castle, see the Crown Jewels, and meet the Beefeaters.', averageCost: 30, duration: 3, rating: 4.7 },
    { name: 'British Museum', type: 'culture', description: 'Free entry to one of the world\'s greatest museums of human history.', averageCost: 0, duration: 4, rating: 4.8 },
    { name: 'Afternoon Tea Experience', type: 'food', description: 'Classic English afternoon tea with scones, sandwiches, and pastries.', averageCost: 55, duration: 2, rating: 4.6 },
    { name: 'Thames River Cruise', type: 'relaxation', description: 'Scenic cruise past Big Ben, London Eye, and Tower Bridge.', averageCost: 18, duration: 1, rating: 4.5 },
  ],
  Bangkok: [
    { name: 'Grand Palace & Wat Phra Kaew', type: 'sightseeing', description: 'Thailand\'s most sacred temple and the stunning royal palace complex.', averageCost: 15, duration: 3, rating: 4.8 },
    { name: 'Street Food Tour — Chinatown', type: 'food', description: 'Taste pad thai, mango sticky rice, and more on Bangkok\'s famous Yaowarat Road.', averageCost: 20, duration: 3, rating: 4.9 },
    { name: 'Floating Market Trip', type: 'culture', description: 'Visit Damnoen Saduak or Amphawa floating markets for a unique experience.', averageCost: 25, duration: 5, rating: 4.5 },
    { name: 'Thai Massage at Wat Pho', type: 'relaxation', description: 'Traditional Thai massage at the birthplace of the practice.', averageCost: 10, duration: 1, rating: 4.7 },
  ],
  Sydney: [
    { name: 'Sydney Opera House Tour', type: 'sightseeing', description: 'Go behind the scenes of Australia\'s most iconic building.', averageCost: 40, duration: 1.5, rating: 4.7 },
    { name: 'Bondi to Coogee Coastal Walk', type: 'adventure', description: 'Scenic 6km clifftop trail connecting Sydney\'s famous beaches.', averageCost: 0, duration: 3, rating: 4.8 },
    { name: 'Sydney Harbour Bridge Climb', type: 'adventure', description: 'Climb to the summit of the iconic bridge for 360° city views.', averageCost: 175, duration: 3.5, rating: 4.9 },
    { name: 'Fish & Chips at Sydney Fish Market', type: 'food', description: 'Fresh seafood at the Southern Hemisphere\'s largest fish market.', averageCost: 20, duration: 1.5, rating: 4.5 },
  ],
};

const seedCities = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding cities...');

    // Clear existing cities and activities ONLY
    await City.deleteMany({});
    await Activity.deleteMany({});

    // Create cities
    const createdCities = await City.insertMany(cities);
    console.log(`✅ ${createdCities.length} cities seeded`);

    // Create activities
    let totalActivities = 0;
    for (const city of createdCities) {
      const cityActivities = activitiesData[city.name];
      if (cityActivities) {
        const withCityRef = cityActivities.map(a => ({ ...a, city: city._id }));
        await Activity.insertMany(withCityRef);
        totalActivities += withCityRef.length;
      }
    }
    console.log(`✅ ${totalActivities} activities seeded`);

    console.log('\n🌍 City/Activity Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedCities();
