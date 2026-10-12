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
    title: 'Open Mic Acoustic Evening',
    description: 'Singers, guitarists, and poets take the stage at a relaxed open mic. Sign up on the spot or just enjoy the music with a warm drink.',
    category: 'Music',
    city: 'Chennai',
    dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    price: 250,
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'Bollywood Retro Music Night',
    description: 'A nostalgic live band performance of timeless Bollywood classics from the 70s to the 90s. Sing along with the crowd.',
    category: 'Music',
    city: 'Delhi',
    dateTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    price: 750,
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'Italian Pasta & Pizza Workshop',
    description: 'Make fresh pasta dough, hand-rolled ravioli, and wood-fired style pizza from scratch. Enjoy everything you cook for lunch.',
    category: 'Food',
    city: 'Bangalore',
    dateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    price: 1400,
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'Coffee Tasting & Brewing Session',
    description: 'Explore single-origin beans, compare brewing methods like pour-over and French press, and learn to taste like a barista.',
    category: 'Food',
    city: 'Pune',
    dateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    price: 600,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'UI/UX Design Fundamentals Workshop',
    description: 'A hands-on day covering user research, wireframing, and prototyping in Figma. Bring a laptop and leave with a portfolio-ready case study.',
    category: 'Workshop',
    city: 'Hyderabad',
    dateTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
    price: 1300,
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'Public Speaking & Communication Bootcamp',
    description: 'Build confidence with live speaking drills, storytelling frameworks, and personal feedback from experienced coaches.',
    category: 'Workshop',
    city: 'Mumbai',
    dateTime: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    price: 900,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'Trail Running Challenge 15K',
    description: 'A scenic off-road run through forest trails with hydration points, timing chips, and a finisher medal.',
    category: 'Sports',
    city: 'Bangalore',
    dateTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000 - 13 * 60 * 60 * 1000),
    price: 700,
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: '3v3 Street Basketball Tournament',
    description: 'Fast-paced half-court tournament for amateur teams. Group stage, knockouts, and prizes for the top three teams.',
    category: 'Sports',
    city: 'Chennai',
    dateTime: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000),
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'Storytelling & Puppet Show for Kids',
    description: 'An interactive afternoon of folk tales, colorful puppets, and sing-along songs for children aged 4-10.',
    category: 'Kids',
    city: 'Hyderabad',
    dateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    price: 280,
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'Kids Nature Explorer Day',
    description: 'A guided outdoor adventure for kids aged 6-12 with a scavenger hunt, bug spotting, leaf art, and a picnic snack.',
    category: 'Kids',
    city: 'Pune',
    dateTime: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000),
    price: 380,
    imageUrl: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },

  // --- Inactive Events (2) ---
  {
    title: 'Classical Guitar Masterclass (Postponed)',
    description: 'A masterclass on fingerstyle technique and repertoire with a touring guitarist. Inactive until a new date is confirmed.',
    category: 'Music',
    city: 'Mumbai',
    dateTime: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
    price: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    isActive: false,
    createdBy: admin._id,
  },
  {
    title: 'Home Baking Basics (Suspended)',
    description: 'Cookies, muffins, and brownies from scratch for beginners. Suspended while the kitchen studio is under maintenance.',
    category: 'Food',
    city: 'Delhi',
    dateTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
    price: 850,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
    isActive: false,
    createdBy: admin._id,
  },

  // --- Past Events (3) ---
  {
    title: 'Weekend Fitness Bootcamp',
    description: 'A high-energy outdoor session of circuits, HIIT, and group challenges. Successfully concluded.',
    category: 'Sports',
    city: 'Hyderabad',
    dateTime: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
    price: 400,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'Resume & Career Strategy Workshop',
    description: 'Practical session on resumes, LinkedIn profiles, and interview prep with industry mentors. Concluded with strong turnout.',
    category: 'Workshop',
    city: 'Bangalore',
    dateTime: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
    price: 300,
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80',
    isActive: true,
    createdBy: admin._id,
  },
  {
    title: 'Kids Doodle & Craft Fiesta',
    description: 'A creative afternoon of doodling, paper crafts, and clay modeling for young artists. Successfully concluded.',
    category: 'Kids',
    city: 'Mumbai',
    dateTime: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
    price: 200,
    imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1000&q=80',
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
