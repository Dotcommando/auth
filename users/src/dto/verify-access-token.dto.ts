import { PickType } from '@nestjs/swagger';

import { TokenDto } from './token.dto';


export class VerifyAccessTokenDto extends PickType(TokenDto, [ 'accessToken' ]) {}
