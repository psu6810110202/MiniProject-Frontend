import { useState, useEffect } from 'react';

const POINTS_KEY = 'user_points';

export const usePoints = () => {
    const [points, setPoints] = useState<number>(0);

    useEffect(() => {
        // Load points from local storage on mount
        const savedPoints = localStorage.getItem(POINTS_KEY);
        if (savedPoints) {
            setPoints(parseInt(savedPoints, 10));
        }
    }, []);

    const addPoints = (amount: number) => {
        setPoints((prev) => {
            const newPoints = prev + amount;
            localStorage.setItem(POINTS_KEY, newPoints.toString());
            return newPoints;
        });
    };

    const spendPoints = (amount: number) => {
        setPoints((prev) => {
            if (prev >= amount) {
                const newPoints = prev - amount;
                localStorage.setItem(POINTS_KEY, newPoints.toString());
                return newPoints;
            }
            return prev; // Not enough points
        });
    };

    return { points, addPoints, spendPoints };
};
