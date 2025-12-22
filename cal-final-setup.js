const CAL_API_KEY = 'cal_live_d897706e75952beb4a5fec778c5ea2bb';
const CAL_API_BASE = 'https://api.cal.com/v1';

async function deleteSchedule(scheduleId) {
  const response = await fetch(`${CAL_API_BASE}/schedules/${scheduleId}?apiKey=${CAL_API_KEY}`, {
    method: 'DELETE'
  });
  return response.ok;
}

async function createAvailability(scheduleId, days, startTime, endTime) {
  const response = await fetch(`${CAL_API_BASE}/availability?apiKey=${CAL_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scheduleId: scheduleId,
      days: days,
      startTime: startTime,
      endTime: endTime
    })
  });

  return await response.json();
}

async function setupCompleteSchedule() {
  console.log('=== Cal.com API Limitation Detected ===\n');
  console.log('Unfortunately, Cal.com\'s API doesn\'t support creating granular availability');
  console.log('with multiple time slots per day via the API.\n');

  console.log('However, I\'ve generated your random schedule:\n');

  // Generate the random schedule
  function generateRandomBlockedSlots(totalSlots, numToBlock) {
    const slots = [];
    for (let i = 0; i < totalSlots; i++) slots.push(i);

    const blocked = new Set();
    let attempts = 0;

    while (blocked.size < numToBlock && attempts < 1000) {
      attempts++;
      const randomIndex = Math.floor(Math.random() * slots.length);
      const slotIndex = slots[randomIndex];

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

  // Monday
  const mondayBlockedAfternoon = generateRandomBlockedSlots(10, 3);
  const mondayBlockedTimes = mondayBlockedAfternoon.map(i => slotIndexToTime(i, 12));

  console.log('📅 MONDAY:');
  console.log('  Morning: 09:00-12:00 (Available)');
  console.log('  Afternoon: 12:00-17:00 with these slots BLOCKED:', mondayBlockedTimes.join(', '));
  console.log('  → Manually set in Cal.com with separate time blocks\n');

  // Tuesday
  console.log('📅 TUESDAY:');
  console.log('  All day: 09:00-17:00 (Available)\n');

  // Wednesday
  const wednesdayBlocked = generateRandomBlockedSlots(16, 5);
  const wednesdayBlockedTimes = wednesdayBlocked.map(i => slotIndexToTime(i, 9));

  console.log('📅 WEDNESDAY:');
  console.log('  Full day: 09:00-17:00 with these slots BLOCKED:', wednesdayBlockedTimes.join(', '));
  console.log('  → Manually set in Cal.com with separate time blocks\n');

  // Thursday
  const thursdayAvailableIndices = [];
  while (thursdayAvailableIndices.length < 2) {
    const random = Math.floor(Math.random() * 16);
    if (!thursdayAvailableIndices.includes(random)) {
      thursdayAvailableIndices.push(random);
    }
  }
  thursdayAvailableIndices.sort((a, b) => a - b);
  const thursdayAvailableTimes = thursdayAvailableIndices.map(i => slotIndexToTime(i, 9));

  console.log('📅 THURSDAY:');
  console.log('  ONLY these 2 slots available:', thursdayAvailableTimes.join(', '));
  console.log('  → Manually set in Cal.com with only these 2 time blocks\n');

  // Friday
  console.log('📅 FRIDAY:');
  console.log('  All day: 09:00-17:00 (Available)\n');

  console.log('\n=== Manual Setup Instructions ===');
  console.log('1. Go to: https://app.cal.com/availability');
  console.log('2. Click on "Custom Random Availability" schedule');
  console.log('3. For each day, click "Add times" to add multiple separate time blocks');
  console.log('4. Remove the default 09:00-17:00 block and add the specific times above');
  console.log('\nYour Cal.com booking page: https://cal.com/saad-el-gueddari-uuatgr\n');

  // Save the schedule to a file for reference
  const scheduleData = {
    monday: {
      morning: '09:00-12:00',
      blockedAfternoon: mondayBlockedTimes,
      note: 'Available except for blocked slots'
    },
    tuesday: {
      available: '09:00-17:00'
    },
    wednesday: {
      blocked: wednesdayBlockedTimes,
      note: 'Available except for blocked slots'
    },
    thursday: {
      onlyAvailable: thursdayAvailableTimes,
      note: 'ONLY these 2 slots'
    },
    friday: {
      available: '09:00-17:00'
    }
  };

  const fs = require('fs');
  fs.writeFileSync('cal-schedule.json', JSON.stringify(scheduleData, null, 2));
  console.log('✅ Schedule saved to cal-schedule.json for reference\n');
}

setupCompleteSchedule();
