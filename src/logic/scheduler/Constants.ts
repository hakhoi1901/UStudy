// Constants.js

export const CONFIG = {
    POPULATION_SIZE: 1000,
    GENERATIONS: 1000,
    MUTATION_RATE: 0.1,
    TOURNAMENT_SIZE: 5,
};

export const WEIGHTS = {
    BASE: 100000.0,
    
    // Hard Constraints
    PENALTY_HARD: 99999.0,         // Trùng lịch 

    // Soft Constraints - Days Off
    PENALTY_DAY_OFF: 80000.0,       // Vi phạm ngày nghỉ

    // Soft Constraints - Session (Buổi học)
    BONUS_SESSION: 50.0,          // Đúng buổi ưu tiên 
    PENALTY_WRONG_SESSION: 100.0,  // Trái buổi 

    // Soft Constraints - Strategy (Chiến thuật)
    BONUS_COMPRESS: 1000.0,        // Thưởng mỗi ngày trống (Compress strategy)
    PENALTY_SPREAD: 200.0,        // Phạt ngày học quá nặng (Spread strategy) 

    // Soft Constraints - Gaps
    PENALTY_GAP: 50.0             // Phạt trống tiết
};