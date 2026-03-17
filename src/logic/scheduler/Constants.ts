// Constants.js

/**
* Interface cho CONFIG
*/
interface CONFIG {
    /**
     * Kích thước quần thể
     */
    POPULATION_SIZE: number;
    /**
     * Số thế hệ
     */
    GENERATIONS: number;
    /**
     * Tỷ lệ đột biến
     */
    MUTATION_RATE: number;
    /**
     * Kích thước giải đấu
     */
    TOURNAMENT_SIZE: number;
}

/**
 * Interface cho WEIGHTS
 */
interface WEIGHTS {
    /**
     * Trọng số cơ bản
     */
    BASE: number;
    /**
     * Trọng số vi phạm cứng
     */
    PENALTY_HARD: number;
    /**
     * Trọng số chiến thuật
     */
    BONUS_COMPRESS: number;
    /**
     * Trọng số chiến thuật sai
     */
    PENALTY_SPREAD: number;
    /**
     * Trọng số trống tiết
     */
    PENALTY_GAP: number;
    /**
     * Trọng số hạn chế buổi học
     */
    PENALTY_RESTRICTED: number;
    /**
     * Trọng số tuyệt đối không học
     */
    PENALTY_ABSOLUTE_NO: number;
}
/**
 * Cấu hình
 */
export const CONFIG: CONFIG = {
    /**
     * Kích thước quần thể
     */
    POPULATION_SIZE: 1000,
    /**
     * Số thế hệ
     */
    GENERATIONS: 1000,
    /**
     * Tỷ lệ đột biến
     */
    MUTATION_RATE: 0.1,
    /**
     * Kích thước giải đấu
     */
    TOURNAMENT_SIZE: 5,
};

/**
 * Trọng số
 */
export const WEIGHTS: WEIGHTS = {
    /**
     * Trọng số cơ bản
     */
    BASE: 100000.0,
    /**
     * Trọng số vi phạm cứng
     */
    PENALTY_HARD: 99999.0,         // Trùng lịch 
    /**
     * Trọng số chiến thuật
     */
    BONUS_COMPRESS: 1000.0,        // Thưởng mỗi ngày trống (Compress strategy)
    /**
     * Trọng số chiến thuật sai
     */
    PENALTY_SPREAD: 200.0,        // Phạt ngày học quá nặng (Spread strategy) 
    /**
     * Trọng số trống tiết
     */
    PENALTY_GAP: 50.0,             // Phạt trống tiết
    /**
     * Trọng số hạn chế buổi học (Vàng)
     */
    PENALTY_RESTRICTED: 500.0,
    /**
     * Trọng số tuyệt đối không học (Đỏ)
     */
    PENALTY_ABSOLUTE_NO: 10000.0
};