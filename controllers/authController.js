const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'secret';

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashed]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userRes = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userRes.rows.length === 0) return res.status(400).json({ msg: 'User not found' });

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Password incorrect' });

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
