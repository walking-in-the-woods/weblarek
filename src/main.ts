/**
 * Точка входа приложения Web-ларёк.
 *
 * Реализует слой презентера: связывает модели данных, компоненты представления
 * и API через брокер событий EventEmitter.
 *
 * Основные сценарии:
 * - загрузка и отображение каталога товаров;
 * - предпросмотр товара в модальном окне;
 * - управление корзиной (добавление/удаление);
 * - оформление заказа (два шага, валидация);
 * - отправка заказа на сервер и показ результата.
 */

import './scss/styles.scss';

// Базовые классы и утилиты
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';

// Слой коммуникации
import { WebLarekAPI } from './components/WebLarekAPI';

// Модели данных
import { ProductsModel } from './components/models/ProductsModel';
import { BasketModel } from './components/models/BasketModel';
import { OrderModel } from './components/models/OrderModel';

// Компоненты представления (View)
import { Modal } from './components/view/Modal';
import { Page } from './components/view/Page';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';

// Типы и константы
import { IBuyer } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

// ============================================================================
// Инициализация брокера событий и API-клиента
// ============================================================================

/** Центральная шина событий для связи слоёв приложения. */
const events = new EventEmitter();

/** Экземпляр базового класса Api для HTTP-запросов. */
const api = new Api(API_URL);

/** API-клиент для работы с эндпоинтами сервера Web-ларёк. */
const webLarekApi = new WebLarekAPI(api);

// ============================================================================
// Создание моделей данных
// ============================================================================

/** Модель каталога товаров. */
const productsModel = new ProductsModel(events);

/** Модель корзины. */
const basketModel = new BasketModel(events);

/** Модель данных заказа (покупатель). */
const orderModel = new OrderModel(events);

// ============================================================================
// Создание корневых компонентов представления
// ============================================================================

/** Компонент главной страницы (галерея + счётчик). */
const page = new Page(document.body, events);

/** Компонент модального окна. */
const modal = new Modal(ensureElement('#modal-container'), events);

// Шаблоны, используемые для создания карточек и форм
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// ============================================================================
// Тип для событий изменения полей форм
// ============================================================================

/** Событие изменения поля в формах оформления заказа. */
type FormChangeEvent = { field: keyof IBuyer; value: string };

// ============================================================================
// Обработчики событий (презентер)
// ============================================================================

// ----------------------------------------------------------------------------
// Загрузка товаров с сервера при старте приложения
// ----------------------------------------------------------------------------

webLarekApi.getProducts()
  .then(({ items }) => {
    // Сохраняем полученный массив в модель – она сгенерирует событие products:changed
    productsModel.setItems(items);
  })
  .catch(err => console.error('Ошибка загрузки товаров:', err));

// ----------------------------------------------------------------------------
// Обновление галереи при изменении каталога
// ----------------------------------------------------------------------------

/**
 * При изменении списка товаров пересоздаём карточки каталога
 * и обновляем галерею на главной странице.
 */
events.on('products:changed', () => {
  const items = productsModel.getItems();
  const cards = items.map(product => {
    const cardContainer = cloneTemplate(cardCatalogTemplate);
    const card = new CardCatalog(cardContainer, events);
    card.id = product.id;
    card.title = product.title;
    card.image = CDN_URL + product.image;
    card.category = product.category;
    card.price = product.price;
    return card.render();
  });
  page.renderGallery(cards);
});

// ----------------------------------------------------------------------------
// Выбор товара для просмотра (клик по карточке в каталоге)
// ----------------------------------------------------------------------------

/**
 * При клике на карточку каталога находим товар по id
 * и сохраняем его как выбранный в модели.
 */
events.on('card:select', (data: { id: string }) => {
  const product = productsModel.getItemById(data.id);
  if (!product) return;
  // Генерация события products:selected произойдёт внутри модели
  productsModel.setSelectedProduct(product);
});

// ----------------------------------------------------------------------------
// Отображение предпросмотра товара в модальном окне
// ----------------------------------------------------------------------------

