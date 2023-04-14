<template>
  <div id="register">
    <el-dialog title="修改信息" width="330px" center :visible.sync="isChangeInfo">
      <el-form :model="infoChange" :rules="rules" status-icon ref="ruleForm" class="demo-ruleForm">
        <el-form-item prop="name">
          <el-input prefix-icon="el-icon-user-solid" placeholder="请输入用户名" v-model="infoChange.name"></el-input>
        </el-form-item>
        <el-form-item prop="pass">
          <el-input prefix-icon="el-icon-view" type="password" placeholder="请输入密码" v-model="infoChange.pass"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPass">
          <el-input prefix-icon="el-icon-view" type="password" placeholder="请再次输入密码" v-model="infoChange.confirmPass"></el-input>
        </el-form-item>
        <el-form-item prop="phone">
          <el-input prefix-icon="el-icon-phone" placeholder="请输入手机号" v-model="infoChange.phone">手机号</el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" type="primary" @click="updateInfo" style="width:100%;">修改</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { mapActions } from 'vuex';
import { mapGetters } from 'vuex';
export default {
  name: 'MyChangeInfo',
  props: ['changeInfo'],
  data() {
    // 用户名的校验方法
    let validateName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入用户名'));
      }
      // 用户名以字母开头,长度在5-16之间,允许字母数字下划线
      const userNameRule = /^[a-zA-Z][a-zA-Z0-9_]{4,15}$/;
      if (userNameRule.test(value)) {
        //判断数据库中是否已经存在该用户名
        if (this.infoChange.name == this.getOne.userName) {
          this.$refs.ruleForm.validateField('checkPass');
          return callback();
        } else {
          this.$axios
            .post('/api/user/check', {
              userName: this.infoChange.name,
            })
            .then((res) => {
              // “001”代表用户名不存在，可以注册
              if (res.data.code == '001') {
                this.$refs.ruleForm.validateField('checkPass');
                return callback();
              } else {
                return callback(new Error(res.data.msg));
              }
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }
      } else {
        return callback(new Error('字母开头,长度5-16之间,允许字母数字下划线'));
      }
    };
    // 密码的校验方法
    // let validatePass = (rule, value, callback) => {
    //   if (value === '') {
    //     return callback(new Error('请输入密码'));
    //   }
    //   // 密码以字母开头,长度在6-18之间,允许字母数字和下划线
    //   const passwordRule = /^[a-zA-Z]\w{5,17}$/;
    //   if (passwordRule.test(value)) {
    //     this.$refs.ruleForm.validateField('checkPass');
    //     return callback();
    //   } else {
    //     return callback(new Error('字母开头,长度6-18之间,允许字母数字和下划线'));
    //   }
    // };
    // 确认密码的校验方法
    let validateConfirmPass = (rule, value, callback) => {
      if (value === '') {
        return callback(new Error('请输入确认密码'));
      }
      // 校验是否以密码一致
      if (this.infoChange.pass != '' && value === this.infoChange.pass) {
        this.$refs.ruleForm.validateField('checkPass');
        return callback();
      } else {
        return callback(new Error('两次输入的密码不一致'));
      }
    };
    return {
      isChangeInfo: false, // 控制注册组件是否显示
      infoChange: {
        name: '',
        pass: '',
        confirmPass: '',
        phone: '',
      },
      infoBefore: {},
      // 用户信息校验规则,validator(校验方法),trigger(触发方式),blur为在组件 Input 失去焦点时触发
      rules: {
        name: [{ validator: validateName, trigger: 'blur' }],
        // pass: [{ validator: validatePass, trigger: 'blur' }],
        confirmPass: [{ validator: validateConfirmPass, trigger: 'blur' }],
      },
    };
  },
  watch: {
    // 监听父组件传过来的register变量，设置this.isRegister的值
    changeInfo: function(val) {
      if (val) {
        if (JSON.stringify(this.getOne) === '{}') {
          new Promise(() => {
            this.getOneAllInfo();
          }).then(() => {
            this.infoChange.name = this.getOne.userName;
            this.infoChange.pass = this.getOne.password;
            this.infoChange.confirmPass = this.getOne.password;
            this.infoChange.phone = this.getOne.userPhonenumber;
          });
        } else {
          this.infoChange.name = this.getOne.userName;
          this.infoChange.pass = this.getOne.password;
          this.infoChange.confirmPass = this.getOne.password;
          this.infoChange.phone = this.getOne.userPhonenumber;
        }
        this.isChangeInfo = val;
      }
    },
    // 监听this.isRegister变量的值，更新父组件register变量的值
    isChangeInfo: function(val) {
      if (!val) {
        this.$emit('fromChangeInfo', val);
      } else {
        // this.$refs['ruleForm'].resetFields();
        this.$refs.ruleForm.resetFields();
        // this.infoChange.name = this.getOne.userName;
        // this.infoChange.pass = this.getOne.password;
        // this.infoChange.confirmPass = this.getOne.password;
        // this.infoChange.phone = this.getOne.userPhonenumber;
        if (JSON.stringify(this.getOne) === '{}') {
          new Promise(() => {
            this.getOneAllInfo();
          }).then(() => {
            this.infoChange.name = this.getOne.userName;
            this.infoChange.pass = this.getOne.password;
            this.infoChange.confirmPass = this.getOne.password;
            this.infoChange.phone = this.getOne.userPhonenumber;
          });
        } else {
          this.infoChange.name = this.getOne.userName;
          this.infoChange.pass = this.getOne.password;
          this.infoChange.confirmPass = this.getOne.password;
          this.infoChange.phone = this.getOne.userPhonenumber;
        }
      }
    },
  },
  methods: {
    ...mapActions(['setUser', 'setShowLogin', 'setShoppingCart', 'setOne']),
    updateInfo() {
      // 通过element自定义表单校验规则，校验用户输入的用户信息
      this.$refs['ruleForm'].validate((valid) => {
        //如果通过校验开始注册
        if (valid) {
          this.$axios
            .post('/api/user/admin/update', {
              user_id: this.getOne.user_id,
              userName: this.infoChange.name,
              password: this.infoChange.pass,
              userPhonenumber: this.infoChange.phone,
            })
            .then((res) => {
              // “001”代表注册成功，其他的均为失败
              if (res.data.code === '001') {
                // 隐藏注册组件
                this.isChangeInfo = false;
                // 弹出通知框提示注册成功信息
                this.notifySucceed(res.data.msg);
                this.logout();
                this.$emit('fromChangeInfo', false);
              } else {
                // 弹出通知框提示注册失败信息
                this.notifyError(res.data.msg);
              }
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        } else {
          return false;
        }
      });
    },
    // 退出登录
    logout() {
      this.visible = false;
      // 清空本地登录信息
      localStorage.setItem('user', '');
      // 清空vuex登录信息
      this.setUser('');
      this.notifySucceed('成功退出登录');
    },
    getOneAllInfo() {
      // console.log('---------3------------------' + this.userId);
      this.$axios
        .post('/api/user/getone', {
          user_id: this.getUser.user_id,
        })
        .then((res) => {
          // “001”代表注册成功，其他的均为失败
          console.log(res.data);
          if (res.data.code === '001') {
            // this.notifySucceed(res.data.msg);
            this.setOne(res.data.data);
            this.infoChange.name = this.getOne.userName;
            this.infoChange.pass = this.getOne.password;
            this.infoChange.confirmPass = this.getOne.password;
            this.infoChange.phone = this.getOne.userPhonenumber;
          } else {
            this.notifyError(res.data.msg);
          }
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    },
  },
  computed: {
    ...mapGetters(['getUser', 'getNum', 'getOne']),
  },
  created() {
    // this.isChangeInfo = val;
    // getOneAllInfo();
  },
};
</script>
<style></style>
