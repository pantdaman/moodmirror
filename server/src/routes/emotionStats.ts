import express from 'express';
import { EmotionType } from '../types';
import { EmotionStats } from '../models/EmotionStats';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Save emotion statistics
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { emotion, userId } = req.body;
    
    const emotionStat = new EmotionStats({
      emotion: emotion as EmotionType,
      userId,
      timestamp: new Date()
    });

    await emotionStat.save();
    res.status(201).json(emotionStat);
  } catch (error) {
    console.error('Error saving emotion stats:', error);
    res.status(500).json({ message: 'Error saving emotion statistics' });
  }
});

// Get time-based statistics for a user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    // Get statistics for different time periods
    const [lastHour, lastDay, lastWeek, total] = await Promise.all([
      EmotionStats.find({
        userId,
        timestamp: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }
      }),
      EmotionStats.find({
        userId,
        timestamp: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      }),
      EmotionStats.find({
        userId,
        timestamp: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      }),
      EmotionStats.find({ userId })
    ]);

    // Calculate emotion counts for each time period
    const calculateCounts = (stats: any[]) => {
      const counts: Record<EmotionType, number> = {} as Record<EmotionType, number>;
      ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'].forEach(emotion => {
        counts[emotion as EmotionType] = 0;
      });
      stats.forEach(stat => {
        counts[stat.emotion] = (counts[stat.emotion] || 0) + 1;
      });
      return counts;
    };

    const timeBasedStats = {
      lastHour: calculateCounts(lastHour),
      lastDay: calculateCounts(lastDay),
      lastWeek: calculateCounts(lastWeek),
      total: calculateCounts(total)
    };

    res.json(timeBasedStats);
  } catch (error) {
    console.error('Error getting emotion stats:', error);
    res.status(500).json({ message: 'Error retrieving emotion statistics' });
  }
});

// Get aggregated statistics (all users)
router.get('/aggregated', authenticateToken, async (req, res) => {
  try {
    const now = new Date();

    // Get aggregated statistics for different time periods
    const [lastHour, lastDay, lastWeek, total] = await Promise.all([
      EmotionStats.aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$emotion',
            count: { $sum: 1 }
          }
        }
      ]),
      EmotionStats.aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$emotion',
            count: { $sum: 1 }
          }
        }
      ]),
      EmotionStats.aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$emotion',
            count: { $sum: 1 }
          }
        }
      ]),
      EmotionStats.aggregate([
        {
          $group: {
            _id: '$emotion',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format the aggregated data
    const formatAggregatedData = (data: any[]) => {
      const counts: Record<EmotionType, number> = {} as Record<EmotionType, number>;
      ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'].forEach(emotion => {
        counts[emotion as EmotionType] = 0;
      });
      data.forEach(item => {
        counts[item._id] = item.count;
      });
      return counts;
    };

    const timeBasedStats = {
      lastHour: formatAggregatedData(lastHour),
      lastDay: formatAggregatedData(lastDay),
      lastWeek: formatAggregatedData(lastWeek),
      total: formatAggregatedData(total)
    };

    res.json(timeBasedStats);
  } catch (error) {
    console.error('Error getting aggregated emotion stats:', error);
    res.status(500).json({ message: 'Error retrieving aggregated emotion statistics' });
  }
});

export default router; 