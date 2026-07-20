// 환경변수 로드 및 상수
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

module.exports = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || '',
  IP_SALT: process.env.IP_SALT || 'default-salt',
  DB_PATH: require('path').join(__dirname, '..', 'data', 'wedding.db'),
  // 입력 길이 제한
  LIMITS: {
    name: 20,
    message: 500,
    phone: 20,
    meal: 20,
    guestCountMax: 20,
  },
};
