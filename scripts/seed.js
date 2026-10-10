const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read .env file manually if MONGODB_URI is not in process.env
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=["']?([^"'\n\r]+)["']?/);
    if (match) {
      mongoUri = match[1];
    }
  }
}

if (!mongoUri) {
  console.error('Error: MONGODB_URI could not be found.');
  process.exit(1);
}

// User schema
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    favoriteCategories: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Event schema
const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: ['Music', 'Workshop', 'Food', 'Sports', 'Kids'] },
    city: { type: String, required: true, trim: true },
    dateTime: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, { dbName: 'community_events' });
    console.log('Connected successfully!');

    // 1. Seed predefined Admin user
    const adminEmail = 'admin@community.com';
    const adminPassword = 'adminpassword123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'admin',
        favoriteCategories: ['Music', 'Workshop'],
      });
      console.log(`Created Admin user: ${adminEmail} (password: ${adminPassword})`);
    } else {
      admin.role = 'admin';
      admin.password = hashedAdminPassword;
      await admin.save();
      console.log(`Updated Admin user: ${adminEmail} (password: ${adminPassword})`);
    }

    // 2. Clear existing sample events
    await Event.deleteMany({});
    console.log('Cleared existing events.');

    // 3. Define 15 sample events
    // Base reference date: Current date in 2026-10-10
    const now = new Date();

    const sampleEvents = [
      // --- Active Upcoming Events (10) ---
      {
        title: 'Indie Rock Night Live',
        description: 'An electrifying live performance by top indie bands featuring guitar solos, energetic beats, and fresh melodies under the stars.',
        category: 'Music',
        city: 'Bangalore',
        dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +3 days 6:30 PM
        price: 499,
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Sourdough Bread & Artisan Baking',
        description: 'Hands-on masterclass learning sourdough starters, kneading techniques, fermentation, and oven baking. Fresh bread to take home!',
        category: 'Food',
        city: 'Mumbai',
        dateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +5 days
        price: 1200,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Full-Stack Next.js & AI Workshop',
        description: 'Build and deploy modern web applications using Next.js App Router, Tailwind CSS, MongoDB, and integrate LLM agents.',
        category: 'Workshop',
        city: 'Bangalore',
        dateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
        price: 1500,
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Sunrise City 10K Run & Half Marathon',
        description: 'Join hundreds of fitness enthusiasts for a scenic morning run through lush parkways. Includes official bib, medal, and healthy breakfast.',
        category: 'Sports',
        city: 'Hyderabad',
        dateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000), // +10 days 6:00 AM
        price: 650,
        imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Junior Robotics & Science Fair',
        description: 'Interactive STEM event for kids aged 6-14. Hands-on coding of mini-robots, erupting volcano experiments, and fun science games.',
        category: 'Kids',
        city: 'Chennai',
        dateTime: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // +12 days
        price: 350,
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Sufi & Classical Fusion Evening',
        description: 'A mesmerizing musical journey blending classical ragas and soulful Sufi poetry performed by acclaimed national vocalists.',
        category: 'Music',
        city: 'Delhi',
        dateTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +15 days
        price: 850,
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Street Food Carnival & Masterchef Tasting',
        description: 'Taste authentic regional street delicacies from 30+ curated gourmet stalls, live live-cooking demos, and live music acoustic stage.',
        category: 'Food',
        city: 'Coimbatore',
        dateTime: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000), // +18 days
        price: 250,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Pottery & Clay Sculpting Studio Session',
        description: 'Learn wheel throwing, shaping, and glazing from expert ceramicists. Perfect for beginners seeking a relaxing mindful creative outlet.',
        category: 'Workshop',
        city: 'Pune',
        dateTime: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // +20 days
        price: 950,
        imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'City Open Badminton Championship',
        description: 'Singles and doubles tournament across amateur and semi-pro divisions. Trophies, cash prizes, and tournament energy!',
        category: 'Sports',
        city: 'Bangalore',
        dateTime: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000), // +22 days
        price: 400,
        imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Magic & Puppet Fantasy Theater',
        description: 'Laughter-packed afternoon featuring world-class sleight-of-hand illusions, humorous puppet theater, and balloon art for all children.',
        category: 'Kids',
        city: 'Mumbai',
        dateTime: new Date(now.getTime() + 26 * 24 * 60 * 60 * 1000), // +26 days
        price: 300,
        imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },

      // --- Inactive Events (2) - Retained in DB, hidden from public ---
      {
        title: 'Rooftop Jazz & Barbecue Night (Postponed)',
        description: 'Intimate rooftop jazz quartet with smoky barbecue grills. Temporarily inactive while venue completes acoustic upgrades.',
        category: 'Music',
        city: 'Bangalore',
        dateTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        price: 1200,
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
        isActive: false, // Inactive
        createdBy: admin._id,
      },
      {
        title: 'Heritage Architecture Photo Walk (Suspended)',
        description: 'Guided dawn photo exploration of colonial and traditional architectural marvels with professional street photographers.',
        category: 'Workshop',
        city: 'Delhi',
        dateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        price: 500,
        imageUrl: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=1000&q=80',
        isActive: false, // Inactive
        createdBy: admin._id,
      },

      // --- Past Events (3) - Excluded from upcoming listings ---
      {
        title: 'Monsoon Chai & Street Food Festival',
        description: 'A celebration of steaming teas, hot fritters, and coastal treats during the monsoon season. Successfully concluded.',
        category: 'Food',
        city: 'Mumbai',
        dateTime: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        price: 200,
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'South Zone Inter-Club Football Finals',
        description: 'Championship match featuring premier city soccer clubs. Spectacular goals and electric crowd turnout.',
        category: 'Sports',
        city: 'Chennai',
        dateTime: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
        price: 350,
        imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
      {
        title: 'Origami & Creative Storytelling Camp',
        description: 'Creative holiday camp where children crafted animals from colored paper and presented folk tales.',
        category: 'Kids',
        city: 'Coimbatore',
        dateTime: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        price: 150,
        imageUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1000&q=80',
        isActive: true,
        createdBy: admin._id,
      },
    ];

    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`Successfully seeded ${createdEvents.length} events!`);
    console.log('Breakdown:');
    console.log(' - 10 Active Upcoming events');
    console.log(' - 2 Inactive events');
    console.log(' - 3 Past events');
    console.log('Categories covered: Music, Workshop, Food, Sports, Kids');
    console.log('Cities covered: Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Coimbatore, Pune');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
