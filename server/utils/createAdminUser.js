import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedUsers() {
  const users = [
    { 
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'PassWord123.',
      department: 'Administration',
      role: 'admin' 
    },
    { 
      name: 'Staff One',
      email: 'staff1@example.com',
      password: 'Staff123.',
      department: 'Academic',
      role: 'staff' 
    },
    { 
      name: 'Staff Two',
      email: 'staff2@example.com',
      password: 'Staff123.',
      department: 'Academic',
      role: 'staff' 
    },
    { 
      name: 'Staff Three',
      email: 'staff3@example.com',
      password: 'Staff123.',
      department: 'Academic',
      role: 'staff' 
    },
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await new User({
        ...userData,
        password: hashedPassword,
      }).save();
      console.log(`Created user: ${userData.email}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }
  console.log('Users seeded successfully.');
}

// Run the seeding function
seedUsers()
  .then(() => {
    console.log('Database seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });