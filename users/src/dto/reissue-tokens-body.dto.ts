import { PickType } from '@nestjs/swagger';

import { TokenDto } from './token.dto';


export class ReissueTokensBodyDto extends PickType(TokenDto, [ 'accessToken', 'refreshToken' ]) {}
