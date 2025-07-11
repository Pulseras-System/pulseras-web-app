// src/stores/cartStore.ts
import { create } from 'zustand';

interface CartStore {
  quantity: number;
  setQuantity: (q: number) => void;
  increase: (by?: number) => void;
  decrease: (by?: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  quantity: parseInt(localStorage.getItem('amount') || '0'),
  setQuantity: (q) => {
    localStorage.setItem('amount', q.toString());
    set({ quantity: q });
  },
  increase: (by = 1) =>
    set((state) => {
      const newQ = state.quantity + by;
      localStorage.setItem('amount', newQ.toString());
      return { quantity: newQ };
    }),
  decrease: (by = 1) =>
    set((state) => {
      const newQ = Math.max(0, state.quantity - by);
      localStorage.setItem('amount', newQ.toString());
      return { quantity: newQ };
    }),
}));
