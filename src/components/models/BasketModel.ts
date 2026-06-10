import { IProduct } from '../../types';

/**
 * Модель корзины.
 * Хранит добавленные товары и управляет ими.
 */
export class BasketModel {
  private _items: IProduct[] = [];

  // Получить все товары в корзине
  getItems(): IProduct[] {
    return this._items;
  }

  // Добавить товар (если ещё не добавлен)
  addItem(product: IProduct): void {
    if (!this.hasItem(product.id)) {
      this._items.push(product);
    }
  }

  // Удалить товар по id
  removeItem(productId: string): void {
    this._items = this._items.filter(item => item.id !== productId);
  }

  // Очистить корзину
  clear(): void {
    this._items = [];
  }

  // Получить общую стоимость товаров
  getTotalPrice(): number {
    return this._items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  // Получить количество товаров
  getCount(): number {
    return this._items.length;
  }

  // Проверить, есть ли товар в корзине
  hasItem(productId: string): boolean {
    return this._items.some(item => item.id === productId);
  }
}