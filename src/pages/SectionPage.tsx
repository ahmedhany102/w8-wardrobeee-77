import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { useSectionProducts } from '@/hooks/useSections';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { supabase } from '@/integrations/supabase/client';
import { Section } from '@/types/section';

const SectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [section, setSection] = React.useState<Section | null>(null);
  const [sectionLoading, setSectionLoading] = React.useState(true);
  
  // Fetch section details
  React.useEffect(() => {
    const fetchSection = async () => {
      if (!id) {
        setSectionLoading(false);
        return;
      }
      
      try {
        // Try to find by slug first, then by id
        const { data, error } = await supabase
          .from('sections')
          .select('*')
          .or(`slug.eq.${id},id.eq.${id}`)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching section:', error);
          setSection(null);
        } else {
          setSection(data as unknown as Section);
        }
      } catch (err) {
        console.error('Exception fetching section:', err);
        setSection(null);
      } finally {
        setSectionLoading(false);
      }
    };

    fetchSection();
  }, [id]);

  const { products, loading: productsLoading } = useSectionProducts(section?.id || '', 100);
  const loading = sectionLoading || productsLoading;

  if (!sectionLoading && !section) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">القسم غير موجود</h2>
          <p className="text-muted-foreground mb-6">لم يتم العثور على القسم المطلوب</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للرئيسية
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-0 h-auto font-normal text-primary hover:text-primary/80"
              >
                الرئيسية
              </Button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{section?.title || 'القسم'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{section?.title || 'القسم'}</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {products.length} منتج
            </p>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">لا توجد منتجات</h2>
            <p className="text-muted-foreground mb-6">
              هذا القسم فارغ حالياً
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للرئيسية
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  discount: product.discount,
                  main_image: product.image_url,
                  image_url: product.image_url,
                  rating: product.rating,
                  stock: (product as any).stock,
                  inventory: (product as any).inventory,
                  vendor_name: product.vendor_name,
                  vendor_slug: product.vendor_slug,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SectionPage;