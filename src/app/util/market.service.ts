import { Injectable } from '@angular/core';

@Injectable()
export class MarketService {
  constructor() {}

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
}
