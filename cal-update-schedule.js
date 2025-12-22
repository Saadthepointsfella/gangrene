const CAL_API_KEY = 'cal_live_d897706e75952beb4a5fec778c5ea2bb';
const CAL_API_BASE = 'https://api.cal.com/v1';

// The schedule we just created
const SCHEDULE_ID = 1108775;

async function updateScheduleWithDetailedAvailability() {
  // Generate random slots
  function generateRandomBlockedSlots(totalSlots, numToBlock) {
    const slots = [];
    for (let i = 0; i < totalSlots; i++) {
      slots.push(i);
    }

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
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`;
  }

  function buildTimeSlots(blockedIndices, totalSlots, startHour, endHour) {
    const slots = [];

    for (let i = 0; i < totalSlots; i++) {
      if (!blockedIndices.includes(i)) {
        const startTime = slotIndexToTime(i, startHour);
        const endTime = slotIndexToTime(i + 1, startHour);
        slots.push({ startTime, endTime });
      }
    }

    return slots;
  }

  // Monday: Afternoon with 3 blocked slots
  const mondayAfternoonSlots = 10;
  const mondayBlockedAfternoon = generateRandomBlockedSlots(mondayAfternoonSlots, 3);

  // Build Monday availability - morning + afternoon slots
  const mondayAvailability = [
    { days: [1], startTime: '09:00:00', endTime: '12:00:00' } // Morning
  ];

  // Add afternoon slots avoiding blocked times
  const mondayAfternoonTimes = buildTimeSlots(mondayBlockedAfternoon, mondayAfternoonSlots, 12, 17);
  mondayAfternoonTimes.forEach(slot => {
    mondayAvailability.push({
      days: [1],
      startTime: slot.startTime,
      endTime: slot.endTime
    });
  });

  console.log('MONDAY blocked slots:', mondayBlockedAfternoon.map(i => slotIndexToTime(i, 12)));
  console.log('MONDAY availability:', mondayAvailability);

  // Wednesday: 5 blocked slots
  const wednesdaySlots = 16;
  const wednesdayBlocked = generateRandomBlockedSlots(wednesdaySlots, 5);
  const wednesdayTimes = buildTimeSlots(wednesdayBlocked, wednesdaySlots, 9, 17);
  const wednesdayAvailability = wednesdayTimes.map(slot => ({
    days: [3],
    startTime: slot.startTime,
    endTime: slot.endTime
  }));

  console.log('\nWEDNESDAY blocked slots:', wednesdayBlocked.map(i => slotIndexToTime(i, 9)));
  console.log('WEDNESDAY availability:', wednesdayAvailability);

  // Thursday: Only 2 slots available
  const thursdaySlots = 16;
  const thursdayAvailableIndices = [];
  while (thursdayAvailableIndices.length < 2) {
    const random = Math.floor(Math.random() * thursdaySlots);
    if (!thursdayAvailableIndices.includes(random)) {
      thursdayAvailableIndices.push(random);
    }
  }
  thursdayAvailableIndices.sort((a, b) => a - b);
  const thursdayAvailability = thursdayAvailableIndices.map(idx => ({
    days: [4],
    startTime: slotIndexToTime(idx, 9),
    endTime: slotIndexToTime(idx + 1, 9)
  }));

  console.log('\nTHURSDAY available slots:', thursdayAvailableIndices.map(i => slotIndexToTime(i, 9)));
  console.log('THURSDAY availability:', thursdayAvailability);

  // Tuesday and Friday - all day
  const tuesdayAvailability = [{ days: [2], startTime: '09:00:00', endTime: '17:00:00' }];
  const fridayAvailability = [{ days: [5], startTime: '09:00:00', endTime: '17:00:00' }];

  console.log('\nTUESDAY availability: All day 09:00-17:00');
  console.log('FRIDAY availability: All day 09:00-17:00');

  // Combine all availability
  const fullAvailability = [
    ...mondayAvailability,
    ...tuesdayAvailability,
    ...wednesdayAvailability,
    ...thursdayAvailability,
    ...fridayAvailability
  ];

  console.log('\n=== Updating schedule with detailed availability ===');
  console.log('Total availability slots:', fullAvailability.length);

  const response = await fetch(`${CAL_API_BASE}/schedules/${SCHEDULE_ID}?apiKey=${CAL_API_KEY}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      availability: fullAvailability
    })
  });

  const result = await response.json();
  console.log('\nUpdate result:', JSON.stringify(result, null, 2));

  if (response.ok) {
    console.log('\n✅ Schedule updated successfully!');
    console.log('View at: https://app.cal.com/availability');
  } else {
    console.log('\n❌ Failed to update schedule');
  }

  return result;
}

updateScheduleWithDetailedAvailability();
