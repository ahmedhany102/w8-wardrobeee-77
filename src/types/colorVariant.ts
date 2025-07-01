
export interface ColorVariantOption {
  id?: string;
  size: string;
  price: number;
  stock: number;
}

export interface ColorVariant {
  id?: string;
  color: string;
  image: string | null;
  options: ColorVariantOption[];
}
