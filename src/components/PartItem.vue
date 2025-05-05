<template>
  <div class="card mb-2 ms-4">
    <div class="card-body">
      <h5>{{ part.name }}</h5>
      <p>Цена за 1 шт: {{ calculatedPrice }} | Количество: {{ part.quantity }} | Стоимость: {{ calculatedPrice * part.quantity }}</p>
      
      <button class="btn btn-sm btn-danger me-2" @click="deletePart">Удалить</button>
      <button class="btn btn-sm btn-primary me-2" @click="addChild">Добавить дочернюю деталь</button>
      <b-button class='btn btn-sm' variant="warning" @click="edit">Редактировать</b-button>

      <div v-if="part.children">
        <PartItem 
          v-for="child in part.children" 
          :key="child.id" 
          :part="child" 
					@delete="emit('delete', $event)"
  				@add-child="emit('add-child', $event)"
          @edit="emit('edit', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Part } from '../types/Part'
import PartItem from './PartItem.vue'

const props = defineProps<{
  part: Part;
}>();

const emit = defineEmits<{
  (e: 'delete', id: number): void;
  (e: 'add-child', id: number): void;
  (e: 'edit', part: Part): void;
}>(); 

const calculatePricePerOne = (part: Part): number => {
  if (part.children && part.children.length > 0) {
    return part.children.reduce((sum, child) => {
      return sum + Number(calculatePricePerOne(child));
    }, 0);
  } else {
    return Number(part.price); 
  }
};


const calculatedPrice = computed(() => {
  return calculatePricePerOne(props.part);
});

const deletePart = () => {
  emit('delete', props.part.id);
};

const addChild = () => {
  emit('add-child', props.part.id);
};

const edit = () => {
  emit('edit', props.part);
}
</script>

