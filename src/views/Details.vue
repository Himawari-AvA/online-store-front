<template>
  <div id="details">
    <!-- 头部 -->
    <div class="page-header">
      <div class="title">
        <p>{{ productDetails.product_name }}</p>
        <div class="list">
          <ul>
            <li>
              <router-link to>概述</router-link>
            </li>
            <li>
              <router-link to>参数</router-link>
            </li>
            <li>
              <router-link to>用户评价</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 头部END -->

    <!-- 主要内容 -->
    <div class="main">
      <!-- 左侧商品轮播图 -->
      <div class="block">
        <el-carousel height="560px" v-if="productPicture.length > 1">
          <el-carousel-item v-for="item in productPicture" :key="item.id">
            <img style="height:560px;" :src="item.product_picture.includes('http:') ? item.product_picture : $target + item.product_picture" :alt="item.intro" />
          </el-carousel-item>
        </el-carousel>
        <div v-if="productPicture.length == 1">
          <img
            style="height:560px;"
            :src="productPicture[0].product_picture.includes('http:') ? productPicture[0].product_picture : $target + productPicture[0].product_picture"
            :alt="productPicture[0].intro"
          />
        </div>
      </div>
      <!-- 左侧商品轮播图END -->

      <!-- 右侧内容区 -->
      <div class="content">
        <h1 class="name">{{ productDetails.product_name }}</h1>
        <p class="intro">{{ productDetails.product_intro }}</p>
        <p class="store">自营</p>
        <div class="price">
          <span>{{ productDetails.product_selling_price }}元</span>
          <span v-show="productDetails.product_price != productDetails.product_selling_price" class="del">{{ productDetails.product_price }}元</span>
        </div>
        <div class="pro-list">
          <span class="pro-name">{{ productDetails.product_name }}</span>
          <span class="pro-price">
            <span>{{ productDetails.product_selling_price }}元</span>
            <span v-show="productDetails.product_price != productDetails.product_selling_price" class="pro-del">{{ productDetails.product_price }}元</span>
          </span>
          <p class="price-sum">总计 : {{ productDetails.product_selling_price }}元</p>
        </div>
        <!-- 内容区底部按钮 -->
        <div class="button">
          <el-button class="shop-cart" :disabled="dis" @click="addShoppingCart">加入购物车</el-button>
          <el-button class="like" @click="customService">联系客服</el-button>
        </div>
        <!-- 内容区底部按钮END -->
        <div class="pro-policy">
          <ul>
            <!-- <li><i class="el-icon-circle-check"></i> 小米自营</li>
            <li><i class="el-icon-circle-check"></i> 小米发货</li> -->
            <li><i class="el-icon-circle-check"></i> 7天无理由退货</li>
            <li><i class="el-icon-circle-check"></i> 7天价格保护</li>
          </ul>

          <el-drawer title="联系客服" :visible.sync="drawer" direction="rtl" :before-close="handleClose" size="60%">
            <div style="height: 430px; overflow:auto; border-top: 1px solid #ccc" v-html="content"></div>
            <div style="height: 200px">
              <textarea
                v-model="text"
                style="height: 120px; width: 100%; padding: 20px; border: none; border-top: 1px solid #ccc;
             border-bottom: 1px solid #ccc; outline: none"
              ></textarea>
              <div style="text-align: right; padding-right: 10px">
                <el-button type="primary" size="mini" @click="send">发送</el-button>
              </div>
            </div>
          </el-drawer>
        </div>
      </div>
      <!-- 右侧内容区END -->
    </div>
    <!-- 主要内容END -->
  </div>
</template>
<script>
import { mapActions } from 'vuex';
import { mapGetters } from 'vuex';
let socket;

