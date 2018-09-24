import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatPaginator,
  MatTableDataSource,
  MatSnackBar
} from '@angular/material';
import { ListOrdersComponent, Order } from '../list-orders/list.component';
import { Web3Service } from '../util/web3.service';
import { MarketService } from '../util/market.service';

export interface DialogData {
  order: any;
  account: string;
}

export interface Offer {
  id: number;
  owner: string;
  price: number;
  value: number;
  secretHash: string;
  unsafeCreatedTimestamp: Date;
  isWithdraw: boolean;
}

@Component({
  selector: 'app-list-offers',
  templateUrl: './list-offers.component.html',
  styleUrls: ['./list-offers.component.css']
})
export class ListOffersComponent implements OnInit {
  order: Order;
  offers: Offer[];
  market: any;
  account: string;
  displayedColumns = [];
  dataSource = new MatTableDataSource<Offer>(this.offers);

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  constructor(
    private matSnackBar: MatSnackBar,
    private web3Service: Web3Service,
    private marketService: MarketService,
    public dialogRef: MatDialogRef<ListOrdersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.order = data.order;
    this.account = data.account;
  }

  ngOnInit() {
    this.setContract();
    if (this.isOwner()) {
      if (this.order.state === 'Open') {
        this.displayedColumns = [
          'type',
          'id',
          'unsafeCreatedTimestamp',
          'price',
          'owner',
          'acceptOffer'
        ];
      } else {
        this.displayedColumns = [
          'type',
          'id',
          'unsafeCreatedTimestamp',
          'price',
          'owner'
        ];
      }
    } else {
      this.displayedColumns = ['type', 'id', 'unsafeCreatedTimestamp', 'price'];
    }
  }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  async setContract() {
    try {
      const contract = await this.web3Service.artifactsToContract(
        this.web3Service.marketArtifacts
      );
      this.market = await contract.deployed();
      if (this.order.offerCount > 0) {
        this.getOffers();
      }
      if (this.order.state === 'Close') {
        this.getAcceptedOffer();
      }
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
    }
  }

  async getOffers() {
    console.log('Geting submissions...');
    this.offers = [];
    try {
      const orderId = this.order.id;
      const noOffers = this.order.offerCount;
      for (let i = 1; i <= noOffers; i++) {
        const offer = await this.market.getOffer.call(orderId, i);
        this.offers.push({
          id: offer[0].toNumber(),
          owner: offer[1],
          price: offer[2].toNumber(),
          value: offer[3].toNumber(),
          secretHash: offer[4],
          unsafeCreatedTimestamp: this.marketService.getDate(
            offer[5].toNumber()
          ),
          isWithdraw: offer[6]
        });
      }
      this.offers.reverse();
      this.dataSource = new MatTableDataSource<Offer>(this.offers);
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
    }
  }

  async getAcceptedOffer() {
    console.log('Geting accepted submission...');
    try {
      const orderId = this.order.id;
      const acceptedOffer = await this.market.getAcceptedOffer.call(orderId);
      this.order.acceptedOffer = {
        id: acceptedOffer[0].toNumber(),
        owner: acceptedOffer[1],
        price: acceptedOffer[2].toNumber(),
        value: acceptedOffer[3].toNumber(),
        secretHash: acceptedOffer[4],
        unsafeCreatedTimestamp: this.marketService.getDate(
          acceptedOffer[5].toNumber()
        ),
        isWithdraw: acceptedOffer[6]
      };
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
    }
  }

  async accept(offer: Offer) {
    this.setStatus('Accepting offer, please wait');

    try {
      const transaction = await this.market.acceptOffer.sendTransaction(
        this.order.id,
        offer.id,
        { from: this.account }
      );

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
      this.onNoClick();
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
      this.onNoClick();
    }
  }

  isOwner() {
    return this.account.toUpperCase() === this.order.owner.toUpperCase();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, { duration: 5000 });
  }
}
