import core from "@nestia/core";
import * as nest from "@nestjs/common";

import { IMembership } from "@APP/types/IMembership";

@nest.Controller("memberships")
export class MembershipsController {
    /**
     * @summary 멤버십 목록 불러오기
     * @tag memberships
     * @return 활성화된 멤버십 목록
     */
    @core.TypedRoute.Get()
    getList(): Promise<IMembership[]> {
        throw Error();
    }
}
