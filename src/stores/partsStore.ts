import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Part } from '../types/Part'

export const usePartsStore = defineStore('parts', () => {
  const parts = ref<Part[]>([
    {
      id: 1,
      name: 'Body',
      price: 0,
      quantity: 1,
      children: [
        {
          id: 11,
          name: 'Door',
          price: 0,
          quantity: 3,
          children: [
            { id: 111, name: 'Lock', price: 5000, quantity: 4 },
            { id: 112, name: 'Handle', price: 6000, quantity: 6 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Engine',
      price: 0,
      quantity: 1,
      children: [
        { id: 21, name: 'Piston', price: 10000, quantity: 5 },
        { id: 22, name: 'Ring', price: 2000, quantity: 3 }
      ]
    }
  ]);

  const setParts = (newParts: Part[]) => {
    parts.value = newParts;
  };

  return { parts, setParts };
});
