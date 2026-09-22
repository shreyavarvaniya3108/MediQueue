export const DOCTOR_AVATARS = [
    {
        id: "avatar-male-1",
        name: "General Physician Portrait",
        url: "/avatars/doctor-male-1.jpg",
        gender: "male",
    },
    {
        id: "avatar-female-1",
        name: "Wellness & Physician Portrait",
        url: "/avatars/doctor-female-1.jpg",
        gender: "female",
    },
    {
        id: "avatar-specialist",
        name: "Senior Specialist Portrait",
        url: "/avatars/doctor-specialist.jpg",
        gender: "male",
    },
    {
        id: "avatar-pediatrician",
        name: "Pediatrics & Care Portrait",
        url: "/avatars/doctor-pediatrician.jpg",
        gender: "female",
    },
];

/**
 * Returns a doctor avatar URL based on avatar choice, doctor specialization, or ID hash.
 */
export function getDoctorAvatar(doctor) {
    if (doctor?.avatarUrl) {
        return doctor.avatarUrl;
    }

    const spec = (doctor?.specialization || "").toLowerCase();
    
    if (spec.includes("pediatr") || spec.includes("child")) {
        return "/avatars/doctor-pediatrician.jpg";
    }
    if (spec.includes("cardio") || spec.includes("heart") || spec.includes("neuro") || spec.includes("surgeon")) {
        return "/avatars/doctor-specialist.jpg";
    }
    if (spec.includes("gynaec") || spec.includes("derma") || spec.includes("dent")) {
        return "/avatars/doctor-female-1.jpg";
    }

    // Default fallback based on string char code hash
    const str = doctor?._id || doctor?.user?.name || "doctor";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % DOCTOR_AVATARS.length;
    return DOCTOR_AVATARS[index].url;
}

/**
 * Deterministic rating generator for display (e.g. 4.8 - 4.9 stars)
 */
export function getDoctorRating(doctor) {
    const str = doctor?._id || doctor?.user?.name || "doc";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const ratings = ["4.9", "4.8", "5.0", "4.7", "4.9"];
    const reviews = ["128", "94", "210", "86", "154"];
    const idx = Math.abs(hash) % ratings.length;
    return {
        rating: ratings[idx],
        reviewsCount: reviews[idx],
        experience: `${(Math.abs(hash) % 15) + 5}+ Yrs Exp`,
    };
}
