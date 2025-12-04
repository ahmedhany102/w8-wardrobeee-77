import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Store } from 'lucide-react';
import { VendorProfile, getStatusLabel, getStatusColor } from '@/hooks/useVendorProfile';

interface VendorProfileFormProps {
  profile: VendorProfile;
  onUpdate: (updates: Partial<Pick<VendorProfile, 'store_name' | 'store_description' | 'phone' | 'address' | 'logo_url'>>) => Promise<boolean>;
}

export const VendorProfileForm = ({ profile, onUpdate }: VendorProfileFormProps) => {
  const [storeName, setStoreName] = useState(profile.store_name);
  const [storeDescription, setStoreDescription] = useState(profile.store_description || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [logoUrl, setLogoUrl] = useState(profile.logo_url || '');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = 
      storeName !== profile.store_name ||
      storeDescription !== (profile.store_description || '') ||
      phone !== (profile.phone || '') ||
      address !== (profile.address || '') ||
      logoUrl !== (profile.logo_url || '');
    setHasChanges(changed);
  }, [storeName, storeDescription, phone, address, logoUrl, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeName.trim()) {
      return;
    }

    setSaving(true);
    try {
      const success = await onUpdate({
        store_name: storeName.trim(),
        store_description: storeDescription.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        logo_url: logoUrl.trim() || null
      });
      if (success) {
        setHasChanges(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const isRestricted = profile.status !== 'approved';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>معلومات المتجر</CardTitle>
              <CardDescription>تعديل معلومات متجرك الأساسية</CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(profile.status)}>
            {getStatusLabel(profile.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isRestricted && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {profile.status === 'pending' && 'طلبك قيد المراجعة. سيتم إخطارك عند الموافقة.'}
              {profile.status === 'rejected' && 'تم رفض طلبك. يرجى التواصل مع الإدارة لمعرفة السبب.'}
              {profile.status === 'suspended' && 'تم إيقاف متجرك مؤقتاً. يرجى التواصل مع الإدارة.'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">اسم المتجر *</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="اسم متجرك"
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeDescription">وصف المتجر</Label>
            <Textarea
              id="storeDescription"
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder="وصف مختصر عن متجرك ومنتجاتك"
              rows={3}
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">رابط شعار المتجر</Label>
              <Input
                id="logoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="عنوان المتجر"
              disabled={saving}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving || !hasChanges || !storeName.trim()}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
