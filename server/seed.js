require('dotenv').config();
const mysql = require('mysql2');

// --- Configuration ---
const MIN_STUDENT_ID = 2; // Assuming user_id 1 is the admin
const MAX_STUDENT_ID = 101;
const NUM_CLUBS = 10;
const CLUB_CAPACITY = 30;
const POINTS_PER_CLUB = 10;

// --- Main Seeding Function ---
async function seed() {
  let connection;
  try {
    // Create a single connection for the script
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    }).promise();

    console.log('Connected to the database.');

    // Start a transaction
    await connection.beginTransaction();
    console.log('Transaction started.');

    // Get club capacities
    const [clubs] = await connection.query('SELECT club_id, current_members FROM clubs');
    const clubMemberCounts = new Map(clubs.map(c => [c.club_id, c.current_members]));

    console.log('Processing students...');
    for (let userId = MIN_STUDENT_ID; userId <= MAX_STUDENT_ID; userId++) {
      const numClubsToJoin = getNumClubsToJoin();
      if (numClubsToJoin === 0) {
        console.log(`Student ${userId} will join 0 clubs.`);
        continue;
      }

      const availableClubs = getShuffledClubIds().filter(clubId => 
        (clubMemberCounts.get(clubId) || 0) < CLUB_CAPACITY
      );

      const clubsToJoin = availableClubs.slice(0, numClubsToJoin);
      console.log(`Student ${userId} will attempt to join ${clubsToJoin.length} clubs: [${clubsToJoin.join(', ')}]`);

      for (const clubId of clubsToJoin) {
        // Insert into club_members
        await connection.query(
          'INSERT INTO club_members (user_id, club_id, points_earned) VALUES (?, ?, ?)',
          [userId, clubId, POINTS_PER_CLUB]
        );

        // Update user's total_points
        await connection.query(
          'UPDATE users SET total_points = total_points + ? WHERE user_id = ?',
          [POINTS_PER_CLUB, userId]
        );

        // Only update club's current_members here. Club total_points will be recalculated later.
        await connection.query(
          'UPDATE clubs SET current_members = current_members + 1 WHERE club_id = ?',
          [clubId]
        );
        
        // Update local count
        clubMemberCounts.set(clubId, (clubMemberCounts.get(clubId) || 0) + 1);
      }
    }

    // Commit the transaction for initial memberships and student points
    await connection.commit();
    console.log('\nTransaction committed for initial memberships and student points.');

    // --- Recalculate Club Points based on sum of member points ---
    console.log('Recalculating club total points...');
    const [allClubsForRecalc] = await connection.query('SELECT club_id FROM clubs');
    for (const club of allClubsForRecalc) {
      const [memberPoints] = await connection.query(
        'SELECT SUM(u.total_points) as total_member_points FROM club_members cm JOIN users u ON cm.user_id = u.user_id WHERE cm.club_id = ?',
        [club.club_id]
      );
      const newClubTotalPoints = memberPoints[0].total_member_points || 0;
      await connection.query('UPDATE clubs SET total_points = ? WHERE club_id = ?', [newClubTotalPoints, club.club_id]);
      console.log(`Club ${club.club_id} total points updated to: ${newClubTotalPoints}`);
    }

    // --- Update Club Badges based on total_points ---
    console.log('Updating club badges...');
    const [allClubs] = await connection.query('SELECT club_id, total_points FROM clubs');
    for (const club of allClubs) {
      let badge = 'none';
      if (club.total_points >= 2000) badge = 'platinum';
      else if (club.total_points >= 1200) badge = 'gold';
      else if (club.total_points >= 700) badge = 'silver';
      else if (club.total_points >= 300) badge = 'bronze';
      else if (club.total_points >= 100) badge = 'iron';

      if (club.badge !== badge) {
        await connection.query('UPDATE clubs SET badge = ? WHERE club_id = ?', [badge, club.club_id]);
        console.log(`Club ${club.club_id} (${club.total_points} pts) updated to badge: ${badge}`);
      }
    }
    console.log('Club badges updated.');

    // --- Assign Student Badges based on total_points ---
    console.log('Assigning student badges...');
    const [studentBadgeDefinitions] = await connection.query('SELECT badge_id, badge_name, points_required FROM badges WHERE badge_type = \'student\'');
    const studentBadgesMap = new Map(studentBadgeDefinitions.map(b => [b.badge_name.toLowerCase(), b.badge_id]));

    const [allStudents] = await connection.query('SELECT user_id, total_points FROM users WHERE role = \'student\'');
    for (const student of allStudents) {
      let studentBadgeName = 'none';
      if (student.total_points >= 60) studentBadgeName = 'gold';
      else if (student.total_points >= 40) studentBadgeName = 'silver';
      else if (student.total_points >= 20) studentBadgeName = 'bronze';

      if (studentBadgeName !== 'none') {
        const badgeId = studentBadgesMap.get(studentBadgeName);
        if (badgeId) {
          // Check if badge already exists for student to avoid duplicates
          const [existingBadges] = await connection.query(
            'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
            [student.user_id, badgeId]
          );
          if (existingBadges.length === 0) {
            await connection.query('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [student.user_id, badgeId]);
            console.log(`Student ${student.user_id} (${student.total_points} pts) awarded badge: ${studentBadgeName}`);
          }
        }
      }
    }
    console.log('Student badges assigned.');

    console.log('Database has been seeded with random club memberships and badges.');

  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.error('\nTransaction rolled back due to an error:', error);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

// --- Helper Functions ---

function getNumClubsToJoin() {
  const rand = Math.random();
  if (rand < 0.2) { // 20% chance
    return 0;
  } else if (rand < 0.9) { // 70% chance (from 0.2 to 0.9)
    return Math.floor(Math.random() * 4) + 1; // 1 to 4 clubs
  } else { // 10% chance
    return Math.floor(Math.random() * 2) + 5; // 5 or 6 clubs
  }
}

function getShuffledClubIds() {
  const clubIds = Array.from({ length: NUM_CLUBS }, (_, i) => i + 1);
  // Fisher-Yates shuffle
  for (let i = clubIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clubIds[i], clubIds[j]] = [clubIds[j], clubIds[i]];
  }
  return clubIds;
}

// --- Run the script ---
seed();
