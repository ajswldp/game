import "reflect-metadata";
import { createConnection, DataSourceOptions } from 'typeorm';
import { typeORMConfig } from "../config/typeorm";
import { HostEntity } from './host/entities/host.entity';
/*
createConnection(typeORMConfig as DataSourceOptions)
  .then(connection => {
    const host = new HostEntity();
    host.password = "ajswldp";
    host.name = "ajswl";
    return connection.manager.save(host)
      .then(host => {console.log(host)})

    // here you can start to work with your entities
  })
  .catch(error => console.log(error));
*/