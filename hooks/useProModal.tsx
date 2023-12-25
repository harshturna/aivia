import { create } from "zustand";

interface userProModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const userProModal = create<userProModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
