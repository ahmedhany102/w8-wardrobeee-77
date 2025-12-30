import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// 1. حافظت على الانترفيس القديم وزودت عليه الحقول الجديدة عشان التوافق
export interface VendorProfile {
  id: string;
  store_name: string;      // الاسم اللي الواجهة متعودة عليه
  name: string;            // الاسم في الجدول الجديد
  store_description: string | null;
  description: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  cover_url: string | null;
  slug: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  owner_id: string;
  product_count?: number;
  created_at?: string;
}

export const useVendorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // التعديل: القراءة من جدول vendors بدلاً من vendor_profiles
      // بنستخدم owner_id لأنه الربط الصحيح مع المستخدم
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Mapping: تحويل بيانات الجدول الجديد لتناسب الواجهة القديمة
        const mappedProfile: VendorProfile = {
          ...data,
          store_name: data.name, // الداتا بيز فيها name، الواجهة عايزة store_name
          store_description: data.description,
          // باقي البيانات زي ما هي
          id: data.id,
          phone: data.phone,
          address: data.address,
          logo_url: data.logo_url,
          cover_url: data.cover_url,
          slug: data.slug,
          status: data.status,
          owner_id: data.owner_id
        };
        setProfile(mappedProfile);
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      console.error('Error fetching vendor profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // دالة التقديم (إنشاء المتجر)
  const applyAsVendor = async (storeName: string, description: string, phone: string, address: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    try {
      // توليد Slug
      const slug = `${storeName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`;

      // التعديل: الإضافة في جدول vendors
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          owner_id: user.id,
          name: storeName,
          description: description,
          phone: phone,
          address: address,
          slug: slug,
          status: 'active' // تفعيل فوري عشان يظهر
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('تم إنشاء المتجر بنجاح!');
      await fetchProfile();
      return true;

    } catch (err: any) {
      console.error('Error creating store:', err);
      toast.error('فشل إنشاء المتجر: ' + err.message);
      return false;
    }
  };

  // دالة التحديث
  const updateProfile = async (updates: Partial<VendorProfile>) => {
    if (!user || !profile) return false;

    try {
      const dbUpdates: any = {};
      // تحويل المسميات للجدول الجديد
      if (updates.store_name) dbUpdates.name = updates.store_name;
      if (updates.store_description) dbUpdates.description = updates.store_description;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.logo_url) dbUpdates.logo_url = updates.logo_url;
      if (updates.cover_url) dbUpdates.cover_url = updates.cover_url;

      const { error } = await supabase
        .from('vendors')
        .update(dbUpdates)
        .eq('id', profile.id)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success('تم تحديث بيانات المتجر');
      await fetchProfile();
      return true;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error('حدث خطأ أثناء التحديث');
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    applyAsVendor,
    updateProfile
  };
};

// ==========================================
// Admin Hook (رجعتلك الكود ده كامل زي ما كان)
// ==========================================
export const useAdminVendorProfiles = () => {
  const { user } = useAuth(); // مفروض تتأكد هنا إنه أدمن
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      // بنجيب كل المتاجر للأدمن
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedVendors = (data || []).map((v: any) => ({
        ...v,
        store_name: v.name,
        store_description: v.description
      }));

      setVendors(mappedVendors);
    } catch (err: any) {
      console.error('Error fetching admin vendors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // دالة تحديث حالة المتجر للأدمن
  const updateVendorStatus = async (vendorId: string, status: 'active' | 'rejected' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ status })
        .eq('id', vendorId);

      if (error) throw error;

      toast.success(`تم تغيير حالة المتجر إلى ${status}`);
      await fetchVendors();
      return true;
    } catch (err: any) {
      toast.error('فشل تحديث الحالة');
      return false;
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return { vendors, loading, error, fetchVendors, updateVendorStatus };
};
