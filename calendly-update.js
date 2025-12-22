const CALENDLY_TOKEN = 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzY1MjA5NzEyLCJqdGkiOiIxYTliNGY0My04NzY0LTQxNGYtYTA2OC02NjJjZWQxYzgxMDgiLCJ1c2VyX3V1aWQiOiIyMDZmMzAxNS1mODZlLTQyYjctYWJkOS1lYzVhOGRhZDRlNmEifQ.Qemzlxf-BKEOpT9NOj0ZmtjMdhfLFpZ4v5bGmk5agfEyDSG4XCVG33tB7IXCPvl-_xQBmwqa4h6z5mMrBm_Thw';

// Generate random 30-minute slots for Monday afternoon (12 PM - 6 PM)
// 3 non-consecutive blocked slots
function generateMondayAvailableSlots() {
  const afternoonSlots = [];
  // 12:00 PM to 6:00 PM = 12 slots of 30 minutes each
  for (let hour = 12; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      afternoonSlots.push({ hour, min });
    }
  }

  // Pick 3 random non-consecutive slots to BLOCK
  const blockedIndices = new Set();
  while (blockedIndices.size < 3) {
    const randomIndex = Math.floor(Math.random() * afternoonSlots.length);

    // Check if adjacent slots are already blocked
    const hasAdjacentBlocked =
      blockedIndices.has(randomIndex - 1) ||
      blockedIndices.has(randomIndex + 1);

    if (!hasAdjacentBlocked) {
      blockedIndices.add(randomIndex);
    }
  }

  // Build available intervals (everything except blocked slots)
  const morningInterval = { from: '09:00', to: '12:00' };
  const afternoonIntervals = [];

  let currentStart = null;
  afternoonSlots.forEach((slot, idx) => {
    const timeStr = `${slot.hour.toString().padStart(2, '0')}:${slot.min.toString().padStart(2, '0')}`;

    if (blockedIndices.has(idx)) {
      // This slot is blocked
      if (currentStart) {
        // Close the current interval
        afternoonIntervals.push({ from: currentStart, to: timeStr });
        currentStart = null;
      }
    } else {
      // This slot is available
      if (!currentStart) {
        currentStart = timeStr;
      }
    }
  });

  // Close final interval if needed
  if (currentStart) {
    afternoonIntervals.push({ from: currentStart, to: '17:00' });
  }

  const blockedSlots = Array.from(blockedIndices)
    .sort((a, b) => a - b)
    .map(idx => {
      const slot = afternoonSlots[idx];
      return `${slot.hour.toString().padStart(2, '0')}:${slot.min.toString().padStart(2, '0')}`;
    });

  return { intervals: [morningInterval, ...afternoonIntervals], blockedSlots };
}

// Generate available intervals for Wednesday (block 5 random slots)
function generateWednesdayAvailableSlots() {
  const allSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let min = 0; min < 60; min += 30) {
      allSlots.push({ hour, min });
    }
  }

  // Pick 5 random slots to block
  const blockedIndices = new Set();
  while (blockedIndices.size < 5) {
    blockedIndices.add(Math.floor(Math.random() * allSlots.length));
  }

  // Build available intervals
  const intervals = [];
  let currentStart = null;

  allSlots.forEach((slot, idx) => {
    const timeStr = `${slot.hour.toString().padStart(2, '0')}:${slot.min.toString().padStart(2, '0')}`;

    if (blockedIndices.has(idx)) {
      if (currentStart) {
        intervals.push({ from: currentStart, to: timeStr });
        currentStart = null;
      }
    } else {
      if (!currentStart) {
        currentStart = timeStr;
      }
    }
  });

  if (currentStart) {
    intervals.push({ from: currentStart, to: '17:00' });
  }

  const blockedSlots = Array.from(blockedIndices)
    .sort((a, b) => a - b)
    .map(idx => {
      const slot = allSlots[idx];
      return `${slot.hour.toString().padStart(2, '0')}:${slot.min.toString().padStart(2, '0')}`;
    });

  return { intervals, blockedSlots };
}

