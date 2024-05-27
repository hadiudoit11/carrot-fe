// types/index.ts
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  email: string;
}


export interface Author {
  name: string;
  imageUrl: string;
}

export interface Category {
  name: string;
  color: string;
}

export interface Article {
  name: string;
  stat: string;
  href: string;
  description: string;
  previousStat: string;
  change: string;
  changeType: string;
  date_time: string;
  date: string;
  reading_time: string;
  author: Author;
  category: Category;
}