const CAL_API_KEY = 'cal_live_d897706e75952beb4a5fec778c5ea2bb';
const CAL_API_BASE = 'https://api.cal.com/v1';

async function getUser() {
  const response = await fetch(`${CAL_API_BASE}/me?apiKey=${CAL_API_KEY}`);
  const data = await response.json();
  console.log('User Info:', JSON.stringify(data, null, 2));
  return data;
}

async function getSchedules() {
  const response = await fetch(`${CAL_API_BASE}/schedules?apiKey=${CAL_API_KEY}`);
  const data = await response.json();
  console.log('\nSchedules:', JSON.stringify(data, null, 2));
  return data;
}

async function getAvailability() {
  const response = await fetch(`${CAL_API_BASE}/availability?apiKey=${CAL_API_KEY}`);
  const data = await response.json();
  console.log('\nAvailability:', JSON.stringify(data, null, 2));
  return data;
}

// Generate random non-consecutive 30-minute slots
function generateRandomBlockedSlots(totalSlots, numToBlock) {
  const slots = [];
  for (let i = 0; i < totalSlots; i++) {
    slots.push(i);
  }

  const blocked = new Set();
  let attempts = 0;
  const maxAttempts = 1000;

  while (blocked.size < numToBlock && attempts < maxAttempts) {
    attempts++;
    const randomIndex = Math.floor(Math.random() * slots.length);
    const slotIndex = slots[randomIndex];

    // Check if adjacent slots are already blocked
    const hasAdjacentBlocked = Array.from(blocked).some(blockedIdx => {
      return Math.abs(blockedIdx - slotIndex) === 1;
    });

    if (!hasAdjacentBlocked || blocked.size === 0) {
      blocked.add(slotIndex);
    }
  }

  return Array.from(blocked).sort((a, b) => a - b);
}

function slotIndexToTime(index, startHour = 9) {
  const totalMinutes = startHour * 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

function buildAvailabilityIntervals(blockedIndices, totalSlots, startHour = 9) {
  const intervals = [];
  let currentStart = null;

  for (let i = 0; i <= totalSlots; i++) {
    if (blockedIndices.includes(i)) {
      // This slot is blocked
      if (currentStart !== null) {
        // Close current interval
        intervals.push({
          start: slotIndexToTime(currentStart, startHour),
          end: slotIndexToTime(i, startHour)
        });
        currentStart = null;
      }
    } else {
      // This slot is available
      if (currentStart === null) {
        currentStart = i;
      }
    }
  }

  return intervals;
}

async function createSchedule(name, availability) {
  const response = await fetch(`${CAL_API_BASE}/schedules?apiKey=${CAL_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      timeZone: 'Africa/Casablanca',
      availability: availability
    })
  });

  const data = await response.json();
  console.log(`\nSchedule creation result for "${name}":`, JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  try {
    console.log('=== Fetching Cal.com user info ===\n');
    const user = await getUser();

    console.log('\n=== Fetching existing schedules ===\n');
    const schedules = await getSchedules();

    console.log('\n=== Generating random availability ===\n');

    // Monday: Free morning (9-12), afternoon (12-17) with 3 random blocked 30-min slots
    const mondayAfternoonSlots = 10; // 12:00-17:00 = 10 slots of 30 min
    const mondayBlockedAfternoon = generateRandomBlockedSlots(mondayAfternoonSlots, 3);
    const mondayBlockedTimes = mondayBlockedAfternoon.map(idx => slotIndexToTime(idx, 12));

    const mondayIntervals = [
      { start: '09:00', end: '12:00' }, // Morning fully available
      ...buildAvailabilityIntervals(mondayBlockedAfternoon, mondayAfternoonSlots, 12)
    ];

    console.log('MONDAY - Blocked afternoon slots:', mondayBlockedTimes);
    console.log('MONDAY - Available intervals:', mondayIntervals);

    // Tuesday: Available all day
    const tuesdayIntervals = [{ start: '09:00', end: '17:00' }];
    console.log('\nTUESDAY - Available all day:', tuesdayIntervals);

    // Wednesday: 5 random 30-min slots blocked (9-17 = 16 slots)
    const wednesdaySlots = 16;
    const wednesdayBlocked = generateRandomBlockedSlots(wednesdaySlots, 5);
    const wednesdayBlockedTimes = wednesdayBlocked.map(idx => slotIndexToTime(idx, 9));
    const wednesdayIntervals = buildAvailabilityIntervals(wednesdayBlocked, wednesdaySlots, 9);

    console.log('\nWEDNESDAY - Blocked slots:', wednesdayBlockedTimes);
    console.log('WEDNESDAY - Available intervals:', wednesdayIntervals);

    // Thursday: Only 2 random 30-min slots available
    const thursdaySlots = 16;
    const thursdayAvailableIndices = [];
    while (thursdayAvailableIndices.length < 2) {
      const random = Math.floor(Math.random() * thursdaySlots);
      if (!thursdayAvailableIndices.includes(random)) {
        thursdayAvailableIndices.push(random);
      }
    }
    thursdayAvailableIndices.sort((a, b) => a - b);
    const thursdayIntervals = thursdayAvailableIndices.map(idx => ({
      start: slotIndexToTime(idx, 9),
      end: slotIndexToTime(idx + 1, 9)
    }));

    console.log('\nTHURSDAY - Only available at:', thursdayIntervals.map(i => i.start));
    console.log('THURSDAY - Available intervals:', thursdayIntervals);

    // Friday: Available all day
    const fridayIntervals = [{ start: '09:00', end: '17:00' }];
    console.log('\nFRIDAY - Available all day:', fridayIntervals);

    // Create the schedule
    const availability = [
      {
        days: [1], // Monday
        startTime: '09:00',
        endTime: '17:00',
        date: null
      },
      {
        days: [2], // Tuesday
        startTime: '09:00',
        endTime: '17:00',
        date: null
      },
      {
        days: [3], // Wednesday
        startTime: '09:00',
        endTime: '17:00',
        date: null
      },
      {
        days: [4], // Thursday
        startTime: '09:00',
        endTime: '17:00',
        date: null
      },
      {
        days: [5], // Friday
        startTime: '09:00',
        endTime: '17:00',
        date: null
      }
    ];

    console.log('\n=== Creating schedule ===');
    await createSchedule('Custom Random Availability', availability);

    console.log('\n✅ Done! Check your Cal.com dashboard at https://app.cal.com/availability');

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
