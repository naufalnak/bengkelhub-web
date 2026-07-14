import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveWorkshopState {
  activeWorkshopId: string | null;
  setActiveWorkshopId: (id: string | null) => void;
}

// Dipisah dari store/auth.ts karena ini cuma preferensi UI (workshop mana yang
// sedang dikelola operator di halaman Customer/Vehicle/Service/Invoice/Laporan),
// bukan bagian dari identitas/sesi auth.
export const useActiveWorkshopStore = create<ActiveWorkshopState>()(
  persist(
    (set) => ({
      activeWorkshopId: null,
      setActiveWorkshopId: (id) => set({ activeWorkshopId: id }),
    }),
    {
      name: "bengkelhub-active-workshop",
    },
  ),
);
