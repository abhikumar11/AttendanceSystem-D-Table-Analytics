const express=require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db.js');
const logger = require('./config/logger.js');
const authRoutes = require('./routes/authRoutes.js');
const attendanceRoutes = require('./routes/attendanceRoutes.js');
const overtimeRoutes = require('./routes/overtimeRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' })); 
app.use(morgan('combined'));

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/overtime', overtimeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);


app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
