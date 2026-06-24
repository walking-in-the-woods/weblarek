import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

/**
 * Компонент главной страницы.
 * Отвечает за отображение галереи товаров и счётчика корзины.
 * При клике на иконку корзины генерирует событие 'basket:open'.
 */
export class Page extends Component<{ counter: number; gallery: HTMLElement[] }> {
  private _counter: HTMLElement;
  private _gallery: HTMLElement;
  private _basketButton: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);
    // Находим элементы на странице
    this._counter = container.querySelector('.header__basket-counter')!;
    this._gallery = container.querySelector('.gallery')!;
    this._basketButton = container.querySelector('.header__basket')!;

    // При клике на кнопку корзины генерируем событие
    this._basketButton.addEventListener('click', () => {
      this.events.emit('basket:open');
    });
  }

  /**
   * Устанавливает значение счётчика на иконке корзины.
   * @param value - количество товаров
   */
  setCounter(value: number) {
    this._counter.textContent = String(value);
  }

  /**
   * Заменяет содержимое галереи на переданные карточки.
   * @param items - массив DOM-элементов карточек
   */
  renderGallery(items: HTMLElement[]) {
    this._gallery.replaceChildren(...items);
  }

  /**
   * Рендерит страницу с возможностью обновить счётчик и галерею.
   */
  render(data?: Partial<{ counter: number; gallery: HTMLElement[] }>): HTMLElement {
    if (data?.counter !== undefined) this.setCounter(data.counter);
    if (data?.gallery) this.renderGallery(data.gallery);
    return this.container;
  }
}