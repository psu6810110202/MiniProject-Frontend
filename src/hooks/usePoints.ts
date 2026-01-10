import { useAuth } from '../contexts/AuthContext';

export const usePoints = () => {
    const { user, updateUser } = useAuth();

    // ถ้ายังไม่ล็อคอินแต้มจะเท่ากับ 0
    // ถ้าล็อคอินแต้มจะเท่ากับแต้มที่มีอยู่
    // || 0 ไว้กันถ้า user?.points เป็น undefined
    const points = user?.points || 0;

    const addPoints = (amount: number) => {
        // ถ้ามี user ให้เพิ่มแต้ม
        // ...user คือ การสำเนาข้อมูล user ที่มีอยู่
        if (user) {
            updateUser({ ...user, points: (user.points || 0) + amount });
        }
    };

    const deductPoints = (amount: number) => {
        if (user) {
            const currentPoints = user.points || 0;
            const newPoints = Math.max(0, currentPoints - amount); // Ensure points don't go negative
            updateUser({ ...user, points: newPoints });
        }
    };

    const calculatePointsFromAmount = (amount: number) => {
        return Math.floor(amount / 100); // 1 point per 100 baht
    };

    return {
        points,
        addPoints,
        deductPoints,
        calculatePointsFromAmount
    };
};

