import { Membership } from "@APP/domain/membership";
import { IMembership } from "@APP/types/IMembership";
import { Result } from "@APP/utils/result";

export namespace MembershipsUsecase {
    type GetListUsecase = () => Promise<Result.Ok<IMembership[]>>;
    export const getList: GetListUsecase = () => Membership.getList()();
}
