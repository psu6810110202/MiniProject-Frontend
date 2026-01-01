export interface RegularProduct {
    id: number;
    name: string;
    price: number;
    category: string;
    fandom: string;
    image: string;
    description: string;
    stock: number;
}

export const regularProducts: RegularProduct[] = [
    {
        id: 101,
        name: "DomPort Original: Classic Series",
        price: 2590,
        category: "Vinyl Figures",
        fandom: "DomPort Original",
        image: "https://via.placeholder.com/400x500/FF5722/FFFFFF?text=DomPort+Classic",
        description: "Premium quality vinyl figure from DomPort's classic collection. Features detailed craftsmanship and official certification.",
        stock: 50
    },
    {
        id: 102,
        name: "Anime Heroes: Action Figure Set",
        price: 3200,
        category: "Action Figures",
        fandom: "Various Anime",
        image: "https://via.placeholder.com/400x500/4CAF50/FFFFFF?text=Action+Set",
        description: "Set of 3 highly detailed action figures from popular anime series. Perfect for collectors.",
        stock: 35
    },
    {
        id: 103,
        name: "Gundam: Master Grade Model",
        price: 4500,
        category: "Model Kits",
        fandom: "Gundam",
        image: "https://via.placeholder.com/400x500/2196F3/FFFFFF?text=Gundam+MG",
        description: "High-grade model kit with detailed parts and accessories. Requires assembly but worth the effort.",
        stock: 25
    },
    {
        id: 104,
        name: "Studio Ghibli: Collectible Set",
        price: 1890,
        category: "Collectibles",
        fandom: "Studio Ghibli",
        image: "https://via.placeholder.com/400x500/9C27B0/FFFFFF?text=Ghibli+Set",
        description: "Charming collectible set featuring beloved characters from Studio Ghibli films. Limited edition.",
        stock: 60
    }
];
