import { IProduct } from '../../types';

/**
 * Модель каталога товаров.
 * Отвечает за хранение списка всех товаров и выбранного товара для детального просмотра.
 */
export class ProductsModel {
  private _items: IProduct[] = [];     // все товары
  private _selectedProduct: IProduct | null = null; // выбранный товар

  // Сохранить массив товаров
  setItems(items: IProduct[]): void {
    this._items = items;
  }

  // Получить массив всех товаров
  getItems(): IProduct[] {
    return this._items;
  }

  // Найти товар по id
  getItemById(id: string): IProduct | undefined {
    return this._items.find(item => item.id === id);
  }

  // Сохранить товар для детального отображения
  setSelectedProduct(product: IProduct | null): void {
    this._selectedProduct = product;
  }

  // Получить выбранный товар
  getSelectedProduct(): IProduct | null {
    return this._selectedProduct;
  }
}