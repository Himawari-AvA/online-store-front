<template>
  <div class="home" id="home" name="home">
    <!-- 轮播图 -->
    <div class="block">
      <el-carousel height="460px">
        <el-carousel-item v-for="item in carousel" :key="item.carousel_id">
          <router-link :to="{ path: '/goods/details', query: { productID: item.product_id } }">
            <img style="height:460px;" :src="item.imgPath.includes('http:') ? item.imgPath : $target + item.imgPath" :alt="item.describes" />
          </router-link>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 轮播图END -->
    <div class="main-box">
      <div class="main">
        <!-- 配件商品展示区域 -->
        <div class="accessory" id="promo-menu">
          <div class="box-hd">
            <div class="title">猜你喜欢</div>
            <div class="more" id="more">
              <!-- <MyMenu :val="3" @fromChild="getChildMsg2"> </MyMenu> -->
            </div>
          </div>
          <div class="box-bd">
            <div class="list">
              <MyList :list="preferenceList.slice(0,5)" :isMore="false"></MyList>
            </div>
          </div>
        </div>
        <!-- 配件商品展示区域END -->
      </div>
    </div>

    <!-- 新用户提交偏好表单 -->
    <el-dialog title="提示" :visible.sync="showPreferenceList" width="30%" :before-close="handleClose">
      <el-form ref="form" label-width="80px">
        <el-form-item label="您的偏好">
          <el-checkbox-group v-model="form">
            <!-- <el-checkbox label="手机"></el-checkbox>
            <el-checkbox label="电视机"></el-checkbox>
            <el-checkbox label="空调"></el-checkbox>
            <el-checkbox label="洗衣机"></el-checkbox>
            <el-checkbox label="保护套"></el-checkbox>
            <el-checkbox label="保护膜"></el-checkbox>
            <el-checkbox label="充电器"></el-checkbox>
            <el-checkbox label="充电宝"></el-checkbox>
            <el-checkbox label="饮料"></el-checkbox> -->
            <el-checkbox :label="item.category_name" v-for="(item, index) in categoryList" :key="index"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showPreferenceList = false">取 消</el-button>
        <el-button type="primary" @click="uploadPreferenceData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      carousel: '', // 轮播图数据

      preferenceList: '', //配件商品列表
      accessoryHotList: '', //热门配件商品列表
      accessoryActive: 1, // 配件当前选中的商品分类
      showPreferenceList: false, //展示偏好问卷
      // form: ['手机', '电视机', '空调', '洗衣机', '保护套'],
      form: [],
      // allform: ['', '手机', '电视机', '空调', '洗衣机', '保护套', '保护膜', '充电器', '充电宝', '饮料'],
      categoryList: '', //分类列表
    };
  },
  computed: {
    ...mapGetters(['getUser']),
    userId() {
      return this.getUser.user_id;
    },
    allform() {
      const map1 = new Map();
      this.categoryList.forEach((category) => {
        map1.set(category.category_name, category.category_id);
      });
      return map1;
    },
  },
  watch: {
    userId() {
      if (this.userId != undefined) {
        this.getPreference(this.userId);
      } else {
        this.preferenceList = '';
        this.setBasePreference();
      }
    },
  },

  created() {
    // 获取轮播图数据
    this.$axios
      .post('/api/carousel/list', {})
      .then((res) => {
        this.carousel = res.data.data;
      })
      .catch((err) => {
        return Promise.reject(err);
      });

    // this.checkPrefer();
    if (this.userId) {
      this.getPreference(this.userId);
    } else {
      this.setBasePreference();
    }
  },
  methods: {
    // 获取配件模块子组件传过来的数据
    getChildMsg2(val) {
      this.accessoryActive = val;
    },
    // 获取各类商品数据方法封装
    getPreference(userId) {
      this.$axios
        .post('/api/user/getpreference', {
          user_id: userId,
        })
        .then((res) => {
          if (res.data.code == '001') {
            this.preferenceList = res.data.data;
            if (this.preferenceList.length > 5) {
              // this.preferenceList.pop();
              // this.preferenceList = this.preferenceList.slice(0, 5);
            }
          } else if (res.data.code == '004') {
            this.showPreferenceList = true;
            this.getCategory();
          }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    setBasePreference() {
      // this.$axios
      //   .post('/api/product/getpreference', {
      //     category_id: 7,
      //   })
      //   .then((res) => {
      //     if (res.data.code == '001') {
      //       console.log(res);
      //       console.log(res.data);
      //       this.preferenceList = res.data;
      //     }
      //   })
      //   .then(() => {
      //     this.$axios.post('/api/product/getpreference', {
      //       category_id: 8,
      //     });
      //   })
      //   .then((res) => {
      //     this.preferenceList = this.preferenceList.concat(res.data);
      //     if (this.preferenceList.length > 5) {
      //       this.preferenceList.pop();
      //     }
      //   })
      //   .catch((err) => {
      //     return Promise.reject(err);
      //   });
      let basePreferenceArray = [];
      console.log('进入setBasePreference');
      let post1 = this.$axios
        .post('/api/product/getpreference', {
          category_id: 7,
        })
        .then((res) => {
          console.log(res.data);
          basePreferenceArray = basePreferenceArray.concat(res.data);
        })
        .catch((err) => {
          return Promise.reject(err);
        });

      let post2 = this.$axios
        .post('/api/product/getpreference', {
          category_id: 5,
        })
        .then((res) => {
          console.log(res.data);
          basePreferenceArray = basePreferenceArray.concat(res.data);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
      Promise.all([post1, post2])
        .then(() => {
          this.preferenceList = basePreferenceArray;
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
    handleClose(done) {
      this.$confirm('关闭后将无法为您推荐感兴趣的商品,确认关闭吗?')
        .then(() => {
          done();
        })
        .catch(() => {});
    },
    uploadPreferenceData() {
      // this.dialogVisible = false;
      this.form.forEach((element) => {
        // let num = this.allform.indexOf(element);
        let num = this.allform.get(element);
        // console.log(num);
        this.$axios
          .post('/api/user/addpreference', {
            user_id: this.userId,
            category_id: num,
            frequency: 10,
          })
          .then((res) => {
            console.log('用户偏好推荐成功');
            console.log(res.data);
            // this.getPreference(this.userId);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      });
      this.showPreferenceList = false;
      this.form = [];
      setTimeout(() => {
        this.getPreference(this.userId);
      }, 1000);
    },
    getCategory() {
      console.log('getCategory()');
      this.$axios
        .post('/api/product/category/list', {})
        .then((res) => {
          const cate = res.data.data;
          this.categoryList = cate;
          // if (this.categoryList.length > 5) {
          // this.categoryList.pop();
          // }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
  },
};
</script>
<style scoped>
@import '../assets/css/index.css';
</style>
