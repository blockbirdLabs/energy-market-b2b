import { Component, OnInit } from '@angular/core';
import { MarketService } from '../util/market.service';
import { MatSnackBar } from '@angular/material';
import { Web3Service } from '../util/web3.service';

@Component({
  selector: 'app-create-orders',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateOrdersComponent implements OnInit {
  market: any;
  account: string;
  userInput = {
    quantity: 0
  };
  submittingOrder = false;

  constructor(
    private web3Service: Web3Service,
    private matSnackBar: MatSnackBar,
    private marketService: MarketService
  ) {}

  ngOnInit() {
    this.watchAccount();
    this.setContract();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.account = accounts[0];
    });
  }

  async setContract() {
    try {
      const contract = await this.web3Service.artifactsToContract(
        this.web3Service.marketArtifacts
      );
      this.market = await contract.deployed();
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
    }
  }

  async submitOrder() {
    this.submittingOrder = true;
    if (!this.market) {
      this.setStatus('Market contract is not loaded, unable to submit order');
      this.submittingOrder = false;
      return;
    }
    if (this.userInput.quantity <= 0) {
      this.setStatus('Quantity is not set');
      this.submittingOrder = false;
      return;
    }
    this.setStatus('Submitting order, please wait');
    try {
      const transaction = await this.market.submitOrder.sendTransaction(
        1,
        this.userInput.quantity,
        0,
        { from: this.account }
      );

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
      this.submittingOrder = false;
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
      this.submittingOrder = false;
    }
  }

  setQuantity(e) {
    console.log('Setting quantity to: ' + e.target.value);
    this.userInput.quantity = e.target.value;
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, { duration: 5000 });
  }
}
