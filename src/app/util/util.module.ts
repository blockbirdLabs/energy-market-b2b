import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from './web3.service';
import { MarketService } from './market.service';

@NgModule({
  imports: [CommonModule],
  providers: [Web3Service, MarketService],
  declarations: []
})
export class UtilModule {}
