<!--
 * @Author: Himawari 867415074@qq.com
 * @Date: 2023-02-19 14:06:39
 * @LastEditors: Himawari 867415074@qq.com
 * @LastEditTime: 2023-04-14 17:33:03
 * @FilePath: \online-store-front\src\views\History.vue
 * @Description: new file
 * 1
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
-->
<template>
  <div class="collect">
    <!-- Add a static page for my favorite module -->
    <div class="collect-header">
      <div class="collect-title">
        <i class="el-icon-collection-tag" style="color: #ff6700;"></i>
        历史记录
      </div>
    </div>
    <div class="content">
      <div class="goods-list" v-if="collectList.length > 0">
        <MyList :list="collectList" :isDelete="true"></MyList>
      </div>
      <!-- 收藏列表为空的时候显示的内容 -->
      <div v-else class="collect-empty">
        <div class="empty">
          <h2>您的历史记录还是空的！</h2>
          <p>快去购物吧！</p>
        </div>
      </div>
      <!--  收藏列表为空的时候显示的内容END -->
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      collectList: [],
    };
  },
  activated() {
    // 获取收藏数据
    this.$axios
      .post('/api/history/list', {
        user_id: this.$store.getters.getUser.user_id,
      })
      .then((res) => {
        if (res.data.code === '001') {
          this.collectList = res.data.data;
        }
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  },
};
</script>
<style>
.collect {
  background-color: #f5f5f5;
}
.collect .collect-header {
  height: 64px;
  background-color: #fff;
  border-bottom: 2px solid #ff6700;
}
.collect .collect-header .collect-title {
  width: 1225px;
  margin: 0 auto;
  height: 64px;
  line-height: 58px;
  font-size: 28px;
}
.collect .content {
  /* padding: 20px 0; */
  width: 1225px;
  margin: 0 auto;
}
.collect .content .goods-list {
  margin-left: -13.7px;
  overflow: hidden;
}
/* 收藏列表为空的时候显示的内容CSS */
.collect .collect-empty {
  width: 1225px;
  margin: 0 auto;
}
.collect .collect-empty .empty {
  height: 300px;
  margin: 30px auto;
  color: #b0b0b0;
  overflow: hidden;
}
.collect .collect-empty .empty h2 {
  width: 400px;
  margin: 30px auto;
  font-size: 36px;
}
.collect .collect-empty .empty p {
  font-size: 20px;
  width: 170px;
  margin: 30px auto;
}
/* 收藏列表为空的时候显示的内容CSS END */
</style>
