import { Component } from '../base/Component';

/**
 * Компонент галереи товаров.
 * Отображает массив карточек.
 */
export class Gallery extends Component<{ items: HTMLElement[] }> {
  private _gallery: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this._gallery = container.querySelector('.gallery')!;
  }

  /**
   * Заменяет содержимое галереи на переданные карточки.
   */
  set items(value: HTMLElement[]) {
    this._gallery.replaceChildren(...value);
  }

  render(data?: Partial<{ items: HTMLElement[] }>): HTMLElement {
    if (data?.items) this.items = data.items;
    return this.container;
  }
}