// server.js - 김천중앙고등학교 건의함 백엔드 서버
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kimcheon-suggestion', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));

// 라우트 설정
const authRoutes = require('./routes/auth');
const suggestionRoutes = require('./routes/suggestions');

app.use('/api/auth', authRoutes);
app.use('/api/suggestions', suggestionRoutes);

// 기본 라우트
app.get('/', (req, res) => {
    res.json({ 
        message: '김천중앙고등학교 건의함 API 서버',
        endpoints: {
            auth: '/api/auth',
            suggestions: '/api/suggestions'
        }
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT}`);
});