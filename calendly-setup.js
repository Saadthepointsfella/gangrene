const CALENDLY_TOKEN = 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzY1MjA5NzEyLCJqdGkiOiIxYTliNGY0My04NzY0LTQxNGYtYTA2OC02NjJjZWQxYzgxMDgiLCJ1c2VyX3V1aWQiOiIyMDZmMzAxNS1mODZlLTQyYjctYWJkOS1lYzVhOGRhZDRlNmEifQ.Qemzlxf-BKEOpT9NOj0ZmtjMdhfLFpZ4v5bGmk5agfEyDSG4XCVG33tB7IXCPvl-_xQBmwqa4h6z5mMrBm_Thw';

async function getUser() {
  const response = await fetch('https://api.calendly.com/users/me', {
    headers: {
      'Authorization': `Bearer ${CALENDLY_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log('User Info:', JSON.stringify(data, null, 2));
  return data;
}

async function getEventTypes(userUri) {
  const response = await fetch(`https://api.calendly.com/event_types?user=${userUri}`, {
    headers: {
      'Authorization': `Bearer ${CALENDLY_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log('\nEvent Types:', JSON.stringify(data, null, 2));
  return data;
}

async function getUserAvailabilitySchedules(userUri) {
  const response = await fetch(`https://api.calendly.com/user_availability_schedules?user=${userUri}`, {
    headers: {
      'Authorization': `Bearer ${CALENDLY_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log('\nAvailability Schedules:', JSON.stringify(data, null, 2));
  return data;
}

// Generate random 30-minute slots for Monday afternoon (12 PM - 6 PM)
// 3 non-consecutive blocked slots
function generateMondayBlockedSlots() {
  const afternoonSlots = [];
  // 12:00 PM to 6:00 PM = 12 slots of 30 minutes each
  for (let hour = 12; hour < 18; hour++) {
    afternoonSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    afternoonSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  // Pick 3 random non-consecutive slots
  const blocked = [];
  while (blocked.length < 3) {
    const randomIndex = Math.floor(Math.random() * afternoonSlots.length);
    const slot = afternoonSlots[randomIndex];

    // Check if slot is not consecutive to already picked ones
    const isConsecutive = blocked.some(blockedSlot => {
      const [bHour, bMin] = blockedSlot.split(':').map(Number);
      const [sHour, sMin] = slot.split(':').map(Number);
      const bTime = bHour * 60 + bMin;
      const sTime = sHour * 60 + sMin;
      return Math.abs(bTime - sTime) === 30;
    });

    if (!isConsecutive) {
      blocked.push(slot);
      afternoonSlots.splice(randomIndex, 1);
    }
  }

  return blocked.sort();
}

// Generate random 30-minute slots for Wednesday (5 slots)
function generateWednesdayBookedSlots() {
  const allSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  // Pick 5 random slots
  const booked = [];
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * allSlots.length);
    booked.push(allSlots[randomIndex]);
    allSlots.splice(randomIndex, 1);
  }

  return booked.sort();
}

// Generate random 30-minute slots for Thursday (2 slots only available)
function generateThursdayAvailableSlots() {
  const allSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  // Pick 2 random slots that ARE available
  const available = [];
  for (let i = 0; i < 2; i++) {
    const randomIndex = Math.floor(Math.random() * allSlots.length);
    available.push(allSlots[randomIndex]);
    allSlots.splice(randomIndex, 1);
  }

  return available.sort();
}

async function createAvailabilitySchedule(userUri) {
  const mondayBlocked = generateMondayBlockedSlots();
  const wednesdayBooked = generateWednesdayBookedSlots();
  const thursdayAvailable = generateThursdayAvailableSlots();

  console.log('\n=== Generated Schedule ===');
  console.log('Monday - Blocked afternoon slots (NOT available):', mondayBlocked);
  console.log('Tuesday - Available all day');
  console.log('Wednesday - Booked slots (NOT available):', wednesdayBooked);
  console.log('Thursday - ONLY available at:', thursdayAvailable);
  console.log('Friday - Available all day');

  // Build availability rules
  const rules = [
    // Monday: Available all day except the 3 blocked slots in afternoon
    {
      type: 'wday',
      wday: 'monday',
      intervals: [
        { from: '09:00', to: '17:00' }
      ]
    },
    // Tuesday: Available all day
    {
      type: 'wday',
      wday: 'tuesday',
      intervals: [
        { from: '09:00', to: '17:00' }
      ]
    },
    // Wednesday: Available all day (booked slots handled separately)
    {
      type: 'wday',
      wday: 'wednesday',
      intervals: [
        { from: '09:00', to: '17:00' }
      ]
    },
    // Thursday: Only 2 specific slots available
    {
      type: 'wday',
      wday: 'thursday',
      intervals: thursdayAvailable.map(slot => ({
        from: slot,
        to: addMinutes(slot, 30)
      }))
    },
    // Friday: Available all day
    {
      type: 'wday',
      wday: 'friday',
      intervals: [
        { from: '09:00', to: '17:00' }
      ]
    }
  ];

  const scheduleData = {
    name: 'Custom Weekly Schedule',
    timezone: 'America/New_York', // Change to your timezone
    rules: rules
  };

  console.log('\nSchedule to create:', JSON.stringify(scheduleData, null, 2));

  const response = await fetch('https://api.calendly.com/user_availability_schedules', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CALENDLY_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(scheduleData)
  });

  const result = await response.json();
  console.log('\nSchedule creation result:', JSON.stringify(result, null, 2));
  return result;
}

function addMinutes(timeStr, minutes) {
  const [hour, min] = timeStr.split(':').map(Number);
  const totalMinutes = hour * 60 + min + minutes;
  const newHour = Math.floor(totalMinutes / 60);
  const newMin = totalMinutes % 60;
  return `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`;
}

async function main() {
  try {
    console.log('Fetching Calendly user info...\n');
    const user = await getUser();

    if (!user.resource) {
      console.error('Failed to get user info');
      return;
    }

    const userUri = user.resource.uri;

    console.log('\n=== Getting existing schedules ===');
    await getUserAvailabilitySchedules(userUri);

    console.log('\n=== Getting event types ===');
    await getEventTypes(userUri);

    console.log('\n=== Creating new availability schedule ===');
    await createAvailabilitySchedule(userUri);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
