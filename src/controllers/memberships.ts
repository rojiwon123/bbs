import core from "@nestia/core";
import * as nest from "@nestjs/common";

import { Membership } from "@APP/app/membership";
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
        const result = await Membership.getList()();
        return Result.Ok.flatten(result);
    }
}
