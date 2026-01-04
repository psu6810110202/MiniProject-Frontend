export interface PreOrderItem {
    id: number;
    name: string;
    price: number;
    deposit: number;
    releaseDate: string;
    image: string;
    description: string;
    fandom: string;
    category: string;
}

export const preorderItems: PreOrderItem[] = [
    {
        id: 1,
        name: "Hatsune Miku: 16th Birthday Ver.",
        price: 8500,
        deposit: 1000,
        releaseDate: "2024-08-31",
        image: "http://localhost:3000/images/covers/Project_sekai.webp",
        description: "Scale figure celebrating Miku's 16th birthday with a vibrant design.",
        fandom: "Project sekai",
        category: "Figure"
    },
    {
        id: 2,
        name: "Genshin Impact: Raiden Shogun Statue",
        price: 14500,
        deposit: 2500,
        releaseDate: "2024-12-15",
        image: "http://localhost:3000/images/covers/Genshin.webp",
        description: "Premium statue of the Electro Archon, featuring LED effects.",
        fandom: "Genshin impact",
        category: "Figure"
    },
    {
        id: 3,
        name: "Hazbin Hotel: Alastor Radio Demon Figure",
        price: 5200,
        deposit: 500,
        releaseDate: "2024-09-20",
        image: "http://localhost:3000/images/covers/Hazbin Hotal.jpg",
        description: "Highly detailed figure of Alastor with his microphone staff.",
        fandom: "Hazbin hotel",
        category: "Figure"
    },
    {
        id: 4,
        name: "Identity V: Truce Limited Box",
        price: 28000,
        deposit: 5000,
        releaseDate: "2025-01-10",
        image: "http://localhost:3000/images/covers/Identity V.webp",
        description: "Massive collector's box containing exclusive skins and props.",
        fandom: "Identity V",
        category: "Other"
    }
];
