const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const ChecklistItem = require('../models/ChecklistItem');

const createDemoTrip = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Find the first user
    const user = await User.findOne();
    if (!user) {
      console.error('No users found in the database. Please register a user first.');
      process.exit(1);
    }
    console.log(`Creating trip for user: ${user.firstName} ${user.lastName} (${user.email})`);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14); // 2 weeks from now
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // 1 week trip

    const trip = await Trip.create({
      user: user._id,
      title: 'Summer Vacation in Paris',
      description: 'A wonderful week-long adventure exploring the culture, food, and history of Paris. Taking some time off to relax and see the iconic landmarks.',
      coverPhoto: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      startDate,
      endDate,
      destinations: ['Paris, France'],
      status: 'upcoming',
      isPublic: true,
      totalBudget: 5000,
    });

    console.log(`✅ Trip created: ${trip._id}`);

    // Create Itinerary
    const day1Date = new Date(startDate);
    const day2Date = new Date(startDate);
    day2Date.setDate(day2Date.getDate() + 1);

    const itinerary = await Itinerary.create({
      trip: trip._id,
      sections: [
        {
          title: 'Day 1: Arrival & Landmarks',
          description: 'Getting settled and seeing the Eiffel Tower',
          dateRange: { start: day1Date, end: day1Date },
          budget: 500,
          activities: [
            { name: 'Flight to CDG', type: 'flight', cost: 800, time: '10:00 AM' },
            { name: 'Hotel Check-in', type: 'hotel', cost: 200, time: '14:00 PM', notes: 'Le Meurice Hotel' },
            { name: 'Eiffel Tower Visit', type: 'sightseeing', cost: 25, time: '16:00 PM', notes: 'Pre-booked tickets' },
            { name: 'Dinner at Le Jules Verne', type: 'food', cost: 150, time: '19:00 PM' }
          ]
        },
        {
          title: 'Day 2: Art & Culture',
          description: 'Exploring the Louvre and Seine River',
          dateRange: { start: day2Date, end: day2Date },
          budget: 300,
          activities: [
            { name: 'Louvre Museum Tour', type: 'activity', cost: 17, time: '09:00 AM', notes: 'Focus on Mona Lisa and Venus de Milo' },
            { name: 'Lunch at Cafe de Flore', type: 'food', cost: 45, time: '13:00 PM' },
            { name: 'Seine River Cruise', type: 'sightseeing', cost: 15, time: '17:00 PM' }
          ]
        }
      ]
    });

    console.log(`✅ Itinerary created: ${itinerary._id}`);

    // Create Checklist Items
    const checklistData = [
      { trip: trip._id, user: user._id, label: 'Passport & Visa', category: 'documents', isPacked: false },
      { trip: trip._id, user: user._id, label: 'Flight Tickets', category: 'documents', isPacked: false },
      { trip: trip._id, user: user._id, label: 'Power Adapter (Type E/C)', category: 'electronics', isPacked: false },
      { trip: trip._id, user: user._id, label: 'Comfortable Walking Shoes', category: 'clothing', isPacked: false },
      { trip: trip._id, user: user._id, label: 'Camera & Charger', category: 'electronics', isPacked: false },
      { trip: trip._id, user: user._id, label: 'Toothbrush & Toothpaste', category: 'toiletries', isPacked: true },
    ];

    await ChecklistItem.insertMany(checklistData);
    console.log(`✅ ${checklistData.length} Checklist items created`);

    console.log('\n🎉 Demo Trip successfully added to the database!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating trip:', error);
    process.exit(1);
  }
};

createDemoTrip();
