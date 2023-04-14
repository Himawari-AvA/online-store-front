<template>
  <div class="order">
    <!-- 我的订单头部 -->
    <div class="order-header">
      <div class="order-header-content">
        <p>
          <i class="el-icon-s-order" style="font-size: 30px;color: #ff6700;"></i>
          我的订单
        </p>
      </div>
    </div>
    <!-- 我的订单头部END -->

    <!-- 我的订单主要内容 -->
    <div class="order-content" v-if="orders.length > 0">
      <div class="content" v-for="(item, index) in orders" :key="index">
        <ul>
          <!-- 我的订单表头 -->
          <li class="order-info">
            <div class="order-id">订单编号: {{ item[0].order_id }}</div>
            <div class="order-state" v-show="item[0].order_state == 1">
              <el-popconfirm
                confirm-button-text="确认"
                cancel-button-text="我再想想"
                icon="el-icon-info"
                icon-color="red"
                @onConfirm="cancelOrder(item[0].order_id)"
                title="确定要取消订单吗,本操作不可逆!"
              >
                <el-button slot="reference">取消订单</el-button>
              </el-popconfirm>
              <!-- <i>取消订单</i> -->
            </div>
            <div class="order-state cancel-order" v-show="item[0].order_state == 2">订单已取消,等待退款</div>
            <div class="order-state cancel-order" v-show="item[0].order_state == 0">
              <p @click="goPayFromOrder(item[0].order_id, total[index].totalPrice)">订单未付款,去付款-></p>
            </div>
            <div class="order-time">订单时间: {{ item[0].order_time | dateFormat }}</div>
          </li>
          <li class="header">
            <div class="pro-img"></div>
            <div class="pro-name">商品名称</div>
            <div class="pro-price">单价</div>
            <div class="pro-num">数量</div>
            <div class="pro-total">小计</div>
          </li>
          <!-- 我的订单表头END -->

          <!-- 订单列表 -->
          <li class="product-list" v-for="(product, i) in item" :key="i">
            <div class="pro-img">
              <router-link :to="{ path: '/goods/details', query: { productID: product.product_id } }">
                <img :src="$target + product.product_picture" />
              </router-link>
            </div>
            <div class="pro-name">
              <router-link :to="{ path: '/goods/details', query: { productID: product.product_id } }">{{ product.product_name }}</router-link>
            </div>
            <div class="pro-price">{{ product.product_price }}元</div>
            <div class="pro-num">{{ product.product_num }}</div>
            <div class="pro-total pro-total-in">{{ product.product_price * product.product_num }}元</div>
          </li>
        </ul>
        <div class="order-bar">
          <div class="order-bar-left">
            <span class="order-total">
              共
              <span class="order-total-num">{{ total[index].totalNum }}</span> 件商品
            </span>
          </div>
          <div class="order-bar-center">
            <span class="order-total">
              联系方式:
              <span class="order-total">{{ item[0].linkman }} </span>
              <span class="order-total">{{ item[0].phone }} </span>
              <span class="order-total">{{ item[0].address }}</span>
            </span>
          </div>
          <div class="order-bar-right">
            <span>
              <span class="total-price-title">合计：</span>
              <span class="total-price">{{ total[index].totalPrice }}元</span>
            </span>
          </div>
          <!-- 订单列表END -->
        </div>
      </div>
      <div style="margin-top:-40px;"></div>
    </div>
    <!-- 我的订单主要内容END -->

    <!-- 订单为空的时候显示的内容 -->
    <div v-else class="order-empty">
      <div class="empty">
        <h2>您的订单还是空的！</h2>
        <p>快去购物吧！</p>
      </div>
    </div>

    <el-dialog title="下单成功,请支付" width="300px" center :visible.sync="showPayInfo" @close="toOrderPage">
      <div class="code">
        <qrCode :price="shouldPay"></qrCode>
      </div>
      <div class="code-button">
        <el-button class="code-button1" @click="toOrderPage">返回订单</el-button>
        <el-button class="code-button2" @click="paySuccess">支付成功</el-button>
      </div>
    </el-dialog>

    <!-- 订单为空的时候显示的内容END -->
  </div>
