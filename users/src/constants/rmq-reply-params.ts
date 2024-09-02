const exchange = process.env.RMQ_USERS_TRANSPORT_EXCHANGE;

export const rmqReplyParams: {
  [key: string]: {
    exchange: string;
    routingKey: string;
    replyQueue: string;
  };
} = {
  [process.env.RMQ_USERS_TRANSPORT_SIGN_UP_REQUEST_RK]: {
    exchange,
    routingKey: process.env.RMQ_USERS_TRANSPORT_SIGN_UP_REPLY_RK,
    replyQueue: process.env.RMQ_USERS_TRANSPORT_SIGN_UP_REPLY_QUEUE,
  },
  [process.env.RMQ_USERS_TRANSPORT_SIGN_IN_REQUEST_RK]: {
    exchange,
    routingKey: process.env.RMQ_USERS_TRANSPORT_SIGN_IN_REPLY_RK,
    replyQueue: process.env.RMQ_USERS_TRANSPORT_SIGN_IN_REPLY_QUEUE,
  },
  [process.env.RMQ_USERS_TRANSPORT_REFRESH_REQUEST_RK]: {
    exchange,
    routingKey: process.env.RMQ_USERS_TRANSPORT_REFRESH_REPLY_RK,
    replyQueue: process.env.RMQ_USERS_TRANSPORT_REFRESH_REPLY_QUEUE,
  },
  [process.env.RMQ_USERS_TRANSPORT_LOGOUT_REQUEST_RK]: {
    exchange,
    routingKey: process.env.RMQ_USERS_TRANSPORT_LOGOUT_REPLY_RK,
    replyQueue: process.env.RMQ_USERS_TRANSPORT_LOGOUT_REPLY_QUEUE,
  },
};