// Generate 2 available slots for Thursday
function generateThursdayAvailableSlots() {
  const allSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let min = 0; min < 60; min += 30) {
      allSlots.push({ hour, min });
    }
  }

  // Pick 2 random slots
  const availableIndices = [];
  while (availableIndices.length < 2) {
    const randomIndex = Math.floor(Math.random() * allSlots.length);
    if (!availableIndices.includes(randomIndex)) {
      availableIndices.push(randomIndex);
    }
  }
  availableIndices.sort((a, b) => a - b);

  const intervals = availableIndices.map(idx => {
    const slot = allSlots[idx];
    const startTime = `${slot.hour.toString().padStart(2, '0')}:${slot.min.toString().padStart(2, '0')}`;
    const endHour = slot.min === 30 ? slot.hour + 1 : slot.hour;
    const endMin = slot.min === 30 ? 0 : 30;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    return { from: startTime, to: endTime };
  });

  return {
    intervals,
    availableSlots: availableIndices.map(idx => {
      const slot = allSlots[idx];
      return `${slot.hour.toString().padStart(2, '0')}:${slot.min.toString().padStart(2, '0')}`;
    })
  };
}

async function updateAvailabilitySchedule() {
  const scheduleUri = 'https://api.calendly.com/user_availability_schedules/1b04dfcd-94a4-4e5d-9725-373534f09c33';

  const mondayData = generateMondayAvailableSlots();
  const wednesdayData = generateWednesdayAvailableSlots();
  const thursdayData = generateThursdayAvailableSlots();

  console.log('\n=== Generated Schedule ===');
  console.log('Monday - Available (blocked slots:', mondayData.blockedSlots.join(', ') + ')');
  console.log('Tuesday - Available all day (09:00-17:00)');
  console.log('Wednesday - Available (blocked slots:', wednesdayData.blockedSlots.join(', ') + ')');
  console.log('Thursday - ONLY available at:', thursdayData.availableSlots.join(', '));
  console.log('Friday - Available all day (09:00-17:00)');

  const scheduleData = {
    rules: [
      {
        type: 'wday',
        wday: 'sunday',
        intervals: []
      },
      {
        type: 'wday',
        wday: 'monday',
        intervals: mondayData.intervals
      },
      {
        type: 'wday',
        wday: 'tuesday',
        intervals: [{ from: '09:00', to: '17:00' }]
      },
      {
        type: 'wday',
        wday: 'wednesday',
        intervals: wednesdayData.intervals
      },
      {
        type: 'wday',
        wday: 'thursday',
        intervals: thursdayData.intervals
      },
      {
        type: 'wday',
        wday: 'friday',
        intervals: [{ from: '09:00', to: '17:00' }]
      },
      {
        type: 'wday',
        wday: 'saturday',
        intervals: []
      }
    ]
  };

  console.log('\n=== Updating schedule ===');
  console.log(JSON.stringify(scheduleData, null, 2));

  const response = await fetch(scheduleUri, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CALENDLY_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(scheduleData)
  });

  const result = await response.json();

  if (response.ok) {
    console.log('\n✅ Schedule updated successfully!');
    console.log('\nYour Calendly is now set with:');
    console.log('- Monday: Free all morning, afternoon has 3 random 30-min blocked slots (non-consecutive)');
    console.log('- Tuesday: Available all day');
    console.log('- Wednesday: 5 random 30-min slots are booked');
    console.log('- Thursday: Only 2 random 30-min slots available');
    console.log('- Friday: Available all day');
    console.log('\nView your schedule at: https://calendly.com/app/availability/schedules');
  } else {
    console.log('\n❌ Failed to update schedule');
    console.log('Response:', JSON.stringify(result, null, 2));
  }

  return result;
}

updateAvailabilitySchedule();
