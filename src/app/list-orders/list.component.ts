import { Component, OnInit, ViewChild, Input } from '@angular/core';
import {
  MatSnackBar,
  MatPaginator,
  MatTableDataSource,
  MatDialog
} from '@angular/material';
import {
  ListOffersComponent,
  Offer
} from '../list-offers/list-offers.component';
import { CreateOffersComponent } from '../create-offers/create-offers.component';
import { Web3Service } from '../util/web3.service';
import { MarketService } from '../util/market.service';

export interface Order {
  id: number;
  owner: string;
  action: string;
  state: string;
  quantity: number;
  product: string;
  unsafeCreatedTimestamp: Date;
  offerCount: number;
  isEnergyDelivered: boolean;
  acceptedOffer: Offer;
}

@Component({
  selector: 'app-list-orders',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListOrdersComponent implements OnInit {
  @Input()
  isPublic;

  isProducer: boolean;
  orders: Order[];
  market: any;
  account: string;
  displayedColumns = [];
  dataSource = new MatTableDataSource<Order>(this.orders);

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  constructor(
    private matSnackBar: MatSnackBar,
    private web3Service: Web3Service,
    private marketService: MarketService,
    public dialog: MatDialog
  ) {}

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    this.watchAccount();
    this.setContract();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.account = accounts[0];
      this.isProducer = this.marketService.isProducer(this.account);
      if (this.isProducer) {
        this.displayedColumns = [
          'id',
          'action',
          'unsafeCreatedTimestamp',
          'product',
          'quantity',
          'owner',
          'offerCount',
          'seeOffers'
        ];
      } else {
        this.displayedColumns = [
          'id',
          'action',
          'unsafeCreatedTimestamp',
          'product',
          'quantity',
          'owner',
          'offerCount',
          'seeOffers',
          'placeOffer'
        ];
      }
    });
  }

  async setContract() {
    try {
      const contract = await this.web3Service.artifactsToContract(
        this.web3Service.marketArtifacts
      );
      this.market = await contract.deployed();
      this.getOrders();
      this.watchEvents();
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
    }
  }

  watchEvents() {
    const newOrderEvent = this.market.NewOrder({
      _from: this.web3Service.web3.eth.coinbase
    });
    newOrderEvent.watch((e, result) => {
      if (e) {
        console.log(e);
        this.setStatus(e.message + ' See log for more info');
      }
      const orderId = result.args.orderId.toNumber();
      console.log(`New Order with ID: ${orderId}`);
      this.addOrder(orderId);
    });
  }

  async addOrder(id) {
    try {
      const index = this.orders.findIndex(order => order.id === id);
      if (index === -1) {
        // The order do not exist, we can add it
        const newOrder = await this.getOrder(id);
        this.orders.push(newOrder);
        this.dataSource = new MatTableDataSource<Order>(this.orders);
      }
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
    }
  }

  async getOrders() {
    console.log('Get orders...');
    this.orders = [];
    try {
      const noOrders = await this.market.getOrderCount();
      console.log(`We have ${noOrders} orders`);
      for (let i = 1; i <= noOrders.toNumber(); i++) {
        this.addOrder(i);
      }
      this.orders.reverse();
      this.dataSource = new MatTableDataSource<Order>(this.orders);
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
    }
  }

  async getOrder(id) {
    try {
      const order = await this.market.getOrder.call(id);
      return {
        id: order[0].toNumber(),
        owner: order[1],
        action: this.marketService.getAction(order[2].toNumber()),
        state: this.marketService.getState(order[3].toNumber()),
        quantity: order[4].toNumber(),
        product: this.marketService.getProduct(order[5].toNumber()),
        unsafeCreatedTimestamp: this.marketService.getDate(order[6].toNumber()),
        offerCount: order[7].toNumber(),
        isEnergyDelivered: order[8],
        acceptedOffer: undefined
      };
    } catch (e) {
      console.log(e);
      this.setStatus(e.message + ' See log for more info');
    }
  }

  openListOffers(order): void {
    const dialogRef = this.dialog.open(ListOffersComponent, {
      width: '900px',
      data: {
        order: order,
        account: this.account
      }
    });
  }

  openCreateOffers(order): void {
    const dialogRef = this.dialog.open(CreateOffersComponent, {
      width: '500px',
      data: {
        order: order,
        account: this.account,
        market: this.market
      }
    });
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, { duration: 5000 });
  }
}
