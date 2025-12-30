export interface Item {
    id: number;
    name: string;
    price: string;
    category: string;
    fandom: string;
    image: string;
}

export const mockItems: Item[] = [
    {
        id: 1,
        name: "Demon Slayer: Rengoku Figure",
        price: "฿4,500",
        category: "Figure",
        fandom: "Demon Slayer",
        image: "https://via.placeholder.com/300x300/FF5722/FFFFFF?text=Rengoku"
    },
    {
        id: 2,
        name: "One Piece: Shanks Sword",
        price: "฿12,000",
        category: "Weapon Replica",
        fandom: "One Piece",
        image: "https://via.placeholder.com/300x300/333333/FFFFFF?text=Shanks"
    },
    {
        id: 3,
        name: "Naruto: Hidden Leaf Headband",
        price: "฿850",
        category: "Accessory",
        fandom: "Naruto",
        image: "https://via.placeholder.com/300x300/0a0a0a/FFFFFF?text=Headband"
    },
    {
        id: 4,
        name: "Attack on Titan: Scout Cloak",
        price: "฿1,290",
        category: "Apparel",
        fandom: "Attack on Titan",
        image: "https://via.placeholder.com/300x300/1565C0/FFFFFF?text=Cloak"
    },
    {
        id: 5,
        name: "Genshin Impact: Vision Keychains",
        price: "฿350",
        category: "Keychain",
        fandom: "Genshin Impact",
        image: "https://via.placeholder.com/300x300/9C27B0/FFFFFF?text=Vision"
    },
    {
        id: 6,
        name: "Pokemon: Charizard Plush",
        price: "฿990",
        category: "Plush",
        fandom: "Pokemon",
        image: "https://via.placeholder.com/300x300/FF9800/FFFFFF?text=Charizard"
    }
];