import { Injectable } from "@nestjs/common";
import knex from "knex";
import * as config from '../../knexfile'

@Injectable()
export class DatabaseService{
    private db;

    
    constructor(){
        const environtment = process.env.NODE_ENV || 'development'
        this.db = knex(config[environtment])
    }

    get connection(){
        return this.db
    }
}