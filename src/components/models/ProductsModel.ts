import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Модель каталога товаров.
 * Отвечает за хранение списка всех товаров и текущего выбранного товара для детального просмотра.
 * При изменении данных генерирует события через брокер событий.
 */
export class ProductsModel {
  // Приватные поля: список товаров и выбранный товар
  private _items: IProduct[] = [];
  private _selectedProduct: IProduct | null = null;

  /**
   * Конструктор принимает экземпляр брокера событий, чтобы уведомлять подписчиков об изменениях.
   * @param events - брокер событий
   */
  constructor(protected events: IEvents) {}

  /**
   * Сохраняет массив товаров и генерирует событие 'products:changed'.
   * @param items - массив товаров
   */
  setItems(items: IProduct[]): void {
    this._items = items;
    this.events.emit('products:changed', { items: this._items });
  }

  /** Возвращает массив всех товаров. */
  getItems(): IProduct[] {
    return this._items;
  }

  /**
   * Находит товар по его идентификатору.
   * @param id - идентификатор товара
   * @returns товар или undefined
   */
  getItemById(id: string): IProduct | undefined {
    return this._items.find(item => item.id === id);
  }

  /**
   * Устанавливает выбранный товар и генерирует событие 'products:selected'.
   * @param product - товар или null (если сбросить выбор)
   */
  setSelectedProduct(product: IProduct | null): void {
    this._selectedProduct = product;
    this.events.emit('products:selected', { product: this._selectedProduct });
  }

  /** Возвращает текущий выбранный товар. */
  getSelectedProduct(): IProduct | null {
    return this._selectedProduct;
  }
}