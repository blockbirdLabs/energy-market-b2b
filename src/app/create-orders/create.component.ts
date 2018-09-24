import { Component, OnInit, Input } from '@angular/core';
import { MarketService } from '../util/market.service';
import { MatSnackBar } from '@angular/material';
import { Web3Service } from '../util/web3.service';

@Component({
  selector: 'app-create-orders',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateOrdersComponent implements OnInit {
  @Input()
  isPublic;

  market: any;
  account: string;
  isProducer: boolean;
  userInput = {
    quantity: 0
  };
  submittingOrder = false;
  balance = 0;

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
    this.web3Service.accountsObservable.subscribe(async accounts => {
      this.account = accounts[0];
      this.isProducer = this.marketService.isProducer(this.account);
      try {
        const web3 = this.web3Service.web3;
        const balance = await this.web3Service.web3.eth.getBalance(
          this.account
        );
        this.balance = web3.utils.fromWei(balance);
        const ethPrice = await this.marketService.getEthPrice();
        this.balance *= ethPrice;
      } catch (e) {
        console.error(e);
        this.setStatus(e.message + ' See log for more info');
      }
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

  doSomething(e) {
    console.log(e.value);
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, { duration: 5000 });
  }
}
