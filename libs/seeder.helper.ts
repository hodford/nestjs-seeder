import { BaseEntity, ObjectType } from 'typeorm';
import { SeederFactory } from './seeder.factory';
import { glob } from 'glob';
import { isString } from '@nestjs/common/utils/shared.utils';

const factories = {};

export function define<Entity>(entity: ObjectType<Entity>, callback: (options: any) => Entity) {
    factories[entity.toString()] = callback;
}

export function factory<Entity extends BaseEntity>(entity: ObjectType<Entity>) {
    return new SeederFactory<Entity>(factories[entity.toString()]);
}

export function scanFactories() {
    return new Promise<void>((resolve, reject) => {
        let rootPath = process.cwd();
        let path = `${rootPath}/**/databases/factories/*.factory.js`;
        if (rootPath.endsWith('src') || rootPath.endsWith('src/')) {
            path = `${rootPath}/**/databases/factories/*.factory.ts`; // Find better solution
        }
        new glob.Glob(path, {}, (error, files) => {
            if (error) {
                reject(error);
            } else {
                try {
                    for (let file of files) {
                        require(file);
                    }
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }
        });
    });
}

export async function runSeeder(seeder) {
    if (isString(seeder)) {
        let seed = require(seeder);
        await new seed().run();
    } else {
        await new seeder().run();
    }
}
