<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

JWT token-based authorization and authentication. The Microservice Gateway accepts HTTP requests, while the Microservice Users handles RabbitMQ RPC requests. RabbitMQ is used as a message broker to enable cross-microservice communication.

**Ports in use**: **4400**, **4900**, **27099**, **5673** and **15673**.

Port 4400: _Gateway_. Accepts http requests.

Port 4900: _Users_ microservice. Has communications with Gateway via RabbitMQ and MongoDB.

Port 27099: _MongoDB_ database.

Port 5673: _RabbitMQ_.

Port 15673: _RabbitMQ Management_

## How to run

First of all, in the `gateway`, `users`, `users-db`, and `users-transport` directories, duplicate the `.env.sample` file and rename it to `.env`. You can modify the passwords if needed.

If you update the MongoDB login credentials (username or password) in `users-db/.env`, make sure to also update them in `users/.env` for the variables `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`.

For RabbitMQ, update the `RABBITMQ_DEFAULT_USER` and `RABBITMQ_DEFAULT_PASS` variables in `users-transport/.env` and `users/.env`. Additionally, ensure that `RMQ_USERS_TRANSPORT_USER` and `RMQ_USERS_TRANSPORT_PASS` in `gateway/.env` are consistent. Ideally, these variables should be aligned across all microservices in the future.

### Run DB:

```bash
# users-db
$ cd users-db
$ docker compose up -d
```

### Run RabbitMQ:

```bash
# users-db
$ cd users-transport
$ docker compose up -d
```

### Run Users microservice:

```bash
# users-db
$ cd users
$ npm i
$ npm run start:dev
```

### Run Gateway microservice:

```bash
# users-db
$ cd gateway
$ npm i
$ npm run start:dev
```

## DB management

You can use [MongoDB Compass](https://www.mongodb.com/try/download/shell) for database management. To establish a connection, use the credentials from `users-db/.env`. If you've changed the login or password, use your updated credentials. The DSN format is as follows:

```
mongodb://alphared:PASSWORD_GOES_THERE@localhost:27099/
```

## RabbitMQ management

To manage RabbitMQ, simply open the [RabbitMQ Management Panel](http://localhost:15673/) and use the credentials from `users-transport/.env`.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
