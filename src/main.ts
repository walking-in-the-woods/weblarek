import './scss/styles.scss';

import { Api } from './components/base/Api';
import { WebLarekAPI } from './components/WebLarekAPI';
import { ProductsModel } from './components/models/ProductsModel';
import { BasketModel } from './components/models/BasketModel';
import { OrderModel } from './components/models/OrderModel';
import { apiProducts } from './utils/data';
import { API_URL } from './utils/constants';
import { IProduct } from './types';

// 1. Создаём экземпляры моделей
const productsModel = new ProductsModel();
const basketModel = new BasketModel();
const orderModel = new OrderModel();

// 2. Тестируем модели с тестовыми данными apiProducts
console.log('=== Тестирование моделей данных (тестовые данные) ===');

// Каталог
productsModel.setItems(apiProducts.items);
console.log('Товары в каталоге:', productsModel.getItems());
const firstProduct = productsModel.getItemById(apiProducts.items[0].id);
console.log('Товар с id', apiProducts.items[0].id, ':', firstProduct);
productsModel.setSelectedProduct(firstProduct || null);
console.log('Выбранный товар:', productsModel.getSelectedProduct());

// Корзина
console.log('Корзина пуста:', basketModel.getItems(), 'количество:', basketModel.getCount());
const productToAdd = productsModel.getItems()[0];
basketModel.addItem(productToAdd);
console.log('После добавления товара:', basketModel.getItems(), 'количество:', basketModel.getCount());
console.log('Общая стоимость:', basketModel.getTotalPrice());
console.log('Товар в корзине?', basketModel.hasItem(productToAdd.id));
basketModel.removeItem(productToAdd.id);
console.log('После удаления:', basketModel.getItems());

// Модель заказа
orderModel.setField('payment', 'card');
orderModel.setField('address', 'ул. Пушкина, д. 1');
orderModel.setField('email', 'test@example.com');
orderModel.setField('phone', '+71234567890');
console.log('Данные заказа:', orderModel.getData());
console.log('Валидация (ожидается пустой объект):', orderModel.validate());
orderModel.clear();
console.log('После очистки:', orderModel.getData());
console.log('Валидация после очистки:', orderModel.validate());

// 3. Реальный запрос к серверу
console.log('=== Запрос к серверу и сохранение данных ===');

// Создаём экземпляр Api с базовым URL из констант
const apiInstance = new Api(API_URL);
const larekApi = new WebLarekAPI(apiInstance);

// Запрашиваем товары
larekApi.getProducts()
  .then(response => {
    console.log('Ответ сервера (весь объект):', response);
    // Сохраняем массив товаров в модель каталога
    productsModel.setItems(response.items);
    console.log('Товары из каталога (после загрузки с сервера):', productsModel.getItems());
  })
  .catch(err => {
    console.error('Ошибка при загрузке товаров:', err);
  });