import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CodeParam } from "@/services/common.service";

interface CustomerFilterState {
  selectedState: string;
  selectedZone: string;
  selectedArea: string;
  searchTerm: string;
  zones: CodeParam[];
  areas: CodeParam[];
  setSelectedState: (state: string) => void;
  setSelectedZone: (zone: string) => void;
  setSelectedArea: (area: string) => void;
  setSearchTerm: (term: string) => void;
  setZones: (zones: CodeParam[]) => void;
  setAreas: (areas: CodeParam[]) => void;
  resetFilters: () => void;
}

export const useCustomerFilterStore = create<CustomerFilterState>()(
  persist(
    (set) => ({
      selectedState: "",
      selectedZone: "",
      selectedArea: "",
      searchTerm: "",
      zones: [],
      areas: [],
      setSelectedState: (selectedState) =>
        set({
          selectedState,
          selectedZone: "",
          selectedArea: "",
          zones: [],
          areas: [],
        }),
      setSelectedZone: (selectedZone) =>
        set({ selectedZone, selectedArea: "", areas: [] }),
      setSelectedArea: (selectedArea) => set({ selectedArea }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setZones: (zones) => set({ zones }),
      setAreas: (areas) => set({ areas }),
      resetFilters: () =>
        set({
          selectedState: "",
          selectedZone: "",
          selectedArea: "",
          searchTerm: "",
          zones: [],
          areas: [],
        }),
    }),
    {
      name: "customer-filters",
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage to reset on tab close but remember on navigation
    },
  ),
);
