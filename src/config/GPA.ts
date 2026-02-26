interface GPAConfig {
    value: number,
    lable: string
}

export const GPA_WARNING_THRESHOLD = 6.5;
export const MAX_GPA = 10.0;
export const TOTAL_CREDITS = 140;

export const GPA_CONFIG: GPAConfig[] = [
    { value: 9.0, lable: 'Xuất sắc' },
    { value: 8.0, lable: 'Giỏi' },
    { value: 7.0, lable: 'Khá' },
    { value: 6.5, lable: 'Trung bình khá' },
    { value: 5.0, lable: 'Trung bình' },
    { value: 4.0, lable: 'Yếu' },
]

