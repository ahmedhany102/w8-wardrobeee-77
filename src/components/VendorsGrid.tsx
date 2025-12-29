import { useState } from 'react';
import { useVendors } from '@/hooks/useVendors';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorsGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // بنبعت كلمة البحث للهوك عشان يجيب المتاجر المتفلترة
  const { vendors, loading } = useVendors(searchTerm);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* شريط البحث الخاص بالمتاجر */}
      <div className="flex items-center gap-2 max-w-md mx-auto mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="ابحث عن اسم المتجر..." 
            className="pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>لا يوجد متاجر مطابقة للبحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Link key={vendor.id} to={`/store/${vendor.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group border-primary/10">
                {/* الغلاف */}
                <div className="h-32 bg-gray-100 relative overflow-hidden">
                  {vendor.cover_url ? (
                    <img 
                      src={vendor.cover_url} 
                      alt={vendor.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-orange-100 to-orange-50 flex items-center justify-center">
                      <Store className="w-10 h-10 text-orange-200" />
                    </div>
                  )}
                  {/* اللوجو */}
                  <div className="absolute -bottom-6 right-4">
                    <div className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden">
                      {vendor.logo_url ? (
                        <img src={vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-400">{vendor.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="pt-8 pb-4 px-4 text-right">
                  <h3 className="font-bold text-lg mb-1">{vendor.name}</h3>
                  {vendor.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {vendor.description}
                    </p>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-2 group-hover:border-orange-500 group-hover:text-orange-500">
                    زيارة المتجر
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorsGrid;