export default {
  data() {
    return {
      dis: false, // 控制“加入购物车按钮是否可用”
      productID: '', // 商品id
      productDetails: '', // 商品详细信息
      productPicture: '', // 商品图片
      drawer: false,
      user: {},
      isCollapse: false,
      users: [],
      chatUser: '',
      text: '',
      messages: [],
      content: '',
      username: '',
      kefuzaixian: false,
    };
  },
  computed: {
    ...mapGetters(['getUser', 'getOne']),
  },
  // 通过路由获取商品id
  activated() {
    if (this.$route.query.productID != undefined) {
      this.productID = this.$route.query.productID;
    }
    this.username = this.getUser.userName;
    // this.chatUser = 'admin111';
    this.chatUser = '测试111';
  },
  watch: {
    // 监听商品id的变化，请求后端获取商品数据
    productID: function(val) {
      this.getDetails(val);
      this.getDetailsPicture(val);
      this.addCollect();
    },
  },
  created() {
    // this.init();
  },

  methods: {
    ...mapActions(['unshiftShoppingCart', 'addShoppingCartNum']),
    // 获取商品详细信息
    getDetails(val) {
      this.$axios
        .post('/api/product/detail', {
          productID: val,
        })
        .then((res) => {
          this.productDetails = res.data.data;

          this.addPreference();
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    // 获取商品图片
    getDetailsPicture(val) {
      this.$axios
        .post('/api/product/pictures', {
          productID: val,
        })
        .then((res) => {
          this.productPicture = res.data.data;
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    // 加入购物车
    addShoppingCart() {
      // 判断是否登录,没有登录则显示登录组件
      if (!this.$store.getters.getUser) {
        this.$store.dispatch('setShowLogin', true);
        return;
      }
      this.$axios
        .post('/api/cart/save', {
          user_id: this.$store.getters.getUser.user_id,
          product_id: this.productID,
        })
        .then((res) => {
          switch (res.data.code) {
            case '001':
              // 新加入购物车成功
              this.unshiftShoppingCart(res.data.data);
              this.notifySucceed(res.data.msg);
              break;
            case '002':
              // 该商品已经在购物车，数量+1
              this.addShoppingCartNum(this.productID);
              this.notifySucceed(res.data.msg);
              break;
            case '003':
              // 商品数量达到限购数量
              this.dis = true;
              this.notifyError(res.data.msg);
              break;
            default:
              this.notifyError(res.data.msg);
          }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    addCollect() {
      // 判断是否登录,没有登录则显示登录组件
      if (!this.$store.getters.getUser) {
        this.$store.dispatch('setShowLogin', true);
        return;
      }
      this.$axios
        .post('/api/history/save', {
          user_id: this.$store.getters.getUser.user_id,
          product_id: this.productID,
        })
        .then((res) => {
          if (res.data.code == '001') {
            // 添加历史记录成功
            // this.notifySucceed(res.data.msg);
          } else {
            // 添加历史记录失败
            this.notifyError(res.data.msg);
          }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },

    // 添加偏好权重
    addPreference() {
      // 判断是否登录,没有登录则显示登录组件
      if (!this.$store.getters.getUser) {
        this.$store.dispatch('setShowLogin', true);
        return;
      }
      this.$axios
        .post('/api/user/addpreference', {
          user_id: this.$store.getters.getUser.user_id,
          category_id: this.productDetails.category_id,
          frequency: 1,
        })
        .then((res) => {
          if (res.data.code == '001') {
            // 添加偏好成功
            // this.notifySucceed(res.data.msg);
          } else {
            // 添加偏好失败
            this.notifyError(res.data.msg);
          }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },

    customService() {
      this.init();
      this.drawer = true;
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(() => {
          done();
        })
        .catch(() => {});
    },

    send() {
      if (!this.kefuzaixian) {
        this.$message({ type: 'warning', message: '暂无客服在线,请稍后重试' });
        return;
      }
      if (!this.chatUser) {
        this.$message({ type: 'warning', message: '暂无客服在线,请稍后重试' });
        return;
      }
      if (!this.text) {
        this.$message({ type: 'warning', message: '请输入内容' });
      } else {
        if (typeof WebSocket == 'undefined') {
          console.log('您的浏览器不支持WebSocket');
        } else {
          console.log('您的浏览器支持WebSocket');
          // 组装待发送的消息 json
          // {"from": "zhang", "to": "admin", "text": "聊天文本"}
          let message = { from: this.user.username, to: this.chatUser, text: this.text };
          console.log(socket);
          socket.send(JSON.stringify(message)); // 将组装好的json发送给服务端，由服务端进行转发
          this.messages.push({ user: this.user.username, text: this.text });
          // 构建消息内容，本人消息
          this.createContent(null, this.username, this.text);
          this.text = '';
        }
      }
    },
    createContent(remoteUser, nowUser, text) {
      // 这个方法是用来将 json的聊天消息数据转换成 html的。
      let html;
      // 当前用户消息
      if (nowUser) {
        // nowUser 表示是否显示当前用户发送的聊天消息，绿色气泡
        html =
          '<div class="el-row" style="padding: 5px 0">\n' +
          '  <div class="el-col el-col-22" style="text-align: right; padding-right: 10px">\n' +
          '    <div class="tip left">' +
          text +
          '</div>\n' +
          '  </div>\n' +
          '  <div class="el-col el-col-2">\n' +
          '  <span class="el-avatar el-avatar--circle" style="height: 40px; width: 40px; line-height: 40px;">\n' +
          '    <img src="http://localhost:3000/public/imgs/custom/yonghu.jpg" style="object-fit: cover;">\n' +
          '  </span>\n' +
          '  </div>\n' +
          '</div>';
      } else if (remoteUser) {
        // remoteUser表示远程用户聊天消息，蓝色的气泡
        html =
          '<div class="el-row" style="padding: 5px 0">\n' +
          '  <div class="el-col el-col-2" style="text-align: right">\n' +
          '  <span class="el-avatar el-avatar--circle" style="height: 40px; width: 40px; line-height: 40px;">\n' +
          '    <img src="http://localhost:3000/public/imgs/custom/kefu.jpg" style="object-fit: cover;">\n' +
          '  </span>\n' +
          '  </div>\n' +
          '  <div class="el-col el-col-22" style="text-align: left; padding-left: 10px">\n' +
          '    <div class="tip talkright">' +
          text +
          '</div>\n' +
          '  </div>\n' +
          '</div>';
      }
      console.log(html);
      this.content += html;
    },
    init() {
      // this.user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : {};
      console.log(this.username);
      let username = this.username;
      let _this = this;
      if (typeof WebSocket == 'undefined') {
        console.log('您的浏览器不支持WebSocket');
      } else {
        console.log('您的浏览器支持WebSocket');
        let socketUrl = 'ws://localhost:3000/admin/chatserver/' + username;
        if (socket != null) {
          socket.close();
          socket = null;
        }
        // 开启一个websocket服务
        socket = new WebSocket(socketUrl);
        //打开事件
        socket.onopen = function() {
          console.log('websocket已打开');
          console.log(socket);
        };
        //  浏览器端收消息，获得从服务端发送过来的文本消息
        socket.onmessage = function(msg) {
          console.log('收到数据====' + msg.data);
          let data = JSON.parse(msg.data); // 对收到的json数据进行解析， 类似这样的： {"users": [{"username": "zhang"},{ "username": "admin"}]}
          if (data.users) {
            // 获取在线人员信息
            _this.users = data.users.filter((user) => user.username !== username); // 获取当前连接的所有用户信息，并且排除自身，自己不会出现在自己的聊天列表里
            _this.kefuzaixian = false;
            _this.users.find(function(currentValue) {
              if (currentValue.username.indexOf('admin') != -1) {
                _this.kefuzaixian = true;
                _this.chatUser = currentValue.username;
                return true;
              }
            });
          } else {
            // 如果服务器端发送过来的json数据 不包含 users 这个key，那么发送过来的就是聊天文本json数据
            //  // {"from": "zhang", "text": "hello"}
            if (data.from === _this.chatUser) {
              _this.messages.push(data);
              // 构建消息内容
              _this.createContent(data.from, null, data.text);
            }
          }
        };
        //关闭事件
        socket.onclose = function() {
          console.log('websocket已关闭');
        };
        //发生了错误事件
        socket.onerror = function() {
          console.log('websocket发生了错误');
        };
      }
    },
  },
};
</script>
<style>
/* 头部CSS */
#details .page-header {
  height: 64px;
  margin-top: -20px;
  z-index: 4;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  -webkit-box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.07);
  box-shadow: 0px 5px 5px rgba(0, 0, 0, 0.07);
}
#details .page-header .title {
  width: 1225px;
  height: 64px;
  line-height: 64px;
  font-size: 18px;
  font-weight: 400;
  color: #212121;
  margin: 0 auto;
}
#details .page-header .title p {
  float: left;
}
#details .page-header .title .list {
  height: 64px;
  float: right;
}
#details .page-header .title .list li {
  float: left;
  margin-left: 20px;
}
#details .page-header .title .list li a {
  font-size: 14px;
  color: #616161;
}
#details .page-header .title .list li a:hover {
  font-size: 14px;
  color: #ff6700;
}
/* 头部CSS END */

/* 主要内容CSS */
#details .main {
  width: 1225px;
  height: 560px;
  padding-top: 30px;
  margin: 0 auto;
}
#details .main .block {
  float: left;
  width: 560px;
  height: 560px;
}
#details .el-carousel .el-carousel__indicator .el-carousel__button {
  background-color: rgba(163, 163, 163, 0.8);
}
#details .main .content {
  float: left;
  margin-left: 25px;
  width: 640px;
}
#details .main .content .name {
  height: 30px;
  line-height: 30px;
  font-size: 24px;
  font-weight: normal;
  color: #212121;
}
#details .main .content .intro {
  color: #b0b0b0;
  padding-top: 10px;
}
#details .main .content .store {
  color: #ff6700;
  padding-top: 10px;
}
#details .main .content .price {
  display: block;
  font-size: 18px;
  color: #ff6700;
  border-bottom: 1px solid #e0e0e0;
  padding: 25px 0 25px;
}
#details .main .content .price .del {
  font-size: 14px;
  margin-left: 10px;
  color: #b0b0b0;
  text-decoration: line-through;
}
#details .main .content .pro-list {
  background: #f9f9fa;
  padding: 30px 60px;
  margin: 50px 0 50px;
}
#details .main .content .pro-list span {
  line-height: 30px;
  color: #616161;
}
#details .main .content .pro-list .pro-price {
  float: right;
}
#details .main .content .pro-list .pro-price .pro-del {
  margin-left: 10px;
  text-decoration: line-through;
}
#details .main .content .pro-list .price-sum {
  color: #ff6700;
  font-size: 24px;
  padding-top: 20px;
}
#details .main .content .button {
  height: 55px;
  margin: 10px 0 20px 0;
}
#details .main .content .button .el-button {
  float: left;
  height: 55px;
  font-size: 16px;
  color: #fff;
  border: none;
  text-align: center;
}
#details .main .content .button .shop-cart {
  width: 340px;
  background-color: #ff6700;
}
#details .main .content .button .shop-cart:hover {
  background-color: #f25807;
}

#details .main .content .button .like {
  width: 260px;
  margin-left: 40px;
  /* background-color: #b0b0b0; */
  background-color: rgb(69, 193, 69);
}
#details .main .content .button .like:hover {
  /* background-color: #757575; */
  background-color: green;
}
#details .main .content .pro-policy li {
  float: left;
  margin-right: 20px;
  color: #b0b0b0;
}
/* 主要内容CSS END */
.tip {
  color: white;
  text-align: center;
  border-radius: 10px;
  font-family: sans-serif;
  padding: 10px;
  width: auto;
  display: inline-block !important;
  display: inline;
}

.right {
  background-color: white;
}
.talkright {
  background-color: deepskyblue;
}
.left {
  background-color: forestgreen;
}
.like {
  color: green;
}
</style>
