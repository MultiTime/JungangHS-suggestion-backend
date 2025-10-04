const express = require('express');
const Suggestion = require('../models/Suggestion');
const auth = require('../middleware/auth');
const router = express.Router();

// 모든 건의글 조회 (공개용)
router.get('/', async (req, res) => {
    try {
        const { status, category, page = 1, limit = 10 } = req.query;
        
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        
        const suggestions = await Suggestion.find(filter)
            .populate('author', 'name grade classNumber')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Suggestion.countDocuments(filter);
        
        res.json({
            suggestions,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
});

// 건의글 작성
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, category, isAnonymous } = req.body;
        
        const suggestion = new Suggestion({
            title,
            content,
            category,
            author: isAnonymous ? null : req.user.userId,
            isAnonymous
        });
        
        await suggestion.save();
        
        res.status(201).json({
            message: '건의가 성공적으로 제출되었습니다.',
            suggestion
        });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
});

// 특정 건의글 조회
router.get('/:id', async (req, res) => {
    try {
        const suggestion = await Suggestion.findById(req.params.id)
            .populate('author', 'name grade classNumber')
            .populate('response.responder', 'name role');
            
        if (!suggestion) {
            return res.status(404).json({ message: '건의글을 찾을 수 없습니다.' });
        }
        
        res.json(suggestion);
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
});

// 건의글에 답변 작성 (관리자만)
router.put('/:id/response', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '관리자만 답변할 수 있습니다.' });
        }
        
        const { content } = req.body;
        
        const suggestion = await Suggestion.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    'response.content': content,
                    'response.responder': req.user.userId,
                    'response.respondedAt': new Date(),
                    'status': 'completed',
                    'updatedAt': new Date()
                }
            },
            { new: true }
        ).populate('author', 'name grade classNumber')
         .populate('response.responder', 'name role');
        
        if (!suggestion) {
            return res.status(404).json({ message: '건의글을 찾을 수 없습니다.' });
        }
        
        res.json({
            message: '답변이 성공적으로 등록되었습니다.',
            suggestion
        });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
});

module.exports = router;