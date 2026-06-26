import { Component } from '../base/Component';

/**
 * Компонент модального окна.
 * Управляет отображением модального окна и его содержимого.
 * Закрывается по клику на крестик или на фон.
 */
export class Modal extends Component<{ content: HTMLElement }> {
  private _closeButton: HTMLElement;
  private _content: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this._closeButton = container.querySelector('.modal__close')!;
    this._content = container.querySelector('.modal__content')!;

    this._closeButton.addEventListener('click', this.close.bind(this));
    this.container.addEventListener('click', this._onContainerClick.bind(this));
  }

  private _onContainerClick(event: MouseEvent) {
    if (event.target === this.container) {
      this.close();
    }
  }

  /**
   * Открывает модальное окно с переданным содержимым.
   */
  open(content: HTMLElement) {
    this._content.innerHTML = '';
    this._content.append(content);
    this.container.classList.add('modal_active');
  }

  /** Закрывает модальное окно и очищает содержимое. */
  close() {
    this.container.classList.remove('modal_active');
    this._content.innerHTML = '';
  }

  render(data?: { content: HTMLElement }): HTMLElement {
    if (data?.content) {
      this.open(data.content);
    }
    return this.container;
  }
}