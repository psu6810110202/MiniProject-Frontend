export interface PreOrderItem {
    id: number;
    name: string;
    price: number;
    deposit: number;
    releaseDate: string;
    image: string;
    description: string;
}

export const preorderItems: PreOrderItem[] = [
    {
        id: 1,
        name: "Hatsune Miku: 16th Birthday Ver.",
        price: 8500,
        deposit: 1000,
        releaseDate: "2024-08-31",
        image: "https://via.placeholder.com/400x500/39c5bb/FFFFFF?text=Miku+16th",
        description: "Scale figure celebrating Miku's 16th birthday with a vibrant design."
    },
    {
        id: 2,
        name: "Gojo Satoru: Hollow Purple FX",
        price: 14500,
        deposit: 2500,
        releaseDate: "2024-12-15",
        image: "https://via.placeholder.com/400x500/512da8/FFFFFF?text=Gojo+HP",
        description: "Premium statue capturing the moment of Hollow Purple with LED effects."
    },
    {
        id: 3,
        name: "Frieren: Beyond Journey's End",
        price: 5200,
        deposit: 500,
        releaseDate: "2024-09-20",
        image: "https://via.placeholder.com/400x500/eeeeee/333333?text=Frieren",
        description: "Highly detailed figure of Frieren holding her staff."
    },
    {
        id: 4,
        name: "EVA: Unit-01 Awakening",
        price: 28000,
        deposit: 5000,
        releaseDate: "2025-01-10",
        image: "https://via.placeholder.com/400x500/673ab7/FFFFFF?text=EVA-01",
        description: "Massive scale model with interchangeable parts and battle damage."
    }
];
