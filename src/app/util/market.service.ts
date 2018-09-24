import { Injectable } from '@angular/core';

@Injectable()
export class MarketService {
  constructor() {}

  async getEthPrice() {
    try {
      const response = await fetch(
        'https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=EUR'
      );
      const res = await response.json();
      const price = res[0].price_eur;
      console.log('Getting ETH/EUR price to:', price);
      return price;
    } catch (e) {
      console.error(e);
    }
  }

  getState(stateId: number): string {
    let state = '';
    switch (stateId) {
      case 0:
        state = 'Open';
        break;
      case 1:
        state = 'Close';
        break;
      case 2:
        state = 'Canceled';
        break;
      default:
        break;
    }
    return state;
  }

  getAction(actionId: number): string {
    let action = '';
    switch (actionId) {
      case 0:
        action = 'Buy';
        break;
      case 1:
        action = 'Sell';
        break;
      default:
        break;
    }
    return action;
  }

  getProduct(productId: number): string {
    let product = '';
    switch (productId) {
      case 0:
        product = 'Day';
        break;
      case 1:
        product = 'Week';
        break;
      case 2:
        product = 'Month';
        break;
      default:
        break;
    }
    return product;
  }

  getDate(unix_timestamp: number): Date {
    return new Date(unix_timestamp * 1000);
  }

  isProducer(address: string): boolean {
    let isProducer;
    switch (address.toLowerCase()) {
      case '0x997c2e4e571286e0ffc185f833348e6ad825c11e':
        isProducer = true;
        break;
      case '0x18fe337eb470d59df95fa667751df47db0ebd833':
        isProducer = true;
        break;
      case '0x1a9486df1e5613279200e707bd4f3b669ff7bccc':
        isProducer = true;
        break;
      default:
        isProducer = false;
        break;
    }
    return isProducer;
  }

  isSupplier(address: string): boolean {
    let isSupplier;
    switch (address.toLowerCase()) {
      case '0x06d38a7c8ccab6adf0e68d96349ddc573bbaa7a3':
        isSupplier = true;
        break;
      case '0x70f6a930bc9af0d35cf50a9e2d5151d40cce2bc5':
        isSupplier = true;
        break;
      case '0xaa660a5ee9e642fffe6df22528fe086d04fcd535':
        isSupplier = true;
        break;
      default:
        isSupplier = false;
        break;
    }
    return isSupplier;
  }
}
