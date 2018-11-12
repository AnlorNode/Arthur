const Koa = require('koa');
const request = require('request');

const app = new Koa();
const config = require('./config');
// const config = require('./config');
const port = 3000;
const Requests = {};

app.use((ctx) => {
  ctx.body = ' Koa';
});

app.listen(port, () => {
  console.log('start port :', port);
  const RequestsFun = (obj) => {
    request(obj.url, (error, response = {}, body) => {
      if (error) console.log('error:', error);
      // console.log('statusCode:', response.statusCode);
      // console.log('body:', body);
      if (obj.active) {
        let check = false;
        for (let a = 0, b = config.length; a < b; a += 1) {
          if (config[a].name === obj.name) {
            console.log(config[a].name, ' : ', config[a].counter);
            config[a].counter += 1;
            check = true;
            break;
          }
        }
        if (!check) {
          throw new Error('config[a].name !== obj.name ');
        }
        clearTimeout(Requests[obj.name]);
        Requests[obj.name] = setTimeout(RequestsFun, obj.timeout, obj);
      } else {
        console.info(obj.name, ' : deactivate');
      }
    });
  };
  if (Array.isArray(config)) {
    config.map((a) => {
      if (a.active && a.name && !Requests[a.name]) {
        Requests[a.name] = setTimeout(RequestsFun, a.timeout, a);
      } else {
        throw new Error(`the name "${a.name}" in the file is repeated`);
      }
      return '';
    });
  } else {
    console.error('is not array config');
  }
});
// nodemon ./server.js
