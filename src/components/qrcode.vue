<template>
  <div class="qr">
    <vue-qr :text="showText" />
  </div>
</template>
<script>
import VueQr from 'vue-qr';
export default {
  name: 'qrCode',
  props: ['price'],
  components: {
    VueQr,
  },
  computed: {
    showText() {
      return '请支付' + this.price + '元';
    },
  },
};
</script>

<style>
.qr {
  height: 200px;
  width: 200px;
}
</style>
