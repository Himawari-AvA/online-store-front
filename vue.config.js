/*
 * @Author: Himawari 867415074@qq.com
 * @Date: 2023-02-19 14:06:39
 * @LastEditors: Himawari 867415074@qq.com
 * @LastEditTime: 2023-04-21 21:02:23
 * @FilePath: \online-store-front\vue.config.js
 * @Description: new file
 * 1
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
module.exports = {
  publicPath: './',
  devServer: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
};
