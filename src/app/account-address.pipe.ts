import { Pipe, PipeTransform } from '@angular/core';
/*
 * Transform an Ethereum account address in a readable name
*/
@Pipe({ name: 'accountAddress' })
export class AccountAddressPipe implements PipeTransform {
  transform(address: string): string {
    let name = '';
    switch (address.toLowerCase()) {
      case '0x997c2e4e571286e0ffc185f833348e6ad825c11e':
        name = 'Producer 1';
        break;
      case '0x18fe337eb470d59df95fa667751df47db0ebd833':
        name = 'Producer 2';
        break;
      case '0x1a9486df1e5613279200e707bd4f3b669ff7bccc':
        name = 'Producer 3';
        break;
      case '0x06d38a7c8ccab6adf0e68d96349ddc573bbaa7a3':
        name = 'Supplier 1';
        break;
      case '0x70f6a930bc9af0d35cf50a9e2d5151d40cce2bc5':
        name = 'Supplier 2';
        break;
      case '0xaa660a5ee9e642fffe6df22528fe086d04fcd535':
        name = 'Supplier 3';
        break;
      default:
        name = 'NAME NOT SET';
        break;
    }
    return name;
  }
}
