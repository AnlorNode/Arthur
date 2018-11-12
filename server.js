const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const request = require('request');

const app = new Koa();
var router = new Router();
const config = require('./config');

const port = 3000;
const Requests = {};
app.use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

router.post('/', (ctx, next) => {
  console.log('request.body', ctx.request.body);
  ctx.body = 'post: Koa ok';
});
router.get('/', (ctx, next) => {
  console.log('ctx.request', ctx.request.query);
  ctx.body = 'get: Koa ok';
});
app.listen(port, () => {
  console.log('start port :', port);
  const RequestsFun = (obj) => {
    request(obj.url, (error, response = {}, body) => {
      if (error) console.error('error:', error);
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
