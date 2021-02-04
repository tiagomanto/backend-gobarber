import path from 'path'
import fs from 'fs';
import uploadConfig from '@config/upload';
import {inject, injectable} from 'tsyringe'

import User from '../infra/typeorm/entities/User'

import IUsersRepository from '../repositories/IUsersRepository'
import IStorageProvider from '@shared/container/providers/StorageProvider/models/IStorageProviders';
import AppError from '@shared/errors/AppError'

interface Request {
  user_id: string;
  avatarFilename: string;
}

@injectable()
class UpdateUserAvatarService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StorageProvider')
    private storageProvider: IStorageProvider
  ){}

  public async execute( { user_id, avatarFilename }:Request): Promise<User>{
    const user = await this.usersRepository.findById(user_id)

    if (!user){
       throw new AppError('Only athenticated users can change avatar ', 401)
    }

    if (user.avatar){
      await this.storageProvider.deleteFile(user.avatar);
      }
    const filename = await this.storageProvider.saveFile(avatarFilename);

    user.avatar = filename;

    await this.usersRepository.save(user)

    return user;
  }
}

export default UpdateUserAvatarService
