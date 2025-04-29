<template>
  <div class="container mt-4">
    <h1>Car Parts</h1>
		<div class="d-flex gap-2 mb-3">
  		<b-button variant="success" @click="exportToExcel">
    		Выгрузить в Excel
  		</b-button>
  		<b-button variant="danger" @click="exportToPDF">
    		Выгрузить в PDF
  		</b-button>
		</div>
    <PartItem 
      v-for="part in parts" 
      :key="part.id" 
      :part="part"
      @delete="handleDelete"
      @add-child="handleAddChild"
    />

    <b-modal v-model="showModal" title="Добавить новую деталь" hide-footer>
      <b-form @submit.prevent="saveNewPart">
        <b-form-group label="Название детали:" label-for="part-name">
          <b-form-input id="part-name" v-model="newPartName" required />
        </b-form-group>

        <b-form-group label="Цена за единицу:" label-for="part-price">
          <b-form-input id="part-price" v-model="newPartPrice" type="number" required />
        </b-form-group>

        <b-form-group label="Количество:" label-for="part-quantity">
          <b-form-input id="part-quantity" v-model="newPartQuantity" type="number" required />
        </b-form-group>

        <div class="mt-3 d-flex justify-content-end">
          <b-button variant="secondary" class="me-2" @click="showModal = false">Отмена</b-button>
          <b-button variant="primary" type="submit">Сохранить</b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import * as FileSaver from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import type { Part } from '../types/Part'
import PartItem from './PartItem.vue'
import { usePartsStore } from '../stores/partsStore';
import { storeToRefs } from 'pinia';

const partsStore = usePartsStore();
const { parts } = storeToRefs(partsStore);
const showModal = ref(false);
const newPartName = ref('');
const newPartPrice = ref<number>(0);
const newPartQuantity = ref<number>(1);
const currentParentId = ref<number | null>(null);

const exportToExcel = () => {
  const data = flattenParts(parts.value);

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Parts');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  FileSaver.saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'car_parts.xlsx');
};

const exportToPDF = () => {
  const data = flattenParts(parts.value);

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('Car parts', 14, 20);

  const tableData = data.map(row => [
    row['Деталь'],
    row['Цена за 1 шт'],
    row['Количество'],
    row['Стоимость'],
    row['Уровень вложенности']
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['Part', 'Price per 1', 'Quantity', 'Total Cost', 'Depth']],
    body: tableData
  });

  doc.save('car_parts.pdf');
};

const flattenParts = (partsList: Part[], level: number = 0, parentName = ''): any[] => {
  const rows: any[] = [];

  for (const part of partsList) {
    const partName = parentName ? `${parentName} > ${part.name}` : part.name;
    const pricePerOne = calculatePricePerOne(part);
    const totalPrice = pricePerOne * part.quantity;

    rows.push({
      'Деталь': partName,
      'Цена за 1 шт': pricePerOne,
      'Количество': part.quantity,
      'Стоимость': totalPrice,
      'Уровень вложенности': level
    });

    if (part.children && part.children.length > 0) {
      rows.push(...flattenParts(part.children, level + 1, partName));
    }
  }

  return rows;
};


const calculatePricePerOne = (part: Part): number => {
  if (part.children && part.children.length > 0) {
    return part.children.reduce((sum, child) => {
      return sum + calculatePricePerOne(child);
    }, 0);
  } else {
    return Number(part.price);
  }
};

const handleAddChild = (parentId: number) => {
  currentParentId.value = parentId;
  newPartName.value = '';
  newPartPrice.value = 0;
  newPartQuantity.value = 1;
  showModal.value = true;
};

const saveNewPart = () => {
  if (!currentParentId.value) return;

  const newPart: Part = {
  	id: Date.now(),
  	name: newPartName.value || 'Без имени',
  	price: Number(newPartPrice.value), 
  	quantity: Number(newPartQuantity.value),
  	children: []
	};

  const addRecursive = (partsList: Part[]) => {
    for (const part of partsList) {
      if (part.id === currentParentId.value) {
        if (!part.children) {
          part.children = [];
        }
        part.children.push(newPart);
        return true;
      }
      if (part.children && addRecursive(part.children)) {
        return true;
      }
    }
    return false;
  };

  addRecursive(parts.value);
  showModal.value = false;
};


const handleDelete = (id: number) => {
  const deleteRecursive = (partsList: Part[]) => {
    const index = partsList.findIndex(p => p.id === id);
    if (index !== -1) {
      partsList.splice(index, 1);
      return true;
    }
    for (const part of partsList) {
      if (part.children && deleteRecursive(part.children)) {
        return true;
      }
    }
    return false;
  };

  deleteRecursive(parts.value);
};
</script>


