export interface PetProfile {
  name: string;
  age?: number;
  weight?: number;
  breed?: string;
  photos: string[];
}

export const DEFAULT_PET_PROFILE: PetProfile = {
  name: "콩이",
  age: 3,
  weight: 5.2,
  breed: "골든 리트리버",
  photos: [
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80",
  ],
};

const PET_PROFILE_STORAGE_KEY = "petProfile";

export function getPetProfile(): PetProfile {
  if (typeof window === "undefined") return DEFAULT_PET_PROFILE;
  
  try {
    const stored = localStorage.getItem(PET_PROFILE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading pet profile:", error);
  }
  
  // Save default profile on first load
  savePetProfile(DEFAULT_PET_PROFILE);
  return DEFAULT_PET_PROFILE;
}

export function savePetProfile(profile: PetProfile): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(PET_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving pet profile:", error);
  }
}




