import { PickType } from '@nestjs/swagger';

import { TokenDto } from './token.dto';


export class LogoutDto extends PickType(TokenDto, [ 'accessToken', 'refreshToken' ]) {}
