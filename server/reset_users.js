const mongoose = require('mongoose');
const User = require('./models/User');
const LoginHistory = require('./models/LoginHistory');

async function resetFailedAttempts() {
  const MONGO_URI = 'mongodb://127.0.0.1:27017/traveloop';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Local MongoDB');

  const resUser = await User.updateMany({}, { failedLoginAttempts: 0, pendingAuth: null });
  console.log('✅ Reset failedLoginAttempts to 0 for all users:', resUser.modifiedCount);

  const resHistory = await LoginHistory.deleteMany({ status: { $in: ["FAILED_PASSWORD", "FAILED_EMAIL"] } });
  console.log('✅ Cleared failed login history logs:', resHistory.deletedCount);

  await mongoose.disconnect();
}

resetFailedAttempts();
