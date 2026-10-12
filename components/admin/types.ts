export type AdminEvent = {
  _id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  dateTime: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
};

export const CATEGORIES = ['Music', 'Workshop', 'Food', 'Sports', 'Kids'];
