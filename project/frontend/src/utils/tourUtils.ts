export const translateDuration = (duration?: string) => {
    if (!duration) return "";
    return duration
        .replace(/Days?/gi, "วัน")
        .replace(/Nights?/gi, "คืน");
};

export const translateLocation = (location?: string) => {
    if (!location || location === "Thailand") return "ประเทศไทย";

    const regionMap: Record<string, string> = {
        "North": "ภาคเหนือ",
        "Central": "ภาคกลาง",
        "Northeast": "ภาคอีสาน",
        "West": "ภาคตะวันตก",
        "East": "ภาคตะวันออก",
        "South": "ภาคใต้",
    };

    return regionMap[location] || location;
};

export const getImageUrl = (path?: string) => {
    if (!path) return "https://via.placeholder.com/400x300?text=No+Img";
    if (path.startsWith("http")) return path;
    return `http://localhost:3000/${path.replace(/^\//, '')}`;
};
