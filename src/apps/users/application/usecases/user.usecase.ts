import { UserRepository } from '../../domain';

const userRepository = new UserRepository();

export class UserHello {
  execute(test: string) {
    return userRepository.getHello(test);
  }
}
