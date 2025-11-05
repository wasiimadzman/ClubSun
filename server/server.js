require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}).promise();

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];

        // In a real application, you should hash passwords and compare the hash.
        // For this example, we are comparing plain text passwords.
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/clubs', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clubs');
        console.log('DEBUG Backend /api/clubs: rows from DB:', rows);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/club-members', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM club_members');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/badges', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM badges');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/user-badges', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM user_badges');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Helper function to calculate student badge
const getStudentBadge = (points) => {
    if (points >= 60) return 'gold';
    if (points >= 40) return 'silver';
    if (points >= 20) return 'bronze';
    return 'none';
};

// Helper function to calculate club badge
const getClubBadge = (points) => {
    if (points >= 2000) return 'Platinum';
    if (points >= 1200) return 'Gold';
    if (points >= 700) return 'Silver';
    if (points >= 300) return 'Bronze';
    if (points >= 100) return 'Iron';
    return 'No Badge';
};

app.post('/api/clubs/join', async (req, res) => {
    const { userId, clubId } = req.body;

    if (!userId || !clubId) {
        return res.status(400).json({ message: 'User ID and Club ID are required' });
    }

    try {
        // 1. Check if student is already a member
        const [existingMembership] = await db.query(
            'SELECT * FROM club_members WHERE user_id = ? AND club_id = ?',
            [userId, clubId]
        );
        if (existingMembership.length > 0) {
            return res.status(409).json({ message: 'Student is already a member of this club' });
        }

        // 2. Check club capacity
        const [clubRows] = await db.query('SELECT current_members, capacity FROM clubs WHERE club_id = ?', [clubId]);
        if (clubRows.length === 0) {
            return res.status(404).json({ message: 'Club not found' });
        }
        const club = clubRows[0];
        if (club.current_members >= club.capacity) {
            return res.status(403).json({ message: 'Club has reached maximum capacity' });
        }

        // 3. Add student to club_members
        await db.query('INSERT INTO club_members (user_id, club_id) VALUES (?, ?)', [userId, clubId]);

        // 4. Update student's points and badge
        const [userRows] = await db.query('SELECT total_points FROM users WHERE user_id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currentUserPoints = userRows[0].total_points;
                    const newStudentPoints = currentUserPoints + 10; // Students earn 10 points for every club they join
                    const newStudentBadge = getStudentBadge(newStudentPoints);
        
                    console.log('DEBUG: newStudentPoints:', newStudentPoints);
                    console.log('DEBUG: newStudentBadge:', newStudentBadge);
        
                    await db.query(
                        'UPDATE users SET total_points = ?, badge = ? WHERE user_id = ?',
                        [newStudentPoints, newStudentBadge, userId]
                    );
        // 5. Recalculate club's total points and badge
        // Get all members' points for this club
        const [memberPointsRows] = await db.query(
            'SELECT SUM(u.total_points) AS totalClubPoints FROM club_members cm JOIN users u ON cm.user_id = u.user_id WHERE cm.club_id = ?',
            [clubId]
        );
        const newClubTotalPoints = memberPointsRows[0].totalClubPoints || 0;
        const newClubBadge = getClubBadge(newClubTotalPoints);

        console.log('DEBUG Backend /api/clubs/join: newClubTotalPoints:', newClubTotalPoints);
        console.log('DEBUG Backend /api/clubs/join: newClubBadge:', newClubBadge);

        await db.query(
            'UPDATE clubs SET current_members = current_members + 1, total_points = ?, badge = ? WHERE club_id = ?',
            [newClubTotalPoints, newClubBadge, clubId]
        );

        // 6. Fetch updated user and club data to send back
        const [updatedUserRows] = await db.query('SELECT user_id as id, name, email, role, total_points, badge FROM users WHERE user_id = ?', [userId]);
        const [updatedClubRows] = await db.query('SELECT club_id as id, club_name as name, description, current_members, capacity as max_members, total_points, badge as badgeLevel FROM clubs WHERE club_id = ?', [clubId]);

        console.log('DEBUG Backend /api/clubs/join: updatedClubRows[0].current_members:', updatedClubRows[0].current_members);

        console.log('DEBUG: updatedUserRows[0].badge (from DB after update):', updatedUserRows[0].badge);

        res.json({
            message: 'Successfully joined club',
            user: updatedUserRows[0],
            club: updatedClubRows[0],
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/api/students/update-badges', async (req, res) => {
    try {
        const [students] = await db.query('SELECT user_id, total_points, badge FROM users WHERE role = ?', ['student']);

        for (const student of students) {
            const currentBadge = student.badge;
            const newBadge = getStudentBadge(student.total_points);

            if (currentBadge !== newBadge) {
                await db.query(
                    'UPDATE users SET badge = ? WHERE user_id = ?',
                    [newBadge, student.user_id]
                );
            }
        }
        res.json({ message: 'All student badges updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/api/clubs/leave', async (req, res) => {
    const { userId, clubId } = req.body;

    if (!userId || !clubId) {
        return res.status(400).json({ message: 'User ID and Club ID are required' });
    }

    try {
        // 1. Check if student is a member
        const [existingMembership] = await db.query(
            'SELECT * FROM club_members WHERE user_id = ? AND club_id = ?',
            [userId, clubId]
        );
        if (existingMembership.length === 0) {
            return res.status(404).json({ message: 'Student is not a member of this club' });
        }

        // 2. Get student's current points BEFORE deduction for club calculation
        const [userRowsBeforeLeave] = await db.query('SELECT total_points FROM users WHERE user_id = ?', [userId]);
        if (userRowsBeforeLeave.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const studentPointsBeforeLeave = userRowsBeforeLeave[0].total_points;

        // 3. Remove student from club_members
        await db.query('DELETE FROM club_members WHERE user_id = ? AND club_id = ?', [userId, clubId]);

        // 4. Update student's points and badge
        const newStudentPoints = Math.max(0, studentPointsBeforeLeave - 10); // Student loses 10 points, minimum 0
        const newStudentBadge = getStudentBadge(newStudentPoints);

        await db.query(
            'UPDATE users SET total_points = ?, badge = ? WHERE user_id = ?',
            [newStudentPoints, newStudentBadge, userId]
        );

        // 5. Recalculate club's total points and badge
        // Get all *remaining* members' points for this club
        const [memberPointsRows] = await db.query(
            'SELECT SUM(u.total_points) AS totalClubPoints FROM club_members cm JOIN users u ON cm.user_id = u.user_id WHERE cm.club_id = ?',
            [clubId]
        );
        const newClubTotalPoints = memberPointsRows[0].totalClubPoints || 0;
        const newClubBadge = getClubBadge(newClubTotalPoints);

        await db.query(
            'UPDATE clubs SET current_members = current_members - 1, total_points = ?, badge = ? WHERE club_id = ?',
            [newClubTotalPoints, newClubBadge, clubId]
        );

        // 6. Fetch updated user and club data to send back
        const [updatedUserRows] = await db.query('SELECT user_id as id, name, email, role, total_points, badge FROM users WHERE user_id = ?', [userId]);
        const [updatedClubRows] = await db.query('SELECT club_id as id, club_name as name, description, current_members, capacity as max_members, total_points, badge as badgeLevel FROM clubs WHERE club_id = ?', [clubId]);

        res.json({
            message: 'Successfully left club',
            user: updatedUserRows[0],
            club: updatedClubRows[0],
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});