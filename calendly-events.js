const CALENDLY_TOKEN = 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzY1MjA5NzEyLCJqdGkiOiIxYTliNGY0My04NzY0LTQxNGYtYTA2OC02NjJjZWQxYzgxMDgiLCJ1c2VyX3V1aWQiOiIyMDZmMzAxNS1mODZlLTQyYjctYWJkOS1lYzVhOGRhZDRlNmEifQ.Qemzlxf-BKEOpT9NOj0ZmtjMdhfLFpZ4v5bGmk5agfEyDSG4XCVG33tB7IXCPvl-_xQBmwqa4h6z5mMrBm_Thw';

console.log(`
==============================================
CALENDLY AVAILABILITY SETUP GUIDE
==============================================

Based on your requirements:
- Monday: Free all morning, 3 random 30-min blocked slots in afternoon (non-consecutive)
- Tuesday: Available all day
- Wednesday: 5 random 30-min slots booked
- Thursday: Only 2 random 30-min slots available
- Friday: Available all day

Unfortunately, Calendly's API doesn't allow direct modification of availability
schedules via Personal Access Tokens for security reasons.

SOLUTION: You need to set this up manually in Calendly's dashboard.

Here's how:
==============================================

STEP 1: Go to your Calendly Availability Settings
https://calendly.com/app/availability/schedules

STEP 2: Click on "Working hours" schedule (or create a new one)

STEP 3: Set up each day:

📅 MONDAY:
  - Click on Monday
  - Add time slots: 09:00 - 12:00 (morning - fully available)
  - For afternoon, add MULTIPLE separate slots avoiding these 3 random times:
    Blocked: 14:00, 16:00, 17:00
  - So add: 12:00-14:00, 14:30-16:00, 16:30-17:00

📅 TUESDAY:
  - Keep as: 09:00 - 17:00 (fully available)

📅 WEDNESDAY:
  - Add MULTIPLE separate slots avoiding these 5 random times:
    Blocked: 09:30, 10:30, 11:00, 12:30, 13:00
  - So add: 09:00-09:30, 10:00-10:30, 11:30-12:30, 13:30-17:00

📅 THURSDAY:
  - ONLY add these 2 slots: 11:00-11:30, 13:00-13:30

📅 FRIDAY:
  - Keep as: 09:00 - 17:00 (fully available)

==============================================

ALTERNATIVE: Use Date Overrides for specific weeks
==============================================

If you want this for specific dates only (not every week):

1. Go to: https://calendly.com/app/availability/date_overrides
2. Click "Add Date Override"
3. Select specific dates and set custom hours for each day

This is useful if you want different availability just for next week,
rather than permanently changing your weekly schedule.

==============================================
Your Calendly URLs:
==============================================
- Scheduling Page: https://calendly.com/saad-maxmin
- 30 Min Meeting: https://calendly.com/saad-maxmin/30min
- New Meeting: https://calendly.com/saad-maxmin/new-meeting

==============================================
`);

// Let's at least show what the schedule would look like
console.log('If I could automate this, here\'s what would be set:\n');

function generateRandomBlockedSlots(totalSlots, numToBlock, start = 12, end = 18) {
  const slots = [];
  for (let hour = start; hour < end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const blocked = new Set();
  while (blocked.size < numToBlock) {
    const randomIndex = Math.floor(Math.random() * slots.length);
    const slot = slots[randomIndex];

    // Check non-consecutive
    const [hour, min] = slot.split(':').map(Number);
    const isAdjacent = Array.from(blocked).some(blockedSlot => {
      const [bHour, bMin] = blockedSlot.split(':').map(Number);
      const diff = Math.abs((hour * 60 + min) - (bHour * 60 + bMin));
      return diff === 30;
    });

    if (!isAdjacent || blocked.size === 0) {
      blocked.add(slot);
    }
  }

  return Array.from(blocked).sort();
}

const mondayBlocked = generateRandomBlockedSlots(12, 3, 12, 18);
const wednesdayBlocked = generateRandomBlockedSlots(16, 5, 9, 17);
const thursdayAvailable = generateRandomBlockedSlots(16, 2, 9, 17);

console.log('MONDAY - Afternoon blocked slots (NOT available):', mondayBlocked);
console.log('TUESDAY - Available: 09:00-17:00');
console.log('WEDNESDAY - Booked slots (NOT available):', wednesdayBlocked);
console.log('THURSDAY - ONLY available at:', thursdayAvailable);
console.log('FRIDAY - Available: 09:00-17:00\n');

console.log('To apply these settings, visit: https://calendly.com/app/availability/schedules\n');
