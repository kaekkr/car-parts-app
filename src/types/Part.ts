export interface Part {
  id: number;
  name: string;
  price: number;
  quantity: number;
  children?: Part[];
}
