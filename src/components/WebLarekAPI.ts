import { IApi } from '../types';
import { IOrder, IOrderResult, IProductsResponse } from '../types';

/**
 * Класс для взаимодействия с сервером интернет-магазина.
 * Использует композицию с любым объектом, реализующим интерфейс IApi.
 */
export class WebLarekAPI {
  constructor(private _api: IApi) {}

  // Получить список товаров (GET /product)
  getProducts(): Promise<IProductsResponse> {
    return this._api.get<IProductsResponse>('/product');
  }

  // Отправить заказ (POST /order)
  postOrder(order: IOrder): Promise<IOrderResult> {
    return this._api.post<IOrderResult>('/order', order);
  }
}