const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
    try {
        const { studentId, password, name, grade, classNumber } = req.body;
        
        // 이미 존재하는 학번인지 확인
        const existingUser = await User.findOne({ studentId });
        if (existingUser) {
            return res.status(400).json({ message: '이미 등록된 학번입니다.' });
        }
        
        const user = new User({
            studentId,
            password,
            name,
            grade,
            classNumber
        });
        
        await user.save();
        res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { studentId, password } = req.body;
        
        const user = await User.findOne({ studentId });
        if (!user) {
            return res.status(401).json({ message: '학번 또는 비밀번호가 잘못되었습니다.' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: '학번 또는 비밀번호가 잘못되었습니다.' });
        }
        
        const token = jwt.sign(
            { userId: user._id, studentId: user.studentId, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );
        
        res.json({
            message: '로그인 성공',
            token,
            user: {
                id: user._id,
                studentId: user.studentId,
                name: user.name,
                grade: user.grade,
                classNumber: user.classNumber,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
});

module.exports = router;