</template>
<script>
import qrCode from '../components/qrcode.vue';
export default {
  components: {
    qrCode,
  },
  data() {
    return {
      orders: [], // 订单列表
      total: [], // 每个订单的商品数量及总价列表
      resOrders: [],
      showPayInfo: false,
      shouldPay: 0,
    };
  },
  activated() {
    // 获取订单数据
    this.getOrderDate();
  },
  watch: {
    // 通过订单信息，计算出每个订单的商品数量及总价
    orders: function(val) {
      let total = [];
      for (let i = 0; i < val.length; i++) {
        const element = val[i];

        let totalNum = 0;
        let totalPrice = 0;
        for (let j = 0; j < element.length; j++) {
          const temp = element[j];
          totalNum += temp.product_num;
          totalPrice += temp.product_price * temp.product_num;
        }
        total.push({ totalNum, totalPrice });
      }
      this.total = total;
    },
  },
  methods: {
    cancelOrder(order_id) {
      this.$axios
        .post('/api/order/cancel', {
          order_id,
        })
        .then((res) => {
          if (res.data.code === '001') {
            this.notifySucceed(res.data.msg);
            this.getOrderDate();
          } else {
            this.notifyError(res.data.msg);
          }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    getOrderDate() {
      this.$axios
        .post('/api/order/list', {
          user_id: this.$store.getters.getUser.user_id,
        })
        .then((res) => {
          if (res.data.code === '001') {
            this.resOrders = res.data.data;
            this.resOrders.sort((a, b) => {
              return b[0].id - a[0].id;
            });
            this.orders = this.resOrders;
          } else {
            this.notifyError(res.data.msg);
          }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    goPayFromOrder(idFromNowOrder, moneyFromNowOrder) {
      this.showPayInfo = true;
      this.nowIdOrder = idFromNowOrder;
      this.shouldPay = moneyFromNowOrder;
    },
    toOrderPage() {
      this.showPayInfo = false;
    },
    paySuccess() {
      this.$axios
        .post('/api/order/pay', {
          order_id: this.nowIdOrder,
        })
        .then((res) => {
          switch (res.data.code) {
            // “001”代表结算成功
            case '001':
              // 提示结算结果
              this.notifySucceed(res.data.msg);
              // 跳转我的订单页面
              this.showPayInfo = false;
              this.$router.go(0);
              break;
            default:
              // 提示失败信息
              this.notifyError(res.data.msg);
          }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
  },
};
</script>
<style scoped>
.order {
  background-color: #f5f5f5;
  padding-bottom: 20px;
}
/* 我的订单头部CSS */
.order .order-header {
  height: 64px;
  border-bottom: 2px solid #ff6700;
  background-color: #fff;
  margin-bottom: 20px;
}
.order .order-header .order-header-content {
  width: 1225px;
  margin: 0 auto;
}
.order .order-header p {
  font-size: 28px;
  line-height: 58px;
  float: left;
  font-weight: normal;
  color: #424242;
}
/* 我的订单头部CSS END */
.order .content {
  width: 1225px;
  margin: 0 auto;
  background-color: #fff;
  margin-bottom: 50px;
}

.order .content ul {
  background-color: #fff;
  color: #424242;
  line-height: 85px;
}
/* 我的订单表头CSS */
.order .content ul .order-info {
  height: 60px;
  line-height: 60px;
  padding: 0 26px;
  color: #424242;
  border-bottom: 1px solid #ff6700;
}
.order .content ul .order-info .order-id {
  float: left;
  color: #ff6700;
}
.order .content ul .order-info .order-time {
  float: right;
}

.order .content ul .header {
  height: 85px;
  padding-right: 26px;
  color: #424242;
}
/* 我的订单表头CSS END */

/* 订单列表CSS */
.order .content ul .product-list {
  height: 85px;
  padding: 15px 26px 15px 0;
  border-top: 1px solid #e0e0e0;
}
.order .content ul .pro-img {
  float: left;
  height: 85px;
  width: 120px;
  padding-left: 80px;
}
.order .content ul .pro-img img {
  height: 80px;
  width: 80px;
}
.order .content ul .pro-name {
  float: left;
  width: 380px;
}
.order .content ul .pro-name a {
  color: #424242;
}
.order .content ul .pro-name a:hover {
  color: #ff6700;
}
.order .content ul .pro-price {
  float: left;
  width: 160px;
  padding-right: 18px;
  text-align: center;
}
.order .content ul .pro-num {
  float: left;
  width: 190px;
  text-align: center;
}
.order .content ul .pro-total {
  float: left;
  width: 160px;
  padding-right: 81px;
  text-align: right;
}
.order .content ul .pro-total-in {
  color: #ff6700;
}

.order .order-bar {
  width: 1185px;
  padding: 0 20px;
  border-top: 1px solid #ff6700;
  height: 50px;
  line-height: 50px;
  background-color: #fff;
}
.order .order-bar .order-bar-left {
  float: left;
}

.order .order-bar .order-bar-center {
  float: left;
  margin-left: 30px;
}
.order .order-bar .order-bar-center .order-total {
  color: #757575;
}
.order .order-bar .order-bar-left .order-total {
  color: #757575;
}
.order .order-bar .order-bar-left .order-total-num {
  color: #ff6700;
}
.order .order-bar .order-bar-right {
  float: right;
}
.order .order-bar .order-bar-right .total-price-title {
  color: #ff6700;
  font-size: 14px;
}
.order .order-bar .order-bar-right .total-price {
  color: #ff6700;
  font-size: 30px;
}
/* 订单列表CSS END */

/* 订单为空的时候显示的内容CSS */
.order .order-empty {
  width: 1225px;
  margin: 0 auto;
}
.order .order-empty .empty {
  height: 300px;
  margin: 30px auto;
  color: #b0b0b0;
  overflow: hidden;
}
.order .order-empty .empty h2 {
  width: 380px;
  margin: 30px auto;
  font-size: 36px;
}
.order .order-empty .empty p {
  font-size: 20px;
  width: 170px;
  margin: 30px auto;
}
.order-state {
  float: left;
  margin-left: 20px;
  color: blue;
}

.cancel-order {
  color: red;
}

.code {
  width: 200px;
  height: 230px;
  margin: 0 auto;
}

.code-button {
  width: 280px;
  margin: 0 auto;
}

.code-button1 {
  margin-left: 10px;
}
.code-button2 {
  margin-right: 10px;
}
/* 订单为空的时候显示的内容CSS END */
</style>
