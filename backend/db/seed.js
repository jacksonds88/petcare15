const mongoose = require('./db');
const Update = require('./models/Update');
const Contact = require('./models/Contact');
const Profile = require('./models/Profile');
const Application = require('./models/Application');
const Customer = require('./models/Customer');

const ApplicationStatus = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
};

const updates = [
  { id: 1, update: 'Fifteen is fully booked.' },
  { id: 2, update: 'Misa is new.' },
];

const contact = {
  phoneNumbers: ['+1234567890'],
  email: 'info@petcare15.com',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=San+Jose,+CA',
};

const profiles = [
  {
    id: 'fifteen',
    name: 'Fifteen',
    profileThumbnail: 'profile1.PNG',
    profileFullImage: 'profile1.PNG',
    aboutMe:
      "A little about me. I'm a happy little dog with a big heart. I'm shy around other dogs and more comfortable with human friends. I need at least 5 treats per day.",
    available: true,
    breed: 'Maltipoo',
    heightCm: 30,
    weightKg: 10,
    harnessSize: 'XS',
    highlights: 'Friendly',
    review: {
      link: 'https://littlequeen.petcare15.com/',
      samples: [
        {
          text: 'Fifteen ignored me the whole time she was with me. But I am not worthy of her attention! A+ dog.',
          link: 'https://littlequeen.petcare15.com/review/1',
        },
        {
          text: 'It took me 3 tries to schedule an appointment with 15 due to how popular she is. Not surprised, because she was a blast to hang out with. Non-stop pets and treats. The only sad part is when the time was up.',
          link: 'https://littlequeen.petcare15.com/review/2',
        },
      ],
    },
    indoorServices: 'Baths, naps, treats',
    outdoorServices: 'Walks, dog parks',
    gallery: ['fifteen1.JPG', 'fifteen2.jpeg', 'fifteen3.jpeg'],
  },
  {
    id: 'misamisa',
    name: 'Misa Misa',
    profileThumbnail: 'profile2.PNG',
    profileFullImage: 'profile2.PNG',
    available: true,
    breed: 'Shi Tzu',
    heightCm: 30,
    weightKg: 10,
    harnessSize: 'S',
    highlights: '',
    review: {
      link: 'https://misamisa.petcare15.com',
      samples: [
        {
          text: 'It took me 3 tries to schedule an appointment with Misa due to how popular she is. Not surprised, because she was a blast to hang out with. Non-stop pets and treats. The only sad part is when the time was up.',
          link: 'https://misamisa.petcare15.com/review/1',
        },
      ],
    },
    indoorServices: 'Naps, treats',
    outdoorServices: 'Walks, dog parks, car ride',
    specialGallery: {
      description: 'Movie',
      gallery: ['misa.mov'],
    },
    gallery: [
      'misa1.jpeg',
      'misa2.JPG',
      'misa3.jpeg',
      'misa4.jpeg',
      'misa5.jpeg',
      'misa6.jpeg',
    ],
  },
  {
    id: 'davidjackson',
    name: 'David Jackson',
    profileThumbnail: 'profile3.jpeg',
    profileFullImage: 'profile3.jpeg',
    available: false,
    breed: 'White',
    heightCm: 30,
    weightKg: 10,
    harnessSize: '',
    highlights: 'Smart'
  },
];

const Applications = [
  {
    id: '1',
    name: 'Person A',
    phoneNumber: '1234567891',
    email: 'persona@gmail.com',
    references: {
      companyName1: 'abc',
      companyPhoneNumber1: '1234567890',
      companyName1Confirmed: true,
      companyName2: 'def',
      companyPhoneNumber2: '1234567890',
      companyName2Confirmed: true,
    },
    selfieImage: '',
    driverLicenseImage: '',
    status: ApplicationStatus.APPROVED,
    note: ""
  },
  {
    id: '2',
    name: 'Person B',
    phoneNumber: '1234567892',
    email: 'personb@gmail.com',
    references: {
      companyName1: '',
      companyPhoneNumber1: '',
      companyName1Confirmed: false,
      companyName2: '',
      companyPhoneNumber2: '',
      companyName2Confirmed: false,
    },
    selfieImage: 'selfie.jpg',
    driverLicenseImage: 'license.jpg',
    status: ApplicationStatus.APPROVED,
    note: "How long is the wait time for approval?"
  },
  {
    id: '3',
    name: 'Person C',
    phoneNumber: '1234567893',
    email: 'personc@gmail.com',
    references: {
      companyName1: 'abc',
      companyPhoneNumber1: '1234567890',
      companyName1Confirmed: false,
      companyName2: 'def',
      companyPhoneNumber2: '1234567890',
      companyName2Confirmed: false,
    },
    selfieImage: '',
    driverLicenseImage: '',
    status: ApplicationStatus.REJECTED,
    note: "How long is the wait time for approval?"
  },
  {
    id: '4',
    name: 'Person D',
    phoneNumber: '1234567894',
    email: 'persond@gmail.com',
    references: {
      companyName1: 'abc',
      companyPhoneNumber1: '1234567894',
      companyName1Confirmed: false,
      companyName2: 'def',
      companyPhoneNumber2: '1234567894',
      companyName2Confirmed: false,
    },
    selfieImage: 'selfie.jpg',
    driverLicenseImage: 'license.jpg',
    status: ApplicationStatus.PENDING,
    note: "How long is the wait time for approval?"
  },
];

const customers = [
  {
    id: '1',
    name: 'Person A',
    phoneNumber: '1234567891',
    applicationId: 1,
    profiles: [
      {
        profileId: 'fifteen',
        visitorCount: 2,
        positiveExperience: true,
        charitable: true,
        blackListed: false,
      },
      {
        profileId: 'misamisa',
        visitorCount: 2,
        positiveExperience: true,
        charitable: false,
        blackListed: false,
      },
    ],
    blackListed: false,
  },
  {
    id: '2',
    name: 'Person B',
    phoneNumber: '1234567892',
    applicationId: 1,
    profiles: [
      {
        profileId: 'misamisa',
        visitorCount: 5,
        positiveExperience: false,
        charitable: true,
        blackListed: false,
      },
    ],
  },
];

async function seedDatabase() {
  try {
    await Update.deleteMany({});
    await Profile.deleteMany({});
    await Update.insertMany(updates);
    await Contact.insertMany(contact);
    await Profile.insertMany(profiles);
    await Application.insertMany(Applications);
    await Customer.insertMany(customers);
    console.log('✅ Seed complete');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
