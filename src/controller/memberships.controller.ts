import core from "@nestia/core";
import * as nest from "@nestjs/common";

import { MembershipsUsecase } from "@APP/application/memberships.usecase";
import { IMembership } from "@APP/types/IMembership";
import { Result } from "@APP/utils/result";

@nest.Controller("memberships")
export class MembershipsController {
    /**
     * @summary 멤버십 목록 불러오기
     * @tag memberships
     * @return 활성화된 멤버십 목록
     */
    @core.TypedRoute.Get()
    async getList(): Promise<IMembership[]> {
        const result = await MembershipsUsecase.getList();
        return Result.Ok.flatten(result);
    }
}
