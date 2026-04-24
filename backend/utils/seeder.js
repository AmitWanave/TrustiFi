const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Listing = require('../models/Listing');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    console.log('🗑️ Existing data cleared.');

    // Create 4 standard users
    const users = await User.create([
      {
        name: 'John Buyer',
        email: 'buyer@trustifi.com',
        password: 'password123',
        role: 'buyer',
        location: { city: 'Mumbai', state: 'Maharashtra' }
      },
      {
        name: 'Sarah Seller',
        email: 'seller@trustifi.com',
        password: 'password123',
        role: 'seller',
        location: { city: 'Bangalore', state: 'Karnataka' },
        isVerified: true
      },
      {
        name: 'Ian Inspector',
        email: 'inspector@trustifi.com',
        password: 'password123',
        role: 'inspector',
        inspectorDetails: {
          specialization: 'Smartphones & Tablets',
          certifications: ['Certified Mobile Technician']
        }
      },
      {
        name: 'Alice Admin',
        email: 'admin@trustifi.com',
        password: 'password123',
        role: 'admin'
      }
    ]);

    const seller = users.find(u => u.role === 'seller');

    // Create some sample listings for the seller
    await Listing.create([
      {
        seller: seller._id,
        title: 'iPhone 14 Pro - Space Black',
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        condition: 'Like New',
        description: 'Perfect condition, 256GB, used for 3 months with case and protector.',
        price: { asking: 85000, isNegotiable: true },
        specs: { ram: '6GB', storage: '256GB', color: 'Space Black' },
        location: { city: 'Bangalore', state: 'Karnataka' },
        status: 'active',
        isAdminApproved: true,
        images: [{ url: '/placeholder-phone.jpg', isPrimary: true }]
      },
      {
        seller: seller._id,
        title: 'Samsung S23 Ultra - Green',
        brand: 'Samsung',
        model: 'S23 Ultra',
        condition: 'Excellent',
        description: 'Minor scratches on back, screen is perfect. S-Pen included.',
        price: { asking: 72000, isNegotiable: false },
        specs: { ram: '12GB', storage: '512GB', color: 'Green' },
        location: { city: 'Bangalore', state: 'Karnataka' },
        status: 'active',
        isAdminApproved: true,
        images: [{ url: '/placeholder-phone.jpg', isPrimary: true }]
      }
    ]);

    console.log('🌱 Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
