export interface UpdatePost {
    id: number;
    title: string;
    date: string;
    category: 'Announcement' | 'New Release' | 'Event' | 'Delay';
    content: string;
    image?: string;
    author: string;
}

export const updatePosts: UpdatePost[] = [
    {
        id: 1,
        title: "Grand Opening of DomPort Online Store!",
        date: "2024-01-01",
        category: "Announcement",
        content: "We are thrilled to announce the official launch of DomPort! Your one-stop shop for all things anime figures and collectibles. To celebrate, we are giving away double points on all first purchases this week!",
        image: "https://via.placeholder.com/600x300/FF5722/FFFFFF?text=Grand+Opening",
        author: "Admin"
    },
    {
        id: 2,
        title: "Wonder Festival 2024 Recap",
        date: "2024-02-15",
        category: "Event",
        content: "The Winter Wonder Festival was a blast! We saw upcoming prototypes for Chainsaw Man and Spy x Family figures. Check out our gallery for exclusive photos from the event floor.",
        author: "Editor_Sarah"
    },
    {
        id: 3,
        title: "Production Delay: EVA Unit-01",
        date: "2024-03-10",
        category: "Delay",
        content: "We regret to inform you that the release of the EVA Unit-01 Awakening statue has been pushed back by 2 months due to manufacturing adjustments to ensure the highest quality. We apologize for the inconvenience.",
        author: "Logistics Team"
    },
    {
        id: 4,
        title: "New Pre-Orders: Hololive Generation 3",
        date: "2024-03-20",
        category: "New Release",
        content: "Pre-orders are now open for the entire Hololive Fantasy generation! secure your favorite vtuber scale figure today. Limited stocks available.",
        image: "https://via.placeholder.com/600x300/4fc3f7/FFFFFF?text=Hololive+Gen3",
        author: "Admin"
    }
];
