import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Модель корзины.
 * Хранит список товаров, добавленных пользователем.
 * Предоставляет методы для управления содержимым корзины и расчёта итогов.
 * При любом изменении состава генерируется событие 'basket:changed'.
 */
export class BasketModel {
  private _items: IProduct[] = [];

  constructor(protected events: IEvents) {}

  /** Возвращает массив товаров в корзине. */
  getItems(): IProduct[] {
    return this._items;
  }

  /**
   * Добавляет товар, если его ещё нет в корзине.
   * Генерирует событие 'basket:changed'.
   * @param product - добавляемый товар
   */
  addItem(product: IProduct): void {
    if (!this.hasItem(product.id)) {
      this._items.push(product);
      this.events.emit('basket:changed', { items: this._items });
    }
  }

  /**
   * Удаляет товар по идентификатору.
   * Генерирует событие 'basket:changed'.
   * @param productId - идентификатор удаляемого товара
   */
  removeItem(productId: string): void {
    this._items = this._items.filter(item => item.id !== productId);
    this.events.emit('basket:changed', { items: this._items });
  }

  /** Очищает корзину и генерирует событие 'basket:changed'. */
  clear(): void {
    this._items = [];
    this.events.emit('basket:changed', { items: this._items });
  }

  /**
   * Вычисляет общую стоимость всех товаров в корзине.
   * Если у товара цена отсутствует (null), она считается равной 0.
   * @returns общая сумма
   */
  getTotalPrice(): number {
    return this._items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  /** Возвращает количество товаров в корзине. */
  getCount(): number {
    return this._items.length;
  }

  /**
   * Проверяет, находится ли товар с указанным id в корзине.
   * @param productId - идентификатор товара
   * @returns true, если товар есть
   */
  hasItem(productId: string): boolean {
    return this._items.some(item => item.id === productId);
  }
}