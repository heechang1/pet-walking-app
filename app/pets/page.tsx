"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { getPets, deletePet } from "@/lib/api/pets";
import { Database } from "@/types/database.types";

type Pet = Database['public']['Tables']['pets']['Row'];

export default function PetsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPets();
    }
  }, [user]);

  const loadPets = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getPets(user.id);
      setPets(data);
    } catch (error) {
      console.error("Error loading pets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deletePet(id);
      await loadPets();
    } catch (error) {
      console.error("Error deleting pet:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleSelectPet = (id: string) => {
    localStorage.setItem("selectedPetId", id);
    router.push("/start");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FFFDF8] px-6 py-10">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">반려동물 목록</h1>
            <Link
              href="/pets/new"
              className="bg-[#A8DED0] text-gray-900 font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-[#A8DED0]/90 transition"
            >
              + 반려동물 추가
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8DED0] mx-auto mb-4"></div>
              <p className="text-gray-600">로딩 중...</p>
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-[#A8DED0]/60">
              <p className="text-gray-600 mb-4">등록된 반려동물이 없습니다.</p>
              <Link
                href="/pets/new"
                className="inline-block bg-[#A8DED0] text-gray-900 font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-[#A8DED0]/90 transition"
              >
                반려동물 추가하기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-white rounded-xl shadow-md border border-[#A8DED0]/60 p-6 hover:shadow-lg transition"
                >
                  {pet.photos && pet.photos.length > 0 && (
                    <img
                      src={pet.photos[0]}
                      alt={pet.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{pet.name}</h2>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {pet.breed && <p>품종: {pet.breed}</p>}
                    {pet.age !== null && <p>나이: {pet.age}세</p>}
                    {pet.weight !== null && <p>몸무게: {pet.weight}kg</p>}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSelectPet(pet.id)}
                      className="flex-1 bg-[#A8DED0] text-gray-900 font-semibold py-2 rounded-lg hover:bg-[#A8DED0]/90 transition"
                    >
                      선택
                    </button>
                    <button
                      onClick={() => handleDelete(pet.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}



