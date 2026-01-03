import { useAuth } from '../contexts/AuthContext';

export const usePoints = () => {
    const { user, updateUser } = useAuth();

    // Condition 2: Separation of Data (Points depend on the logged-in user)
    // Condition 3: Reset on Recreate (If a user is new/re-created, they start with 0 or defined default)
    const points = user?.points || 0;

    const addPoints = (amount: number) => {
        // Condition 1: Login Persistence (Updates the central user object which AuthContext persists)
        if (user) {
            updateUser({ ...user, points: (user.points || 0) + amount });
        }
    };

    const spendPoints = (amount: number) => {
        if (user && (user.points || 0) >= amount) {
            updateUser({ ...user, points: (user.points || 0) - amount });
        }
    };

    const canUsePoints = (amount: number) => {
        return (user?.points || 0) >= amount;
    };

    const calculatePointsFromAmount = (amount: number) => {
        return Math.floor(amount / 100); // 1 point per 100 baht
    };

    return { 
        points, 
        addPoints, 
        spendPoints, 
        canUsePoints,
        calculatePointsFromAmount 
    };
};

