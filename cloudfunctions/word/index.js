const fresh = require('./fresh');
const ripe = require('./ripe');
const plan = require('./plan');
const schedule = require('./schedule');
const book = require('./book');
const list = require('./list');
const utils = require('./utils');


// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  switch (event._module) {
    case 'fresh':
      return await fresh.main(event, context);
    case 'ripe':
      return await ripe.main(event, context);
    case 'plan':
      return await plan.main(event, context);
    case 'schedule':
      return await schedule.main(event, context);
    case 'book':
      return await book.main(event, context);
    case 'list':
      return await list.main(event, context);
    case 'utils':
      return await utils.main(event, context);
  }
};





