export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

// Тип способа оплаты
export type TPayment = 'card' | 'cash';

// Товар
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

// Данные покупателя
export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

// Данные отправляемые на сервер при оформлении заказа
export interface IOrder {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
  items: string[];   // массив id товаров
  total: number;
}

// Ответ сервера после оформления заказа
export interface IOrderResult {
  id: string;
  total: number;
}

// Ответ сервера с каталогом товаров
export interface IProductsResponse {
  total: number;
  items: IProduct[];
}