
import { useProductFetching } from './useProductFetching';
import { useProductOperations } from './useProductOperations';

export const useSupabaseProducts = () => {
  const { products, loading, refetch } = useProductFetching();
  const { addProduct, updateProduct, deleteProduct } = useProductOperations();

  const handleAddProduct = async (productData: any) => {
    const result = await addProduct(productData);
    if (result) {
      await refetch();
    }
    return result;
  };

  const handleUpdateProduct = async (id: string, updates: any) => {
    const result = await updateProduct(id, updates);
    if (result) {
      await refetch();
    }
    return result;
  };

  const handleDeleteProduct = async (id: string) => {
    const result = await deleteProduct(id);
    if (result) {
      await refetch();
    }
    return result;
  };

  return { 
    products, 
    loading, 
    addProduct: handleAddProduct, 
    updateProduct: handleUpdateProduct, 
    deleteProduct: handleDeleteProduct, 
    refetch 
  };
};
