
import { v4 as uuidv4 } from 'uuid';

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export class CouponDatabase {
  private static instance: CouponDatabase;
  private coupons: Coupon[] = [];

  private constructor() {
    this.loadCoupons();
  }

  public static getInstance(): CouponDatabase {
    if (!CouponDatabase.instance) {
      CouponDatabase.instance = new CouponDatabase();
    }
    return CouponDatabase.instance;
  }

  private loadCoupons(): void {
    try {
      const storedCoupons = localStorage.getItem('coupons');
      if (storedCoupons) {
        this.coupons = JSON.parse(storedCoupons);
      } else {
        this.coupons = [];
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
      this.coupons = [];
    }
  }

  private saveCoupons(): void {
    try {
      localStorage.setItem('coupons', JSON.stringify(this.coupons));
      // Dispatch an event to notify components that coupons have been updated
      window.dispatchEvent(new Event('couponsUpdated'));
    } catch (error) {
      console.error('Error saving coupons:', error);
    }
  }

  public async getAllCoupons(): Promise<Coupon[]> {
    return this.coupons;
  }

  public async getCouponByCode(code: string): Promise<Coupon | null> {
    const coupon = this.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    return coupon || null;
  }

  public async isCouponValid(code: string): Promise<{ valid: boolean; discount?: number; message?: string }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, message: 'كود الخصم غير صالح' };
    }
    
    if (!coupon.isActive) {
      return { valid: false, message: 'كود الخصم غير مفعل' };
    }
    
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    
    if (now < validFrom) {
      return { valid: false, message: 'كود الخصم غير صالح بعد' };
    }
    
    if (now > validUntil) {
      return { valid: false, message: 'كود الخصم منتهي الصلاحية' };
    }
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'تم استنفاذ الحد الأقصى لاستخدام كود الخصم' };
    }
    
    return { valid: true, discount: coupon.discountPercentage };
  }

  public async addCoupon(couponData: Omit<Coupon, "id" | "usageCount" | "createdAt" | "updatedAt">): Promise<Coupon> {
    // Check if coupon with same code already exists
    const existingCoupon = await this.getCouponByCode(couponData.code);
    if (existingCoupon) {
      throw new Error('كود الخصم موجود بالفعل');
    }
    
    const newCoupon: Coupon = {
      ...couponData,
      id: uuidv4(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.coupons.push(newCoupon);
    this.saveCoupons();
    return newCoupon;
  }

  public async updateCoupon(id: string, updates: Partial<Coupon>): Promise<boolean> {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    // If updating code, check if it already exists
    if (updates.code && updates.code !== this.coupons[index].code) {
      const existingCoupon = this.coupons.find(
        c => c.id !== id && c.code.toUpperCase() === updates.code!.toUpperCase()
      );
      if (existingCoupon) {
        throw new Error('كود الخصم موجود بالفعل');
      }
    }
    
    this.coupons[index] = {
      ...this.coupons[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveCoupons();
    return true;
  }

  public async incrementUsage(code: string): Promise<boolean> {
    const index = this.coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (index === -1) return false;
    
    this.coupons[index] = {
      ...this.coupons[index],
      usageCount: this.coupons[index].usageCount + 1,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveCoupons();
    return true;
  }

  public async deleteCoupon(id: string): Promise<boolean> {
    const initialLength = this.coupons.length;
    this.coupons = this.coupons.filter(c => c.id !== id);
    
    if (this.coupons.length !== initialLength) {
      this.saveCoupons();
      return true;
    }
    return false;
  }
}

export default CouponDatabase;