/**
 * После того как выбранный товар установлен, создаём карточку
 * предпросмотра и открываем модальное окно.
 */
events.on('products:selected', () => {
  const product = productsModel.getSelectedProduct();
  if (!product) return;

  const cardContainer = cloneTemplate(cardPreviewTemplate);
  const cardPreview = new CardPreview(cardContainer, events);

  // Заполняем данные карточки
  cardPreview.id = product.id;
  cardPreview.title = product.title;
  cardPreview.image = CDN_URL + product.image;
  cardPreview.category = product.category;
  cardPreview.price = product.price;
  cardPreview.description = product.description;

  // Определяем состояние кнопки
  const inBasket = basketModel.hasItem(product.id);
  const isAvailable = product.price !== null && product.price > 0;

  cardPreview.buttonState = {
    text: inBasket ? 'Удалить из корзины' : (isAvailable ? 'Купить' : 'Недоступно'),
    disabled: !isAvailable,
  };

  modal.open(cardPreview.render());
});

// ----------------------------------------------------------------------------
// Обработка действий с карточкой в предпросмотре (добавить/удалить)
// ----------------------------------------------------------------------------

/**
 * При нажатии на кнопку в предпросмотре добавляем или удаляем товар из корзины.
 * После действия модальное окно закрывается.
 */
events.on('card:action', (data: { id: string; action: 'add' | 'remove' }) => {
  const product = productsModel.getItemById(data.id);
  if (!product) return;

  if (data.action === 'add') {
    basketModel.addItem(product);
  } else {
    basketModel.removeItem(product.id);
  }
  modal.close();
});

// ----------------------------------------------------------------------------
// Обновление счётчика корзины
// ----------------------------------------------------------------------------

/**
 * При любом изменении состава корзины обновляем счётчик на иконке.
 */
events.on('basket:changed', () => {
  page.setCounter(basketModel.getCount());
});

// ----------------------------------------------------------------------------
// Открытие модального окна с содержимым корзины
// ----------------------------------------------------------------------------

/**
 * При запросе открытия корзины собираем список товаров,
 * создаём для каждого карточку и отображаем итоговую сумму.
 */
events.on('basket:open', () => {
  const items = basketModel.getItems();
  const total = basketModel.getTotalPrice();

  const basketContainer = cloneTemplate(basketTemplate);
  const basket = new Basket(basketContainer, events);

  // Создаём карточки для каждого товара
  const cards = items.map((product, index) => {
    const cardContainer = cloneTemplate(cardBasketTemplate);
    const card = new CardBasket(cardContainer, events);
    card.id = product.id;
    card.title = product.title;
    card.price = product.price;
    card.index = index + 1;
    return card.render();
  });

  basket.setItems(cards);
  basket.setTotal(total);
  modal.open(basket.render());
});

// ----------------------------------------------------------------------------
// Удаление товара из корзины (из списка корзины)
// ----------------------------------------------------------------------------

/**
 * При клике на кнопку удаления в карточке корзины удаляем товар из модели
 * и переоткрываем корзину для обновления списка.
 */
events.on('basket:remove', (data: { id: string }) => {
  basketModel.removeItem(data.id);
  events.emit('basket:open'); // обновляем отображение корзины
});

// ----------------------------------------------------------------------------
// Начало оформления заказа – открываем первую форму (способ оплаты + адрес)
// ----------------------------------------------------------------------------

/**
 * При нажатии «Оформить» в корзине открываем первую форму заказа.
 * Устанавливаем начальное состояние кнопки «Далее» на основе валидации.
 */
events.on('basket:order', () => {
  const orderContainer = cloneTemplate(orderTemplate);
  const orderForm = new OrderForm(orderContainer, events);

  const errors = orderModel.validate();
  orderForm.setSubmitDisabled(Object.keys(errors).length > 0);

  modal.open(orderForm.render());
});

// ----------------------------------------------------------------------------
// Изменение полей первой формы (способ оплаты и адрес)
// ----------------------------------------------------------------------------

/**
 * При изменении любого поля в форме заказа обновляем модель
 * и пересчитываем состояние кнопки «Далее» с отображением ошибок.
 */
events.on('order:change', (data: FormChangeEvent) => {
  orderModel.setField(data.field, data.value);

  const errors = orderModel.validate();
  const orderFormElement = modal['_content'].querySelector('.form');
  if (orderFormElement) {
    const form = new OrderForm(orderFormElement as HTMLElement, events);
    const errorMessages = Object.values(errors);
    form.setErrors(errorMessages);
    form.setSubmitDisabled(errorMessages.length > 0);
  }
});

// ----------------------------------------------------------------------------
// Отправка первой формы – переход ко второй форме (контакты)
// ----------------------------------------------------------------------------

/**
 * При отправке первой формы проверяем, что ошибок нет,
 * и открываем вторую форму (email и телефон).
 */
events.on('order:submit', () => {
  const errors = orderModel.validate();
  if (errors.address || errors.payment) {
    return; // не переходим, если есть ошибки
  }

  const contactsContainer = cloneTemplate(contactsTemplate);
  const contactsForm = new ContactsForm(contactsContainer, events);

  // Начальное состояние кнопки «Оплатить»
  const contactsErrors = orderModel.validate();
  contactsForm.setSubmitDisabled(!!contactsErrors.email || !!contactsErrors.phone);

  modal.open(contactsForm.render());
});

// ----------------------------------------------------------------------------
// Изменение полей второй формы (email и телефон)
// ----------------------------------------------------------------------------

/**
 * При изменении полей контактов обновляем модель и валидацию,
 * управляя активностью кнопки «Оплатить».
 */
events.on('contacts:change', (data: FormChangeEvent) => {
  orderModel.setField(data.field, data.value);

  const errors = orderModel.validate();
  const contactsFormElement = modal['_content'].querySelector('.form');
  if (contactsFormElement) {
    const form = new ContactsForm(contactsFormElement as HTMLElement, events);
    const errorMessages = Object.values(errors).filter(e => e);
    form.setErrors(errorMessages);
    const hasErrors = Object.keys(errors).some(k => k === 'email' || k === 'phone');
    form.setSubmitDisabled(hasErrors);
  }
});

// ----------------------------------------------------------------------------
// Отправка второй формы – отправка заказа на сервер
// ----------------------------------------------------------------------------

/**
 * При отправке второй формы собираем все данные заказа,
 * отправляем их на сервер и в случае успеха очищаем корзину,
 * сбрасываем данные заказа и показываем сообщение об успешной оплате.
 */
events.on('contacts:submit', () => {
  const orderData = orderModel.getData();

  // Проверяем полноту данных (защита от некорректного состояния)
  if (!orderData.payment || !orderData.address || !orderData.email || !orderData.phone) {
    return;
  }

  const items = basketModel.getItems().map(item => item.id);
  const total = basketModel.getTotalPrice();

  const order = {
    payment: orderData.payment,
    address: orderData.address,
    email: orderData.email,
    phone: orderData.phone,
    items,
    total,
  };

  webLarekApi.postOrder(order)
    .then(result => {
      // Очищаем корзину и данные заказа
      basketModel.clear();
      orderModel.clear();

      // Показываем сообщение об успехе
      const successContainer = cloneTemplate(successTemplate);
      const success = new Success(successContainer, events);
      success.total = result.total;
      modal.open(success.render());
    })
    .catch(err => {
      console.error('Ошибка оформления заказа:', err);
      // Здесь можно добавить отображение ошибки пользователю, если требуется
    });
});

// ----------------------------------------------------------------------------
// Закрытие сообщения об успехе
// ----------------------------------------------------------------------------

/**
 * При клике на кнопку «За новыми покупками!» закрываем модальное окно.
 */
events.on('success:close', () => {
  modal.close();
});

// ============================================================================
// Запуск приложения
// ============================================================================

// Все инициализационные действия уже выполнены через обработчики событий.
console.log('Web-ларёк успешно запущен!');